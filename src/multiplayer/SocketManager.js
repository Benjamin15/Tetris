import io from 'socket.io-client';
import { Platform } from 'react-native';
import { getServerUrl, getSocketConfig, detectBestServerUrl } from '../utils/networkUtils';

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
      onMatchFound: null,
      onQueueJoined: null,
      onQueueLeft: null,
      onOpponentReady: null,
    };
  }

  async connect(serverUrl = null) {
    // Si déjà connecté, retourner true
    if (this.isConnected && this.socket) {
      console.log('✅ Déjà connecté au serveur');
      return true;
    }
    
    // Si une connexion est en cours, l'arrêter
    if (this.socket) {
      this.socket.disconnect();
    }

    try {
      // Détecter la meilleure URL si pas spécifiée
      const url = serverUrl || await detectBestServerUrl();
      
      console.log(`🌐 Tentative de connexion à: ${url}`);
      console.log(`📱 Plateforme: ${Platform.OS}`);
      
      // Configuration optimisée pour la plateforme
      const config = getSocketConfig(url);
      console.log('🔧 Configuration Socket.io:', {
        transports: config.transports,
        timeout: config.timeout,
        upgrade: config.upgrade
      });
      
      this.socket = io(url, config);

      this.socket.on('connect', () => {
        console.log('✅ Connecté au serveur de jeu');
        console.log(`🔗 Socket ID: ${this.socket.id}`);
        console.log(`🚀 Transport utilisé: ${this.socket.io.engine.transport.name}`);
        this.isConnected = true;
        this.playerId = this.socket.id;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Déconnecté du serveur:', reason);
        this.isConnected = false;
        this.playerId = null;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erreur de connexion:', error.message);
        console.error('Détails:', error);
        this.isConnected = false;
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnecté après', attemptNumber, 'tentatives');
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('❌ Erreur de reconnexion:', error.message);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Échec de reconnexion après toutes les tentatives');
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

    this.socket.on('matchFound', (data) => {
      console.log('📨 Événement matchFound reçu:', data);
      this.gameRoom = data.roomId;
      if (this.callbacks.onMatchFound) {
        console.log('🎯 Callback onMatchFound trouvé, exécution...');
        this.callbacks.onMatchFound(data);
      } else {
        console.log('❌ Callback onMatchFound non défini !');
      }
    });

    this.socket.on('queueJoined', (data) => {
      console.log('Queue rejointe:', data);
      if (this.callbacks.onQueueJoined) {
        this.callbacks.onQueueJoined(data);
      }
    });

    this.socket.on('queueLeft', () => {
      console.log('Queue quittée');
      if (this.callbacks.onQueueLeft) {
        this.callbacks.onQueueLeft();
      }
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

    this.socket.on('gameUpdate', (data) => {
      if (this.callbacks.onGameUpdate) {
        this.callbacks.onGameUpdate(data);
      }
    });

    this.socket.on('opponentReady', (data) => {
      console.log('Adversaire prêt:', data);
      if (this.callbacks.onOpponentReady) {
        this.callbacks.onOpponentReady(data);
      }
    });

    this.socket.on('opponentDisconnect', (data) => {
      console.log('Adversaire déconnecté:', data);
      if (this.callbacks.onOpponentDisconnect) {
        this.callbacks.onOpponentDisconnect(data);
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

  sendAttack(attackData) {
    if (!this.isConnected || !this.gameRoom) {
      console.log('❌ Impossible d\'envoyer attaque - Socket non connecté ou pas de room');
      console.log('État:', { connected: this.isConnected, room: this.gameRoom });
      return;
    }

    console.log('💥 Envoi d\'attaque via socket:', attackData);
    console.log('📡 Room:', this.gameRoom, 'Player:', this.playerId);
    
    this.socket.emit('sendAttack', {
      roomId: this.gameRoom,
      playerId: this.playerId,
      lines: attackData.lines || attackData,
      timestamp: Date.now(),
    });
    
    console.log('✅ Attaque envoyée au serveur');
  }

  joinRoom(roomId) {
    if (!this.isConnected) return;
    
    console.log('🎯 Rejoindre la room via socket:', roomId);
    this.gameRoom = roomId;
    this.socket.emit('joinRoom', { roomId });
  }

  sendGameUpdate(gameData) {
    if (!this.isConnected || !this.gameRoom) return;
    
    this.socket.emit('gameUpdate', {
      roomId: this.gameRoom,
      playerId: this.playerId,
      ...gameData
    });
  }

  sendGameEnd(endData) {
    if (!this.isConnected || !this.gameRoom) return;
    
    this.socket.emit('gameEnd', {
      roomId: this.gameRoom,
      playerId: this.playerId,
      ...endData
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

  // Nouvelles méthodes pour Battle Royale
  joinQueue(playerData) {
    if (!this.isConnected) return false;
    
    this.socket.emit('joinQueue', playerData);
    return true;
  }

  leaveQueue() {
    if (!this.isConnected) return;
    
    this.socket.emit('leaveQueue');
  }

  sendGameMove(moveData) {
    if (!this.isConnected || !this.gameRoom) return;
    
    this.socket.emit('gameMove', moveData);
  }

  updateStats(statsData) {
    if (!this.isConnected || !this.gameRoom) return;
    
    this.socket.emit('updateStats', statsData);
  }

  setPlayerReady() {
    if (!this.isConnected || !this.gameRoom) return;
    
    this.socket.emit('playerReady', { ready: true });
  }

  // Callbacks
  setCallback(eventName, callback) {
    // Si le nom d'événement commence déjà par "on", l'utiliser tel quel
    // Sinon, ajouter le préfixe "on"
    const callbackName = eventName.startsWith('on') ? eventName : `on${eventName}`;
    console.log(`🔧 setCallback: ${eventName} → ${callbackName}`);
    
    if (this.callbacks.hasOwnProperty(callbackName)) {
      this.callbacks[callbackName] = callback;
      console.log(`✅ Callback ${callbackName} défini avec succès`);
    } else {
      console.log(`❌ Callback ${callbackName} non trouvé dans:`, Object.keys(this.callbacks));
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
