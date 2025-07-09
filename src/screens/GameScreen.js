import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { GestureHandlerRootView, TapGestureHandler, State } from 'react-native-gesture-handler';
import GameBoard from '../components/GameBoard';
import ScoreBoard from '../components/ScoreBoard';
import TouchControls from '../components/TouchControls';
import { TetrisEngine } from '../game/TetrisEngine';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameScreen = ({ onNavigate, config }) => {
  const [gameState, setGameState] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [opponentBoard, setOpponentBoard] = useState(null);
  const gameEngine = useRef(null);
  const gameLoop = useRef(null);
  const lastUpdateTime = useRef(Date.now());

  useEffect(() => {
    initializeGame();
    return () => {
      if (gameLoop.current) {
        clearInterval(gameLoop.current);
      }
    };
  }, []);

  const initializeGame = () => {
    gameEngine.current = new TetrisEngine(
      handleGameUpdate,
      handleGameOver,
      handleLinesClear
    );

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
    // Dans le mode multijoueur, envoyer des lignes à l'adversaire
    if (config?.mode === 'multiplayer' && lines > 1) {
      const garbageLines = lines - 1;
      // TODO: Envoyer via socket
      console.log(`Envoi de ${garbageLines} lignes à l'adversaire`);
    }
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
              {gameState.isGameOver && (
                <View style={styles.gameOverOverlay}>
                  <Text style={styles.gameOverText}>GAME OVER</Text>
                  <Text style={styles.finalScoreText}>
                    Score: {gameState.score.toLocaleString()}
                  </Text>
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
            {config?.mode === 'multiplayer' ? 'BATTLE' : 
             config?.mode === 'training' ? 'TRAINING' : 'SOLO'}
          </Text>
        </View>
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
});

export default GameScreen;
