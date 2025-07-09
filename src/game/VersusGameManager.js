import { TetrisEngine } from './TetrisEngine';
import { calculateAttackLines } from '../utils/gameUtils';

export class VersusGameManager {
  constructor(onGameUpdate, onGameOver, onAttack) {
    this.player1Engine = null;
    this.player2Engine = null;
    this.gameState = 'waiting'; // 'waiting', 'countdown', 'playing', 'paused', 'finished'
    this.winner = null;
    this.attackQueue = {
      player1: [],
      player2: []
    };
    
    this.callbacks = {
      onGameUpdate,
      onGameOver,
      onAttack
    };
    
    this.gameLoop = null;
    this.lastUpdateTime = Date.now();
    
    this.initializePlayers();
  }
  
  initializePlayers() {
    // Initialiser le moteur du joueur 1
    this.player1Engine = new TetrisEngine(
      (gameState) => this.handlePlayer1Update(gameState),
      () => this.handlePlayer1GameOver(),
      (lines) => this.handlePlayer1LinesClear(lines)
    );
    
    // Initialiser le moteur du joueur 2
    this.player2Engine = new TetrisEngine(
      (gameState) => this.handlePlayer2Update(gameState),
      () => this.handlePlayer2GameOver(),
      (lines) => this.handlePlayer2LinesClear(lines)
    );
  }
  
  handlePlayer1Update(gameState) {
    this.processAttackQueue('player1');
    this.notifyGameUpdate();
  }
  
  handlePlayer2Update(gameState) {
    this.processAttackQueue('player2');
    this.notifyGameUpdate();
  }
  
  handlePlayer1GameOver() {
    this.winner = 'player2';
    this.gameState = 'finished';
    this.stopGameLoop();
    this.callbacks.onGameOver && this.callbacks.onGameOver('player1', this.getGameSummary());
  }
  
  handlePlayer2GameOver() {
    this.winner = 'player1';
    this.gameState = 'finished';
    this.stopGameLoop();
    this.callbacks.onGameOver && this.callbacks.onGameOver('player2', this.getGameSummary());
  }
  
  handlePlayer1LinesClear(lines) {
    if (lines >= 2) {
      const attackLines = calculateAttackLines(lines, this.player1Engine.level);
      this.sendAttack('player1', 'player2', attackLines);
    }
  }
  
  handlePlayer2LinesClear(lines) {
    if (lines >= 2) {
      const attackLines = calculateAttackLines(lines, this.player2Engine.level);
      this.sendAttack('player2', 'player1', attackLines);
    }
  }
  
  sendAttack(fromPlayer, toPlayer, lines) {
    this.attackQueue[toPlayer].push({
      lines,
      timestamp: Date.now(),
      fromPlayer
    });
    
    this.callbacks.onAttack && this.callbacks.onAttack(fromPlayer, toPlayer, lines);
  }
  
  processAttackQueue(player) {
    const queue = this.attackQueue[player];
    const engine = player === 'player1' ? this.player1Engine : this.player2Engine;
    
    while (queue.length > 0) {
      const attack = queue.shift();
      engine.addGarbageLines(attack.lines);
    }
  }
  
  startGame() {
    if (this.gameState !== 'waiting') return false;
    
    this.gameState = 'countdown';
    this.startCountdown();
    return true;
  }
  
  startCountdown() {
    let count = 3;
    this.notifyGameUpdate();
    
    const countdownInterval = setInterval(() => {
      count--;
      
      if (count === 0) {
        clearInterval(countdownInterval);
        this.gameState = 'playing';
        this.startGameLoop();
        this.notifyGameUpdate();
      } else {
        this.notifyGameUpdate();
      }
    }, 1000);
  }
  
  startGameLoop() {
    this.lastUpdateTime = Date.now();
    
    this.gameLoop = setInterval(() => {
      if (this.gameState === 'playing') {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;
        
        this.player1Engine.update(deltaTime);
        this.player2Engine.update(deltaTime);
      }
    }, 16); // 60 FPS
  }
  
  stopGameLoop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }
  
  pauseGame() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.notifyGameUpdate();
    }
  }
  
  resumeGame() {
    if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.lastUpdateTime = Date.now();
      this.notifyGameUpdate();
    }
  }
  
  // Contrôles joueur 1
  movePlayer1(direction) {
    if (this.gameState === 'playing' && this.player1Engine) {
      return this.player1Engine.movePiece(direction);
    }
    return false;
  }
  
  rotatePlayer1() {
    if (this.gameState === 'playing' && this.player1Engine) {
      return this.player1Engine.rotatePieceOnBoard();
    }
    return false;
  }
  
  dropPlayer1() {
    if (this.gameState === 'playing' && this.player1Engine) {
      this.player1Engine.dropPiece();
    }
  }
  
  // Contrôles joueur 2
  movePlayer2(direction) {
    if (this.gameState === 'playing' && this.player2Engine) {
      return this.player2Engine.movePiece(direction);
    }
    return false;
  }
  
  rotatePlayer2() {
    if (this.gameState === 'playing' && this.player2Engine) {
      return this.player2Engine.rotatePieceOnBoard();
    }
    return false;
  }
  
  dropPlayer2() {
    if (this.gameState === 'playing' && this.player2Engine) {
      this.player2Engine.dropPiece();
    }
  }
  
  notifyGameUpdate() {
    if (this.callbacks.onGameUpdate) {
      this.callbacks.onGameUpdate(this.getCompleteGameState());
    }
  }
  
  getCompleteGameState() {
    return {
      gameState: this.gameState,
      winner: this.winner,
      player1: this.player1Engine ? this.player1Engine.getGameState() : null,
      player2: this.player2Engine ? this.player2Engine.getGameState() : null,
      attacks: {
        player1Pending: this.attackQueue.player1.length,
        player2Pending: this.attackQueue.player2.length,
      }
    };
  }
  
  getGameSummary() {
    const p1State = this.player1Engine?.getGameState();
    const p2State = this.player2Engine?.getGameState();
    
    return {
      winner: this.winner,
      player1: {
        score: p1State?.score || 0,
        lines: p1State?.lines || 0,
        level: p1State?.level || 1,
      },
      player2: {
        score: p2State?.score || 0,
        lines: p2State?.lines || 0,
        level: p2State?.level || 1,
      },
      duration: Date.now() - this.gameStartTime,
    };
  }
  
  destroy() {
    this.stopGameLoop();
    this.player1Engine = null;
    this.player2Engine = null;
    this.attackQueue = { player1: [], player2: [] };
  }
}
