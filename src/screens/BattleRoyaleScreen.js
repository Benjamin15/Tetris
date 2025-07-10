import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  Dimensions, 
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { GestureHandlerRootView, TapGestureHandler, State } from 'react-native-gesture-handler';
import GameBoard from '../components/GameBoard';
import TouchControls from '../components/TouchControls';
import ScoreBoard from '../components/ScoreBoard';
import SocketManager from '../multiplayer/SocketManager';
import BattleRoyaleManager from '../game/BattleRoyaleManager';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BattleRoyaleScreen = ({ onNavigate }) => {
  const [gameState, setGameState] = useState(null);
  const [connectionState, setConnectionState] = useState('connecting');
  const [username, setUsername] = useState('');
  const battleManager = useRef(null);

  useEffect(() => {
    initializeBattleRoyale();
    return () => {
      cleanup();
    };
  }, []);

  const initializeBattleRoyale = async () => {
    try {
      // Générer un nom d'utilisateur aléatoire
      const randomUsername = `Joueur${Math.floor(Math.random() * 10000)}`;
      setUsername(randomUsername);

      setConnectionState('connecting');

      // Vérifier si déjà connecté
      if (SocketManager.getConnectionStatus()) {
        console.log('Déjà connecté au serveur');
        setConnectionState('connected');
        initializeBattleManager(randomUsername);
        return;
      }

      // Connecter au serveur WebSocket avec détection automatique
      const connected = await SocketManager.connect(); // Utilise automatiquement la bonne URL
      
      if (connected) {
        // Attendre la connexion avec timeout plus long
        let attempts = 0;
        const maxAttempts = 15; // 15 secondes
        
        const checkConnection = () => {
          if (SocketManager.getConnectionStatus()) {
            console.log('✅ WebSocket connecté');
            setConnectionState('connected');
            initializeBattleManager(randomUsername);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkConnection, 1000);
          } else {
            console.error('❌ Timeout de connexion WebSocket');
            setConnectionState('error');
          }
        };
        
        setTimeout(checkConnection, 2000);
      } else {
        setConnectionState('error');
      }
    } catch (error) {
      console.error('Erreur d\'initialisation:', error);
      setConnectionState('error');
    }
  };

  const initializeBattleManager = (playerUsername) => {
    // Initialiser le gestionnaire de bataille
    battleManager.current = new BattleRoyaleManager(
      SocketManager,
      handleGameUpdate,
      handleGameOver,
      handleAttackReceived
    );
    
    // Démarrer la recherche de match
    startMatchmaking(playerUsername);
  };

  const startMatchmaking = (playerUsername) => {
    if (battleManager.current) {
      battleManager.current.startMatchmaking(playerUsername);
    }
  };

  const handleGameUpdate = (newGameState) => {
    setGameState(newGameState);
  };

  const handleGameOver = (loser, summary) => {
    Alert.alert(
      summary.isVictory ? '🎉 VICTOIRE !' : '💀 DÉFAITE',
      summary.isVictory 
        ? `Félicitations ${username} !\nVous avez remporté le combat !`
        : `Dommage ${username}...\nVotre adversaire l'emporte cette fois.`,
      [
        { 
          text: 'Nouvelle Bataille', 
          onPress: () => {
            cleanup();
            initializeBattleRoyale();
          }
        },
        { text: 'Menu Principal', onPress: () => onNavigate('menu') }
      ]
    );
  };

  const handleAttackReceived = (fromPlayer, toPlayer, lines) => {
    console.log(`💥 Attaque reçue : ${lines} lignes !`);
  };

  const cleanup = () => {
    if (battleManager.current) {
      battleManager.current.destroy();
      battleManager.current = null;
    }
    SocketManager.disconnect();
  };

  // Contrôles de jeu
  const handleMove = (direction) => {
    if (battleManager.current && gameState?.gameState === 'playing') {
      if (direction === 'left') {
        battleManager.current.moveLeft();
      } else if (direction === 'right') {
        battleManager.current.moveRight();
      }
    }
  };

  const handleRotate = () => {
    if (battleManager.current && gameState?.gameState === 'playing') {
      battleManager.current.rotate();
    }
  };

  const handleDrop = () => {
    if (battleManager.current && gameState?.gameState === 'playing') {
      battleManager.current.drop();
    }
  };

  // Interface selon l'état de connexion
  const renderConnectionState = () => {
    switch (connectionState) {
      case 'connecting':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#64ffda" />
            <Text style={styles.statusText}>Connexion au serveur...</Text>
            <Text style={styles.statusSubtext}>Préparation du combat</Text>
          </View>
        );
      
      case 'error':
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.errorTitle}>❌ Connexion échouée</Text>
            <Text style={styles.errorText}>
              Impossible de se connecter au serveur.
              {'\n\n'}Vérifications nécessaires :
              {'\n'}• Serveur démarré : cd server && npm start
              {'\n'}• Port 3002 disponible
              {'\n'}• Réseau accessible
              {'\n\n'}Pour déboguer :
              {'\n'}curl http://localhost:3002/health
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={initializeBattleRoyale}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => onNavigate('menu')}
            >
              <Text style={styles.backButtonText}>Retour au Menu</Text>
            </TouchableOpacity>
          </View>
        );
      
      default:
        return null;
    }
  };

  // Interface selon l'état du jeu
  const renderGameState = () => {
    if (!gameState) return null;

    switch (gameState.gameState) {
      case 'matchmaking':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#64ffda" />
            <Text style={styles.statusText}>🔍 Recherche d'adversaire...</Text>
            <Text style={styles.statusSubtext}>Utilisateur: {username}</Text>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                battleManager.current?.cancelMatchmaking();
                onNavigate('menu');
              }}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        );

      case 'starting':
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.countdownTitle}>⚔️ COMBAT TROUVÉ !</Text>
            <Text style={styles.opponentText}>
              VS {gameState.opponent?.username || 'Adversaire'}
            </Text>
            <Text style={styles.countdownText}>Préparation...</Text>
          </View>
        );

      case 'playing':
        return renderGameplay();

      case 'finished':
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Partie terminée</Text>
          </View>
        );

      default:
        return null;
    }
  };

  const renderGameplay = () => {
    if (!gameState.localBoard) return null;

    return (
      <View style={styles.gameplayContainer}>
        {/* Header avec informations des joueurs */}
        <View style={styles.playersHeader}>
          <View style={styles.playerInfoLocal}>
            <Text style={styles.playerNameLocal}>⚡ {username}</Text>
            <Text style={styles.playerStatsLocal}>
              {gameState.localPlayer?.score || 0} pts
            </Text>
          </View>
          
          <View style={styles.vsIndicator}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          
          <View style={styles.playerInfoOpponent}>
            <Text style={styles.playerNameOpponent}>
              {gameState.opponent?.username || 'Adversaire'} ⚡
            </Text>
            <Text style={styles.playerStatsOpponent}>
              {gameState.opponent?.score || 0} pts
            </Text>
          </View>
        </View>

        {/* Zone de jeu principale */}
        <View style={styles.gameArea}>
          {/* Plateau de jeu */}
          <TapGestureHandler
            onHandlerStateChange={(event) => {
              if (event.nativeEvent.state === State.END) {
                handleRotate();
              }
            }}
          >
            <View style={styles.gameboardContainer}>
              <GameBoard board={gameState.localBoard} />
            </View>
          </TapGestureHandler>

          {/* Informations de jeu */}
          <View style={styles.gameInfo}>
            <ScoreBoard
              score={gameState.localPlayer?.score || 0}
              lines={gameState.localPlayer?.lines || 0}
              level={gameState.localPlayer?.level || 1}
              nextPiece={gameState.localNextPiece}
            />
          </View>
        </View>

        {/* Contrôles */}
        <View style={styles.controlsContainer}>
          <TouchControls
            onMove={handleMove}
            onRotate={handleRotate}
            onDrop={handleDrop}
          />
        </View>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Titre */}
      <View style={styles.header}>
        <Text style={styles.title}>⚔️ BATTLE ROYALE</Text>
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        {connectionState !== 'connected' ? renderConnectionState() : renderGameState()}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#0e4a67',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64ffda',
    textShadowColor: '#0e4a67',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  statusText: {
    fontSize: 20,
    color: '#64ffda',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  statusSubtext: {
    fontSize: 16,
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
  backButton: {
    backgroundColor: '#16213e',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0e4a67',
  },
  backButtonText: {
    color: '#8892b0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 30,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  countdownTitle: {
    fontSize: 28,
    color: '#64ffda',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  opponentText: {
    fontSize: 20,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  countdownText: {
    fontSize: 18,
    color: '#8892b0',
    textAlign: 'center',
  },
  gameplayContainer: {
    flex: 1,
  },
  playersHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#16213e',
    borderBottomWidth: 2,
    borderBottomColor: '#0e4a67',
    alignItems: 'center',
  },
  playerInfoLocal: {
    flex: 1,
    alignItems: 'flex-start',
  },
  playerInfoOpponent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  playerNameLocal: {
    fontSize: 16,
    color: '#64ffda',
    fontWeight: 'bold',
  },
  playerNameOpponent: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  playerStatsLocal: {
    fontSize: 14,
    color: '#8892b0',
    marginTop: 2,
  },
  playerStatsOpponent: {
    fontSize: 14,
    color: '#8892b0',
    marginTop: 2,
  },
  vsIndicator: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  vsText: {
    fontSize: 18,
    color: '#f0a000',
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  gameboardContainer: {
    flex: 1,
    alignItems: 'center',
  },
  gameInfo: {
    width: 120,
    marginLeft: 20,
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default BattleRoyaleScreen;
