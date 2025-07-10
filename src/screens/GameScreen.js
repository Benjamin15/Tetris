import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { GestureHandlerRootView, TapGestureHandler, State } from 'react-native-gesture-handler';
import GameBoard from '../components/GameBoard';
import ScoreBoard from '../components/ScoreBoard';
import TouchControls from '../components/TouchControls';
import { TetrisEngine } from '../game/TetrisEngine';
import { BattleRoyaleManager } from '../game/BattleRoyaleManager';
import SocketManager from '../multiplayer/SocketManager';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameScreen = ({ onNavigate, config }) => {
  const [gameState, setGameState] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [opponentBoard, setOpponentBoard] = useState(null);
  const [opponentStats, setOpponentStats] = useState(null);
  const [battleManager, setBattleManager] = useState(null);
  const [victoryData, setVictoryData] = useState(null); // Nouvelle state pour la victoire
  const gameEngine = useRef(null);
  const gameLoop = useRef(null);
  const lastUpdateTime = useRef(Date.now());
  
  // Déterminer le mode de jeu
  const isBattleRoyale = config?.isMultiplayer && config?.roomId;

  useEffect(() => {
    console.log('🎮 GameScreen initialisé avec config:', config);
    initializeGame();
    return () => {
      if (gameLoop.current) {
        clearInterval(gameLoop.current);
      }
    };
  }, [config]);

  const initializeGame = () => {
    console.log('🔧 Initialisation du jeu:', {
      mode: isBattleRoyale ? 'Battle Royale' : 'Solo',
      roomId: config?.roomId,
      opponent: config?.opponent?.name
    });

    if (isBattleRoyale) {
      console.log('🎯 Mode Battle Royale activé');
      
      // Créer le gestionnaire Battle Royale
      const manager = new BattleRoyaleManager(
        SocketManager,
        handleGameUpdate,
        handleGameOver,
        handleAttackReceived,
        handleOpponentUpdate,
        handleVictory // Nouvelle callback pour la victoire
      );
      
      setBattleManager(manager);
      
      // Initialiser le moteur local avec les callbacks Battle Royale
      gameEngine.current = manager.initializeLocalEngine();
      
      // Rejoindre la room
      manager.joinRoom(config.roomId);
      
    } else {
      // Mode solo classique
      gameEngine.current = new TetrisEngine(
        handleGameUpdate,
        handleGameOver,
        handleLinesClear
      );
    }

    startGameLoop();
  };

  const startGameLoop = () => {
    lastUpdateTime.current = Date.now();
    
    gameLoop.current = setInterval(() => {
      if (!isPaused && gameEngine.current && !gameEngine.current.isGameOver) {
        const currentTime = Date.now();
        const deltaTime = currentTime - lastUpdateTime.current;
        lastUpdateTime.current = currentTime;
        
        gameEngine.current.update(deltaTime);
      }
    }, 16); // 60 FPS
  };

  const handleGameUpdate = (newGameState) => {
    setGameState(newGameState);
  };

  const handleGameOver = () => {
    Alert.alert(
      'Game Over!',
      `Score final: ${gameState?.score || 0}`,
      [
        { text: 'Rejouer', onPress: initializeGame },
        { text: 'Menu', onPress: () => onNavigate('menu') }
      ]
    );
  };

  const handleLinesClear = (lines) => {
    console.log(`🎯 GameScreen.handleLinesClear appelée avec ${lines} lignes`);
    console.log(`🔍 Mode: ${isBattleRoyale ? 'Battle Royale' : 'Solo'}`);
    console.log(`🔍 BattleManager présent: ${!!battleManager}`);
    
    // En mode Battle Royale, les lignes sont gérées par le BattleRoyaleManager
    if (isBattleRoyale && battleManager) {
      console.log(`⚡ Lignes supprimées: ${lines} - Envoi d'attaque via BattleManager`);
      // Le BattleRoyaleManager gère automatiquement l'envoi d'attaques
      // MAIS il faut s'assurer que cette callback est bien appelée !
      console.warn('⚠️ Cette callback ne devrait PAS être appelée en mode Battle Royale !');
    } else {
      // Mode solo - pas d'attaque à envoyer
      console.log(`📊 Mode solo: ${lines} lignes supprimées`);
    }
  };

  const handleAttackReceived = (attackLines) => {
    console.log(`💥 Attaque reçue: ${attackLines} lignes`);
    if (gameEngine.current) {
      gameEngine.current.receiveAttack(attackLines);
    }
  };

  const handleOpponentUpdate = (opponentData) => {
    console.log('👤 Mise à jour adversaire:', opponentData);
    setOpponentBoard(opponentData.board);
    setOpponentStats({
      score: opponentData.score,
      lines: opponentData.lines,
      level: opponentData.level
    });
  };

  const handleVictory = (victoryInfo) => {
    console.log('🎉 Victoire reçue !', victoryInfo);
    setVictoryData(victoryInfo);
    
    // Arrêter le jeu
    setIsPaused(true);
    
    // Afficher l'alerte de victoire
    setTimeout(() => {
      Alert.alert(
        '🏆 VICTOIRE !',
        victoryInfo.message || 'Vous avez gagné !',
        [
          { text: 'Rejouer', onPress: () => {
            setVictoryData(null);
            onNavigate('lobby');
          }},
          { text: 'Menu', onPress: () => {
            setVictoryData(null);
            onNavigate('menu');
          }}
        ]
      );
    }, 500); // Petit délai pour que l'overlay apparaisse d'abord
  };

  const handleMove = (direction) => {
    if (gameEngine.current && !isPaused) {
      gameEngine.current.movePiece(direction);
    }
  };

  const handleRotate = () => {
    if (gameEngine.current && !isPaused) {
      gameEngine.current.rotatePieceOnBoard();
    }
  };

  const handleDrop = () => {
    if (gameEngine.current && !isPaused) {
      gameEngine.current.dropPiece();
    }
  };

  const handleTap = (event) => {
    if (event.nativeEvent.state === State.END) {
      handleRotate();
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  if (!gameState) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.gameContainer}>
        {/* Interface de jeu */}
        <View style={styles.gameInterface}>
          {/* Plateau de jeu principal */}
          <TapGestureHandler onHandlerStateChange={handleTap}>
            <View style={styles.gameboardContainer}>
              <GameBoard board={gameState.board} />
              
              {/* Overlay de pause */}
              {isPaused && (
                <View style={styles.pauseOverlay}>
                  <Text style={styles.pauseText}>PAUSE</Text>
                </View>
              )}
              
              {/* Overlay de game over */}
              {gameState.isGameOver && !victoryData && (
                <View style={styles.gameOverOverlay}>
                  <Text style={styles.gameOverText}>GAME OVER</Text>
                  <Text style={styles.finalScoreText}>
                    Score: {gameState.score.toLocaleString()}
                  </Text>
                </View>
              )}

              {/* Overlay de victoire */}
              {victoryData && (
                <View style={styles.victoryOverlay}>
                  <Text style={styles.victoryText}>🏆 VICTOIRE !</Text>
                  <Text style={styles.victoryMessage}>
                    {victoryData.message}
                  </Text>
                  {victoryData.yourScore && (
                    <Text style={styles.victoryScore}>
                      Votre score: {victoryData.yourScore.toLocaleString()}
                    </Text>
                  )}
                  {victoryData.opponentScore && (
                    <Text style={styles.victoryOpponentScore}>
                      Adversaire: {victoryData.opponentScore.toLocaleString()}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </TapGestureHandler>

          {/* Panneau latéral avec score et infos */}
          <View style={styles.sidePanel}>
            <ScoreBoard
              score={gameState.score}
              level={gameState.level}
              lines={gameState.lines}
              nextPiece={gameState.nextPiece}
              opponentBoard={opponentBoard}
            />
          </View>
        </View>

        {/* Contrôles tactiles */}
        <View style={styles.controlsContainer}>
          <TouchControls
            onMove={handleMove}
            onRotate={handleRotate}
            onDrop={handleDrop}
          />
        </View>

        {/* Bouton de pause */}
        <TapGestureHandler onHandlerStateChange={togglePause}>
          <View style={styles.pauseButton}>
            <Text style={styles.pauseButtonText}>
              {isPaused ? '▶' : '⏸'}
            </Text>
          </View>
        </TapGestureHandler>

        {/* Indicateur de mode */}
        <View style={styles.modeIndicator}>
          <Text style={styles.modeText}>
            {isBattleRoyale ? 'BATTLE ROYALE' : 
             config?.mode === 'training' ? 'TRAINING' : 'SOLO'}
          </Text>
          {isBattleRoyale && config?.opponent && (
            <Text style={styles.opponentText}>
              vs {config.opponent.name}
            </Text>
          )}
        </View>

        {/* Statistiques adversaire en mode Battle Royale */}
        {isBattleRoyale && opponentStats && (
          <View style={styles.opponentStats}>
            <Text style={styles.opponentStatsTitle}>Adversaire</Text>
            <Text style={styles.opponentStatsText}>Score: {opponentStats.score}</Text>
            <Text style={styles.opponentStatsText}>Lignes: {opponentStats.lines}</Text>
            <Text style={styles.opponentStatsText}>Niveau: {opponentStats.level}</Text>
          </View>
        )}
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
  gameInterface: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  gameboardContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sidePanel: {
    flex: 1,
    marginLeft: 10,
  },
  controlsContainer: {
    height: 180,
    backgroundColor: 'rgba(22, 33, 62, 0.2)',
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pauseText: {
    color: '#64ffda',
    fontSize: 32,
    fontWeight: 'bold',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  gameOverText: {
    color: '#ff6b6b',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  finalScoreText: {
    color: '#fff',
    fontSize: 18,
  },
  victoryOverlay: {
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
  victoryText: {
    color: '#64ffda',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
    textShadowColor: 'rgba(100, 255, 218, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  victoryMessage: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  victoryScore: {
    color: '#64ffda',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  victoryOpponentScore: {
    color: '#8892b0',
    fontSize: 14,
  },
  pauseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#16213e',
    borderWidth: 2,
    borderColor: '#64ffda',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButtonText: {
    color: '#64ffda',
    fontSize: 18,
  },
  modeIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#0e4a67',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modeText: {
    color: '#64ffda',
    fontSize: 12,
    fontWeight: 'bold',
  },
  opponentText: {
    color: '#8892b0',
    fontSize: 10,
    marginTop: 2,
  },
  opponentStats: {
    position: 'absolute',
    top: 120,
    left: 20,
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#0e4a67',
    borderRadius: 10,
    padding: 8,
    minWidth: 100,
  },
  opponentStatsTitle: {
    color: '#64ffda',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  opponentStatsText: {
    color: '#8892b0',
    fontSize: 9,
    marginBottom: 2,
  },
});

export default GameScreen;
