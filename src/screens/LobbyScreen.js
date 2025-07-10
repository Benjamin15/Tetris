import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import SocketManager from '../multiplayer/SocketManager';

const LobbyScreen = ({ onNavigate }) => {
  const [connectionState, setConnectionState] = useState('connecting'); // connecting, connected, error
  const [isSearching, setIsSearching] = useState(false);
  const [opponent, setOpponent] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);
  const [gameRoom, setGameRoom] = useState(null);
  
  // Ref pour stocker les données du match de manière fiable
  const matchDataRef = useRef({ roomId: null, opponent: null });

  useEffect(() => {
    connectToServer();
    return () => {
      cleanup();
    };
  }, []);

  const connectToServer = async () => {
    try {
      setConnectionState('connecting');
      
      // Connecter au serveur avec détection automatique
      const connected = await SocketManager.connect(); // Utilise automatiquement la bonne URL
      
      if (connected) {
        // Attendre la connexion
        setTimeout(() => {
          if (SocketManager.getConnectionStatus()) {
            setConnectionState('connected');
            setupSocketCallbacks();
          } else {
            setConnectionState('error');
          }
        }, 2000);
      } else {
        setConnectionState('error');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setConnectionState('error');
    }
  };

  const setupSocketCallbacks = () => {
    console.log('🔧 Configuration des callbacks SocketManager...');
    
    SocketManager.setCallback('MatchFound', (data) => {
      console.log('🎉 Match trouvé reçu dans LobbyScreen:', data);
      
      // Stocker les données de manière fiable
      matchDataRef.current = {
        roomId: data.roomId,
        opponent: data.opponent
      };
      
      setOpponent({
        name: data.opponent.username,
        rating: 1500,
        avatar: '🎮'
      });
      console.log('🔄 Changement état: isSearching false, opponent:', data.opponent.username);
      setIsSearching(false);
      setGameRoom(data.roomId);
      startCountdown();
    });

    SocketManager.setCallback('QueueJoined', (data) => {
      console.log('Queue rejointe:', data);
      setQueueInfo(data);
    });

    SocketManager.setCallback('QueueLeft', () => {
      console.log('Queue quittée');
      setQueueInfo(null);
    });
  };

  const startCountdown = () => {
    let count = 5;
    setCountdown(count);

    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);

      if (count === 0) {
        clearInterval(countdownInterval);
        startGame();
      }
    }, 1000);
  };

  const cleanup = () => {
    console.log('🧹 Nettoyage LobbyScreen');
    if (isSearching) {
      console.log('🚫 Quitter la queue de recherche');
      SocketManager.leaveQueue();
    }
    // Ne pas déconnecter le socket si on va vers le jeu
    // SocketManager.disconnect();
  };

  const startSearch = () => {
    if (connectionState !== 'connected') {
      Alert.alert('Erreur', 'Pas de connexion au serveur');
      return;
    }
    
    setIsSearching(true);
    setOpponent(null);
    setCountdown(null);
    
    // Rejoindre la queue sur le serveur
    const username = `Joueur${Math.floor(Math.random() * 10000)}`;
    SocketManager.joinQueue({ username });
  };

  const cancelSearch = () => {
    setIsSearching(false);
    setOpponent(null);
    setCountdown(null);
    setQueueInfo(null);
    
    if (connectionState === 'connected') {
      SocketManager.leaveQueue();
    }
  };

  const startGame = () => {
    console.log('🎮 Démarrage du jeu Battle Royale');
    console.log('🎯 Room ID:', matchDataRef.current.roomId);
    console.log('👥 Adversaire:', matchDataRef.current.opponent?.username);
    
    // Vérifier que nous avons les données nécessaires
    if (!matchDataRef.current.roomId || !matchDataRef.current.opponent) {
      console.error('❌ Données de match manquantes:', matchDataRef.current);
      Alert.alert('Erreur', 'Impossible de démarrer le jeu. Données de match manquantes.');
      return;
    }
    
    // Naviguer vers l'écran de jeu avec les données du match
    onNavigate('battleRoyaleGame', {
      roomId: matchDataRef.current.roomId,
      opponent: matchDataRef.current.opponent,
      isMultiplayer: true
    });
  };

  const goBack = () => {
    onNavigate('menu');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>BATTLE ROYALE</Text>
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        {connectionState === 'connecting' && (
          <View style={styles.connectionContainer}>
            <ActivityIndicator size="large" color="#64ffda" />
            <Text style={styles.connectionText}>Connexion au serveur...</Text>
            <Text style={styles.connectionSubtext}>Préparation du matchmaking</Text>
          </View>
        )}

        {connectionState === 'error' && (
          <View style={styles.connectionContainer}>
            <Text style={styles.errorTitle}>❌ Connexion échouée</Text>
            <Text style={styles.errorText}>
              Impossible de se connecter au serveur.{'\n'}
              Vérifiez que le serveur est démarré sur le port 3002.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={connectToServer}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={goBack}
            >
              <Text style={styles.backButtonText}>Retour au Menu</Text>
            </TouchableOpacity>
          </View>
        )}

        {connectionState === 'connected' && !isSearching && !opponent && (
          <View style={styles.waitingContainer}>
            <Text style={styles.subtitle}>🟢 Connecté au serveur</Text>
            <Text style={styles.subtitle}>Prêt pour le combat ?</Text>
            <Text style={styles.description}>
              Affrontez un autre joueur en duel Tetris !{'\n'}
              Envoyez des lignes à votre adversaire en complétant les vôtres.
            </Text>
            
            <TouchableOpacity style={styles.searchButton} onPress={startSearch}>
              <Text style={styles.searchButtonText}>CHERCHER UN ADVERSAIRE</Text>
            </TouchableOpacity>
          </View>
        )}

        {connectionState === 'connected' && isSearching && (
          <View style={styles.searchingContainer}>
            <ActivityIndicator size="large" color="#64ffda" />
            <Text style={styles.searchingText}>Recherche d'un adversaire...</Text>
            <Text style={styles.searchingSubtext}>
              Nous cherchons un joueur de niveau similaire
            </Text>
            
            <TouchableOpacity style={styles.cancelButton} onPress={cancelSearch}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}

        {opponent && (
          <View style={styles.opponentFoundContainer}>
            <Text style={styles.opponentFoundText}>Adversaire trouvé !</Text>
            
            <View style={styles.opponentCard}>
              <Text style={styles.opponentAvatar}>{opponent.avatar}</Text>
              <Text style={styles.opponentName}>{opponent.name}</Text>
              <Text style={styles.opponentRating}>Rating: {opponent.rating}</Text>
            </View>

            {countdown !== null && (
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownText}>Début dans</Text>
                <Text style={styles.countdownNumber}>{countdown}</Text>
              </View>
            )}

            <View style={styles.battleInfo}>
              <Text style={styles.battleInfoText}>
                • Complétez des lignes pour attaquer{'\n'}
                • Les combos envoient plus de lignes{'\n'}
                • Survivez aux attaques adverses{'\n'}
                • Premier à mourir perd !
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Statistiques du joueur */}
      <View style={styles.playerStats}>
        <Text style={styles.statsTitle}>Vos statistiques</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statLabel}>Victoires:</Text>
          <Text style={styles.statValue}>12</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statLabel}>Défaites:</Text>
          <Text style={styles.statValue}>8</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statLabel}>Rating:</Text>
          <Text style={styles.statValue}>1456</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#64ffda',
    fontSize: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64ffda',
    marginRight: 50, // Compenser le bouton retour
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  waitingContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#8892b0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  searchButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderWidth: 2,
    borderColor: '#ff5252',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchingContainer: {
    alignItems: 'center',
  },
  searchingText: {
    fontSize: 20,
    color: '#64ffda',
    marginTop: 20,
    marginBottom: 10,
  },
  searchingSubtext: {
    fontSize: 14,
    color: '#8892b0',
    textAlign: 'center',
    marginBottom: 30,
  },
  cancelButton: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#0e4a67',
  },
  cancelButtonText: {
    color: '#8892b0',
    fontSize: 16,
  },
  opponentFoundContainer: {
    alignItems: 'center',
  },
  opponentFoundText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64ffda',
    marginBottom: 30,
  },
  opponentCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0e4a67',
    marginBottom: 30,
  },
  opponentAvatar: {
    fontSize: 48,
    marginBottom: 10,
  },
  opponentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  opponentRating: {
    fontSize: 16,
    color: '#64ffda',
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  countdownText: {
    fontSize: 18,
    color: '#8892b0',
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  battleInfo: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#0e4a67',
  },
  battleInfoText: {
    color: '#8892b0',
    fontSize: 14,
    lineHeight: 20,
  },
  playerStats: {
    backgroundColor: '#16213e',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0e4a67',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64ffda',
    marginBottom: 10,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statLabel: {
    color: '#8892b0',
    fontSize: 14,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  connectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  connectionText: {
    fontSize: 18,
    color: '#64ffda',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  connectionSubtext: {
    fontSize: 14,
    color: '#8892b0',
    textAlign: 'center',
    marginTop: 10,
  },
  errorTitle: {
    fontSize: 24,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#8892b0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#64ffda',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  retryButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LobbyScreen;
