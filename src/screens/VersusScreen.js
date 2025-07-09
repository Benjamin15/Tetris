import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { GestureHandlerRootView, TapGestureHandler, State } from 'react-native-gesture-handler';
import GameBoard from '../components/GameBoard';
import VersusControls from '../components/VersusControls';
import { VersusGameManager } from '../game/VersusGameManager';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const VersusScreen = ({ onNavigate }) => {
  const [gameState, setGameState] = useState(null);
  const [winner, setWinner] = useState(null);
  const gameManager = useRef(null);

  useEffect(() => {
    initializeGame();
    return () => {
      if (gameManager.current) {
        gameManager.current.destroy();
      }
    };
  }, []);

  const initializeGame = () => {
    gameManager.current = new VersusGameManager(
      handleGameUpdate,
      handleGameOver,
      handleAttack
    );
    
    // Démarrer automatiquement le jeu
    setTimeout(() => {
      gameManager.current.startGame();
    }, 1000);
  };

  const handleGameUpdate = (newGameState) => {
    setGameState(newGameState);
  };

  const handleGameOver = (loser, summary) => {
    setWinner(summary.winner);
    Alert.alert(
      'Partie Terminée !',
      `${summary.winner === 'player1' ? 'Joueur 1' : 'Joueur 2'} gagne !\n\n` +
      `Joueur 1: ${summary.player1.score} pts\n` +
      `Joueur 2: ${summary.player2.score} pts`,
      [
        { text: 'Rejouer', onPress: initializeGame },
        { text: 'Menu', onPress: () => onNavigate('menu') }
      ]
    );
  };

  const handleAttack = (fromPlayer, toPlayer, lines) => {
    console.log(`${fromPlayer} attaque ${toPlayer} avec ${lines} lignes`);
  };

  // Contrôles Joueur 1 (gauche de l'écran)
  const handlePlayer1Move = (direction) => {
    gameManager.current?.movePlayer1(direction);
  };

  const handlePlayer1Rotate = () => {
    gameManager.current?.rotatePlayer1();
  };

  const handlePlayer1Drop = () => {
    gameManager.current?.dropPlayer1();
  };

  // Contrôles Joueur 2 (droite de l'écran)
  const handlePlayer2Move = (direction) => {
    gameManager.current?.movePlayer2(direction);
  };

  const handlePlayer2Rotate = () => {
    gameManager.current?.rotatePlayer2();
  };

  const handlePlayer2Drop = () => {
    gameManager.current?.dropPlayer2();
  };

  const renderCountdown = () => {
    if (gameState?.gameState !== 'countdown') return null;
    
    return (
      <View style={styles.countdownOverlay}>
        <Text style={styles.countdownText}>Prêts ?</Text>
        <Text style={styles.countdownNumber}>3</Text>
      </View>
    );
  };

  const renderGameInfo = () => {
    if (!gameState?.player1 || !gameState?.player2) return null;

    return (
      <View style={styles.gameInfo}>
        {/* Info Joueur 1 */}
        <View style={styles.playerInfo}>
          <Text style={styles.playerLabel}>JOUEUR 1</Text>
          <Text style={styles.scoreText}>{gameState.player1.score}</Text>
          <Text style={styles.levelText}>Niv. {gameState.player1.level}</Text>
          <Text style={styles.linesText}>{gameState.player1.lines} lignes</Text>
          {gameState.attacks.player1Pending > 0 && (
            <Text style={styles.attackText}>⚡ {gameState.attacks.player1Pending}</Text>
          )}
        </View>

        {/* VS */}
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
          {gameState.gameState === 'playing' && (
            <View style={styles.gameStatus}>
              <Text style={styles.statusText}>EN COURS</Text>
            </View>
          )}
        </View>

        {/* Info Joueur 2 */}
        <View style={styles.playerInfo}>
          <Text style={styles.playerLabel}>JOUEUR 2</Text>
          <Text style={styles.scoreText}>{gameState.player2.score}</Text>
          <Text style={styles.levelText}>Niv. {gameState.player2.level}</Text>
          <Text style={styles.linesText}>{gameState.player2.lines} lignes</Text>
          {gameState.attacks.player2Pending > 0 && (
            <Text style={styles.attackText}>⚡ {gameState.attacks.player2Pending}</Text>
          )}
        </View>
      </View>
    );
  };

  if (!gameState) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Préparation de la bataille...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.gameContainer}>
        {/* Informations de jeu */}
        {renderGameInfo()}

        {/* Zone de jeu double */}
        <View style={styles.gameArea}>
          {/* Joueur 1 - Côté gauche */}
          <View style={styles.playerSide}>
            <TapGestureHandler
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.END) {
                  handlePlayer1Rotate();
                }
              }}
            >
              <View style={styles.gameboardContainer}>
                <GameBoard 
                  board={gameState.player1?.board || []} 
                  isPlayer1={true}
                />
                
                {/* Overlay winner */}
                {winner === 'player1' && (
                  <View style={styles.winnerOverlay}>
                    <Text style={styles.winnerText}>VICTOIRE !</Text>
                  </View>
                )}
                
                {/* Overlay loser */}
                {winner === 'player2' && gameState.player1?.isGameOver && (
                  <View style={styles.loserOverlay}>
                    <Text style={styles.loserText}>DÉFAITE</Text>
                  </View>
                )}
              </View>
            </TapGestureHandler>
          </View>

          {/* Séparateur central */}
          <View style={styles.separator} />

          {/* Joueur 2 - Côté droit */}
          <View style={styles.playerSide}>
            <TapGestureHandler
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.END) {
                  handlePlayer2Rotate();
                }
              }}
            >
              <View style={styles.gameboardContainer}>
                <GameBoard 
                  board={gameState.player2?.board || []} 
                  isPlayer2={true}
                />
                
                {/* Overlay winner */}
                {winner === 'player2' && (
                  <View style={styles.winnerOverlay}>
                    <Text style={styles.winnerText}>VICTOIRE !</Text>
                  </View>
                )}
                
                {/* Overlay loser */}
                {winner === 'player1' && gameState.player2?.isGameOver && (
                  <View style={styles.loserOverlay}>
                    <Text style={styles.loserText}>DÉFAITE</Text>
                  </View>
                )}
              </View>
            </TapGestureHandler>
          </View>
        </View>

        {/* Contrôles tactiles */}
        <View style={styles.controlsContainer}>
          <VersusControls
            onPlayer1Move={handlePlayer1Move}
            onPlayer1Rotate={handlePlayer1Rotate}
            onPlayer1Drop={handlePlayer1Drop}
            onPlayer2Move={handlePlayer2Move}
            onPlayer2Rotate={handlePlayer2Rotate}
            onPlayer2Drop={handlePlayer2Drop}
          />
        </View>

        {/* Overlays */}
        {renderCountdown()}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#64ffda',
    fontSize: 18,
  },
  gameContainer: {
    flex: 1,
    paddingTop: 50,
  },
  gameInfo: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#16213e',
    marginHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0e4a67',
  },
  playerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  playerLabel: {
    color: '#64ffda',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelText: {
    color: '#8892b0',
    fontSize: 12,
  },
  linesText: {
    color: '#8892b0',
    fontSize: 12,
  },
  attackText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  vsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  vsText: {
    color: '#ff6b6b',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameStatus: {
    marginTop: 5,
  },
  statusText: {
    color: '#4ecdc4',
    fontSize: 10,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  playerSide: {
    flex: 1,
  },
  gameboardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  separator: {
    width: 2,
    backgroundColor: '#0e4a67',
    marginHorizontal: 5,
  },
  controlsContainer: {
    height: 120,
    backgroundColor: 'rgba(22, 33, 62, 0.3)',
  },
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  countdownText: {
    color: '#64ffda',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  countdownNumber: {
    color: '#ff6b6b',
    fontSize: 72,
    fontWeight: 'bold',
  },
  winnerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(100, 255, 218, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  winnerText: {
    color: '#64ffda',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loserOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loserText: {
    color: '#ff6b6b',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default VersusScreen;
