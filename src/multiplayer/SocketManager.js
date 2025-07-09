import io from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.gameRoom = null;
    this.playerId = null;
    this.callbacks = {
      onGameUpdate: null,
      onOpponentMove: null,
      onGameStart: null,
      onGameEnd: null,
      onOpponentDisconnect: null,
      onAttackReceived: null,
    };
  }

  connect(serverUrl = 'http://localhost:3001') {
    try {
      this.socket = io(serverUrl, {
        timeout: 5000,
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Connecté au serveur de jeu');
        this.isConnected = true;
        this.playerId = this.socket.id;
      });

      this.socket.on('disconnect', () => {
        console.log('Déconnecté du serveur');
        this.isConnected = false;
      });

      this.setupGameEvents();
      
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    }
  }

  setupGameEvents() {
    if (!this.socket) return;

    // Événements de matchmaking
    this.socket.on('roomJoined', (data) => {
      console.log('Salle rejointe:', data);
      this.gameRoom = data.roomId;
    });

    this.socket.on('opponentFound', (data) => {
      console.log('Adversaire trouvé:', data);
      if (this.callbacks.onOpponentFound) {
        this.callbacks.onOpponentFound(data.opponent);
      }
    });

    // Événements de jeu
    this.socket.on('gameStart', (data) => {
      console.log('Début de partie');
      if (this.callbacks.onGameStart) {
        this.callbacks.onGameStart(data);
      }
    });

    this.socket.on('opponentMove', (data) => {
      if (this.callbacks.onOpponentMove) {
        this.callbacks.onOpponentMove(data);
      }
    });

    this.socket.on('attackReceived', (data) => {
      console.log('Attaque reçue:', data.lines, 'lignes');
      if (this.callbacks.onAttackReceived) {
        this.callbacks.onAttackReceived(data.lines);
      }
    });

    this.socket.on('gameEnd', (data) => {
      console.log('Fin de partie:', data);
      if (this.callbacks.onGameEnd) {
        this.callbacks.onGameEnd(data);
      }
    });

    this.socket.on('opponentDisconnect', () => {
      console.log('Adversaire déconnecté');
      if (this.callbacks.onOpponentDisconnect) {
        this.callbacks.onOpponentDisconnect();
      }
    });
  }

  // Méthodes de matchmaking
  findMatch() {
    if (!this.isConnected) return false;
    
    this.socket.emit('findMatch', {
      playerId: this.playerId,
      rating: 1500, // TODO: Récupérer le vrai rating du joueur
    });
    
    return true;
  }

  cancelMatchmaking() {
    if (!this.isConnected) return;
    
    this.socket.emit('cancelMatchmaking', {
      playerId: this.playerId,
    });
  }

  // Méthodes de jeu
  sendGameUpdate(gameState) {
    if (!this.isConnected || !this.gameRoom) return;

    this.socket.emit('gameUpdate', {
      roomId: this.gameRoom,
      playerId: this.playerId,
      gameState: {
        board: gameState.board,
        score: gameState.score,
        level: gameState.level,
        lines: gameState.lines,
      },
    });
  }

  sendMove(moveType, moveData) {
    if (!this.isConnected || !this.gameRoom) return;

    this.socket.emit('playerMove', {
      roomId: this.gameRoom,
      playerId: this.playerId,
      moveType: moveType, // 'left', 'right', 'down', 'rotate', 'drop'
      moveData: moveData,
      timestamp: Date.now(),
    });
  }

  sendAttack(linesCount) {
    if (!this.isConnected || !this.gameRoom) return;

    this.socket.emit('attack', {
      roomId: this.gameRoom,
      playerId: this.playerId,
      lines: linesCount,
      timestamp: Date.now(),
    });
  }

  sendGameOver() {
    if (!this.isConnected || !this.gameRoom) return;

    this.socket.emit('gameOver', {
      roomId: this.gameRoom,
      playerId: this.playerId,
      timestamp: Date.now(),
    });
  }

  // Callbacks
  setCallback(eventName, callback) {
    if (this.callbacks.hasOwnProperty(`on${eventName}`)) {
      this.callbacks[`on${eventName}`] = callback;
    }
  }

  // Déconnexion
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.gameRoom = null;
      this.playerId = null;
    }
  }

  // Getters
  getConnectionStatus() {
    return this.isConnected;
  }

  getPlayerId() {
    return this.playerId;
  }

  getGameRoom() {
    return this.gameRoom;
  }
}

// Singleton pattern pour le gestionnaire de socket
const socketManager = new SocketManager();
export default socketManager;
