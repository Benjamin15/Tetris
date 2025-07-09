import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

const LobbyScreen = ({ onNavigate }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [opponent, setOpponent] = useState(null);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    // Simulation de recherche d'adversaire
    if (isSearching) {
      const searchTimeout = setTimeout(() => {
        // Simulation d'un adversaire trouvé
        setOpponent({
          name: 'Joueur2',
          rating: Math.floor(Math.random() * 2000) + 1000,
          avatar: '🎮'
        });
        setIsSearching(false);
      }, 3000);

      return () => clearTimeout(searchTimeout);
    }
  }, [isSearching]);

  useEffect(() => {
    // Démarrer le compte à rebours quand un adversaire est trouvé
    if (opponent && !countdown) {
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

      return () => clearInterval(countdownInterval);
    }
  }, [opponent]);

  const startSearch = () => {
    setIsSearching(true);
    setOpponent(null);
    setCountdown(null);
  };

  const cancelSearch = () => {
    setIsSearching(false);
    setOpponent(null);
    setCountdown(null);
  };

  const startGame = () => {
    onNavigate('game', { 
      mode: 'multiplayer',
      opponent: opponent
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
        {!isSearching && !opponent && (
          <View style={styles.waitingContainer}>
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

        {isSearching && (
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
});

export default LobbyScreen;
