import { TetrisEngine } from './TetrisEngine';
import { ATTACK, SCORING } from './constants';

export class BattleRoyaleManager {
  constructor(socketManager, onGameUpdate, onGameOver, onAttackReceived, onOpponentUpdate = null, onVictory = null) {
    this.socketManager = socketManager;
    this.onGameUpdate = onGameUpdate;
    this.onGameOver = onGameOver;
    this.onAttackReceived = onAttackReceived;
    this.onOpponentUpdate = onOpponentUpdate;
    this.onVictory = onVictory; // Nouvelle callback pour les notifications de victoire
    
    this.localEngine = null;
    this.gameState = 'waiting'; // waiting, matchmaking, starting, playing, finished
    this.opponentData = null;
    this.localPlayerData = {
      id: null,
      username: '',
      score: 0,
      lines: 0,
      level: 1,
      isGameOver: false
    };
    
    this.pendingAttacks = [];
    this.lastStatsUpdate = 0;
    
    this.setupSocketCallbacks();
  }

  setupSocketCallbacks() {
    // Callbacks du gestionnaire de socket (sans préfixe "on" car setCallback l'ajoute)
    this.socketManager.setCallback('MatchFound', (data) => {
      this.handleMatchFound(data);
    });

    this.socketManager.setCallback('GameStart', (data) => {
      this.handleGameStart(data);
    });

    this.socketManager.setCallback('GameEnd', (data) => {
      this.handleGameEnd(data);
    });

    this.socketManager.setCallback('AttackReceived', (lines) => {
      this.handleAttackReceived(lines);
    });

    this.socketManager.setCallback('OpponentMove', (data) => {
      this.handleOpponentMove(data);
    });

    this.socketManager.setCallback('OpponentDisconnect', () => {
      this.handleOpponentDisconnect();
    });

    this.socketManager.setCallback('GameUpdate', (data) => {
      this.handleGameUpdate(data);
    });

    // Nouveaux événements pour les notifications de victoire
    this.socketManager.setCallback('OpponentGameOver', (data) => {
      this.handleOpponentGameOver(data);
    });

    this.socketManager.setCallback('Victory', (data) => {
      this.handleVictory(data);
    });
  }

  // Initialiser le moteur de jeu local avec les callbacks appropriés
  initializeLocalEngine() {
    console.log('🔧 Initialisation du moteur local Battle Royale');
    
    this.localEngine = new TetrisEngine(
      (gameState) => this.handleLocalGameUpdate(gameState),
      () => this.handleLocalGameOver(),
      (lines) => this.handleLocalLinesClear(lines)
    );
    
    return this.localEngine;
  }

  // Rejoindre une room de jeu existante (après matchmaking)
  joinRoom(roomId) {
    console.log('🎯 Rejoindre la room:', roomId);
    
    // Synchroniser l'ID du joueur local
    this.localPlayerData.id = this.socketManager.playerId;
    console.log('🆔 ID joueur local défini:', this.localPlayerData.id);
    
    this.socketManager.joinRoom(roomId);
    this.gameState = 'playing';
    this.updateGameState();
  }

  // Gestionnaires pour le moteur local
  handleLocalGameUpdate(gameState) {
    // Mettre à jour l'état local
    this.localPlayerData.score = gameState.score;
    this.localPlayerData.lines = gameState.lines;
    this.localPlayerData.level = gameState.level;
    
    // Envoyer les stats à l'adversaire périodiquement
    const now = Date.now();
    if (now - this.lastStatsUpdate > 500) { // Toutes les 500ms
      this.sendStatsUpdate();
      this.lastStatsUpdate = now;
    }
    
    // Callback vers l'interface
    if (this.onGameUpdate) {
      this.onGameUpdate(gameState);
    }
  }

  handleLocalGameOver() {
    console.log('💀 Game Over local - Notifier le serveur');
    this.localPlayerData.isGameOver = true;
    this.gameState = 'finished';
    
    // Notifier le serveur que ce joueur a perdu
    this.socketManager.sendGameEnd({
      playerId: this.localPlayerData.id,
      finalScore: this.localPlayerData.score,
      reason: 'game_over',
      isGameOver: true
    });
    
    if (this.onGameOver) {
      this.onGameOver();
    }
  }

  handleLocalLinesClear(lines) {
    console.log(`🔥 BattleRoyaleManager.handleLocalLinesClear appelée avec ${lines} lignes`);
    console.log(`⚡ Lignes locales supprimées: ${lines}`);
    console.log(`📊 ATTACK constants:`, { linesRequired: ATTACK.linesRequired, multiplier: ATTACK.attackMultiplier });
    
    // Envoyer le nombre de lignes supprimées au serveur (qui calculera l'attaque)
    if (lines >= ATTACK.linesRequired) {
      console.log(`🚀 Envoi de ${lines} lignes supprimées au serveur (sera converti en attaque)`);
      this.socketManager.sendAttack({
        lines: lines, // Envoyer les lignes supprimées, pas l'attaque calculée
        source: this.localPlayerData.id
      });
    } else {
      console.log(`❌ Pas assez de lignes pour attaquer (${lines} < ${ATTACK.linesRequired})`);
    }
  }

  // Envoyer les statistiques à l'adversaire
  sendStatsUpdate() {
    this.socketManager.sendGameUpdate({
      playerId: this.localPlayerData.id,
      score: this.localPlayerData.score,
      lines: this.localPlayerData.lines,
      level: this.localPlayerData.level,
      board: this.localEngine ? this.localEngine.getBoard() : null,
      isGameOver: this.localPlayerData.isGameOver
    });
  }

  // Démarrer la recherche de match
  async startMatchmaking(username = '') {
    if (!this.socketManager.isConnected) {
      console.error('Socket non connecté');
      return false;
    }

    this.gameState = 'matchmaking';
    this.localPlayerData.username = username || `Joueur${Math.floor(Math.random() * 1000)}`;
    this.localPlayerData.id = this.socketManager.playerId; // Synchroniser l'ID
    
    console.log('🆔 ID joueur local défini:', this.localPlayerData.id);
    
    this.socketManager.joinQueue({
      username: this.localPlayerData.username
    });

    this.updateGameState();
    return true;
  }

  // Annuler la recherche de match
  cancelMatchmaking() {
    if (this.gameState === 'matchmaking') {
      this.socketManager.leaveQueue();
      this.gameState = 'waiting';
      this.updateGameState();
    }
  }

  // Gestionnaires d'événements Socket
  handleMatchFound(data) {
    console.log('Match trouvé:', data);
    this.opponentData = {
      id: data.opponent.id,
      username: data.opponent.username,
      score: 0,
      lines: 0,
      level: 1,
      isGameOver: false
    };
    
    this.gameState = 'starting';
    this.updateGameState();
  }

  handleGameStart(data) {
    console.log('Début de partie:', data);
    this.initializeLocalGame();
    this.gameState = 'playing';
    this.updateGameState();
  }

  handleGameEnd(data) {
    console.log('🏁 Fin de partie reçue du serveur:', data);
    this.gameState = 'finished';
    
    if (this.localEngine) {
      this.localEngine.destroy();
      this.localEngine = null;
    }

    if (this.onGameOver) {
      this.onGameOver(data.isWinner ? 'local' : 'opponent', {
        winner: data.isWinner ? 'local' : 'opponent',
        reason: data.reason,
        duration: data.duration,
        localPlayer: this.localPlayerData,
        opponent: this.opponentData,
        isVictory: data.isWinner
      });
    }
  }

  // Nouveau: Gérer la notification quand l'adversaire perd
  handleOpponentGameOver(data) {
    console.log('🎉 Adversaire Game Over - VICTOIRE !', data);
    
    if (this.opponentData) {
      this.opponentData.isGameOver = true;
    }
    
    // Déclencher la notification de victoire
    if (this.onVictory) {
      this.onVictory({
        type: 'opponent_game_over',
        message: `Victoire ! ${data.opponentName || 'Votre adversaire'} a perdu !`,
        opponentName: data.opponentName,
        yourScore: this.localPlayerData.score,
        opponentScore: data.opponentScore,
        duration: data.duration,
        reason: 'opponent_game_over'
      });
    }
  }

  // Nouveau: Gérer les notifications de victoire générales
  handleVictory(data) {
    console.log('🏆 Notification de victoire:', data);
    
    if (this.onVictory) {
      this.onVictory({
        type: 'victory',
        message: data.message || 'Victoire !',
        ...data
      });
    }
  }

  handleAttackReceived(lines) {
    console.log(`💥 Attaque reçue: ${lines} lignes`);
    
    // Appliquer directement l'attaque au moteur local
    if (this.localEngine && this.gameState === 'playing') {
      this.localEngine.receiveAttack(lines);
    } else {
      // Stocker l'attaque si le moteur n'est pas prêt
      this.pendingAttacks.push(lines);
    }
    
    // Notifier l'interface
    if (this.onAttackReceived) {
      this.onAttackReceived(lines);
    }
  }

  handleOpponentMove(data) {
    // Mettre à jour les données de l'adversaire
    if (this.opponentData && data.playerId === this.opponentData.id) {
      console.log('📊 Mise à jour adversaire:', data);
      
      // Mettre à jour les stats locales
      this.opponentData.score = data.score || this.opponentData.score;
      this.opponentData.lines = data.lines || this.opponentData.lines;
      this.opponentData.level = data.level || this.opponentData.level;
      this.opponentData.isGameOver = data.isGameOver || this.opponentData.isGameOver;
      
      // Si l'adversaire a game over, déclencher la victoire
      if (data.isGameOver && !this.localPlayerData.isGameOver) {
        this.handleOpponentGameOver({
          opponentName: this.opponentData.username,
          opponentScore: this.opponentData.score,
          duration: Date.now() - this.gameStartTime
        });
      }
      
      // Notifier l'interface
      if (this.onOpponentUpdate) {
        this.onOpponentUpdate({
          board: data.board,
          score: this.opponentData.score,
          lines: this.opponentData.lines,
          level: this.opponentData.level,
          isGameOver: this.opponentData.isGameOver
        });
      }
    }
  }

  handleOpponentDisconnect() {
    console.log('🔌 Adversaire déconnecté - VICTOIRE par abandon !');
    
    if (this.gameState === 'playing') {
      // Victoire par abandon
      if (this.onVictory) {
        this.onVictory({
          type: 'opponent_disconnect',
          message: `Victoire ! ${this.opponentData?.username || 'Votre adversaire'} s'est déconnecté !`,
          reason: 'opponent_disconnect',
          opponentName: this.opponentData?.username,
          yourScore: this.localPlayerData.score,
          duration: Date.now() - this.gameStartTime
        });
      }
      
      this.handleGameEnd({
        isWinner: true,
        reason: 'opponent_disconnect',
        duration: Date.now() - this.gameStartTime
      });
    }
  }

  handleGameUpdate(data) {
    // Mettre à jour les données de l'adversaire
    if (data.players && this.opponentData) {
      const opponentUpdate = data.players.find(p => p.id === this.opponentData.id);
      if (opponentUpdate) {
        Object.assign(this.opponentData, opponentUpdate);
        this.updateGameState();
      }
    }
  }

  // Initialiser le moteur de jeu local
  initializeLocalGame() {
    if (!this.localEngine) {
      console.log('🔧 Initialisation du moteur local via initializeLocalGame');
      this.localEngine = new TetrisEngine(
        (gameState) => this.handleLocalGameUpdate(gameState),
        () => this.handleLocalGameOver(),
        (lines) => this.handleLocalLinesClear(lines)
      );
    }

    this.gameStartTime = Date.now();
    if (this.localEngine.startGame) {
      this.localEngine.startGame();
    }
  }

  // Mettre à jour l'état du jeu
  updateGameState() {
    const state = {
      gameState: this.gameState,
      localPlayer: { ...this.localPlayerData },
      opponent: this.opponentData ? { ...this.opponentData } : null,
      localBoard: this.localEngine ? this.localEngine.getBoard() : null,
      localCurrentPiece: this.localEngine ? this.localEngine.getCurrentPiece() : null,
      localNextPiece: this.localEngine ? this.localEngine.getNextPiece() : null,
      localGhostPiece: this.localEngine ? this.localEngine.getGhostPiece() : null,
    };

    if (this.onGameUpdate) {
      this.onGameUpdate(state);
    }
  }

  // Nettoyage
  destroy() {
    if (this.localEngine) {
      this.localEngine.destroy();
      this.localEngine = null;
    }
    
    if (this.gameState === 'matchmaking') {
      this.cancelMatchmaking();
    }
    
    this.gameState = 'waiting';
  }

  // Getters pour l'état
  isConnected() {
    return this.socketManager.isConnected;
  }

  getCurrentState() {
    return this.gameState;
  }

  getLocalPlayerData() {
    return { ...this.localPlayerData };
  }

  getOpponentData() {
    return this.opponentData ? { ...this.opponentData } : null;
  }
}

export default BattleRoyaleManager;
