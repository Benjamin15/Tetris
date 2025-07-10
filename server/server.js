const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Configuration CORS pour permettre les connexions depuis l'app mobile
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['polling', 'websocket'], // Prioriser polling pour React Native
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e6,
  // Configuration spécifique pour React Native
  allowRequest: (req, fn) => {
    console.log(`🔍 Connexion depuis: ${req.headers.origin || 'origine inconnue'}`);
    console.log(`🔍 User-Agent: ${req.headers['user-agent'] || 'inconnu'}`);
    fn(null, true); // Accepter toutes les connexions
  }
});

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

// Classes de gestion de jeu
class GameRoom {
  constructor(id) {
    this.id = id;
    this.players = new Map();
    this.gameState = 'waiting'; // waiting, starting, playing, finished
    this.startTime = null;
    this.winner = null;
    this.maxPlayers = 2;
  }

  addPlayer(player) {
    if (this.players.size >= this.maxPlayers) {
      return false;
    }
    
    this.players.set(player.id, player);
    player.roomId = this.id;
    
    if (this.players.size === this.maxPlayers) {
      this.startGame();
    }
    
    return true;
  }

  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      this.players.delete(playerId);
      
      // Si un joueur quitte pendant une partie, l'autre gagne
      if (this.gameState === 'playing' && this.players.size === 1) {
        const remainingPlayer = Array.from(this.players.values())[0];
        this.endGame(remainingPlayer.id, 'opponent_disconnect');
      }
    }
    return player;
  }

  startGame() {
    this.gameState = 'starting';
    this.startTime = Date.now();
    
    // Envoyer l'événement de début de partie à tous les joueurs
    this.players.forEach(player => {
      io.to(player.socketId).emit('gameStart', {
        roomId: this.id,
        players: Array.from(this.players.values()).map(p => ({
          id: p.id,
          username: p.username,
          isReady: true
        })),
        startTime: this.startTime
      });
    });

    // Démarrer le jeu après un countdown
    setTimeout(() => {
      this.gameState = 'playing';
      this.players.forEach(player => {
        io.to(player.socketId).emit('gameStateChange', {
          state: 'playing',
          message: 'Le combat commence !'
        });
      });
    }, 3000);
  }

  endGame(winnerId, reason = 'normal') {
    this.gameState = 'finished';
    this.winner = winnerId;

    const gameResult = {
      winner: winnerId,
      reason: reason,
      duration: Date.now() - this.startTime,
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        username: p.username,
        score: p.score || 0,
        lines: p.lines || 0,
        level: p.level || 1
      }))
    };

    // Trouver le gagnant et le perdant
    const winnerPlayer = this.players.get(winnerId);
    const loserPlayer = Array.from(this.players.values()).find(p => p.id !== winnerId);

    console.log(`🏁 GameRoom.endGame: ${winnerPlayer?.username} gagne contre ${loserPlayer?.username} (raison: ${reason})`);

    this.players.forEach(player => {
      const isWinner = player.id === winnerId;
      
      // Événement gameEnd classique
      io.to(player.socketId).emit('gameEnd', {
        ...gameResult,
        isWinner: isWinner
      });

      // Événements spécifiques pour la notification de victoire
      if (isWinner) {
        // Notifier le gagnant qu'il a gagné
        console.log(`🏆 Envoi de 'Victory' à ${player.username}`);
        io.to(player.socketId).emit('Victory', {
          type: 'victory',
          message: `Victoire ! ${loserPlayer?.username || 'Votre adversaire'} a perdu !`,
          opponentName: loserPlayer?.username,
          yourScore: player.score || 0,
          opponentScore: loserPlayer?.score || 0,
          duration: Date.now() - this.startTime,
          reason: reason
        });
      } else {
        // Optionnel: notifier le perdant de sa défaite (si nécessaire)
        console.log(`💀 ${player.username} a perdu contre ${winnerPlayer?.username}`);
      }
    });

    // Notifier le gagnant que l'adversaire a game over (événement supplémentaire)
    if (winnerPlayer && loserPlayer && reason === 'game_over') {
      console.log(`💥 Envoi de 'OpponentGameOver' à ${winnerPlayer.username}`);
      io.to(winnerPlayer.socketId).emit('OpponentGameOver', {
        opponentName: loserPlayer.username,
        opponentScore: loserPlayer.score || 0,
        duration: Date.now() - this.startTime
      });
    }
  }

  sendAttack(fromPlayerId, linesClearedInput) {
    const fromPlayer = this.players.get(fromPlayerId);
    console.log(`🎯 GameRoom.sendAttack: ${linesClearedInput} lignes supprimées par ${fromPlayer?.username || 'inconnu'}`);
    console.log(`📊 Joueurs dans room:`, Array.from(this.players.keys()));
    
    if (!fromPlayer || this.gameState !== 'playing') {
      console.log(`❌ Attaque ignorée - Joueur invalide ou jeu non en cours:`, { 
        player: !!fromPlayer, 
        gameState: this.gameState 
      });
      return;
    }

    // Calculer les lignes d'attaque selon les règles du jeu
    const attackMultiplier = {
      1: 1, // Simple = 1 ligne d'attaque
      2: 2, // Double = 2 lignes d'attaque
      3: 3, // Triple = 3 lignes d'attaque
      4: 4, // Tetris = 4 lignes d'attaque
    };
    
    const attackLines = attackMultiplier[linesClearedInput] || 0;
    console.log(`⚡ Conversion: ${linesClearedInput} lignes supprimées → ${attackLines} lignes d'attaque`);
    
    if (attackLines === 0) {
      console.log(`⚪ Pas d'attaque envoyée (${linesClearedInput} lignes ne génèrent pas d'attaque)`);
      return;
    }

    // Envoyer l'attaque à tous les autres joueurs de la room
    this.players.forEach((player, playerId) => {
      if (playerId !== fromPlayerId) {
        console.log(`📤 Envoi attaque de ${attackLines} lignes à ${player.username} (${playerId})`);
        io.to(player.socketId).emit('attackReceived', {
          from: fromPlayer.username,
          lines: attackLines,
          timestamp: Date.now()
        });
      }
    });
    
    console.log(`✅ Attaque de ${attackLines} lignes envoyée à ${this.players.size - 1} adversaire(s)`);
  }

  updatePlayerStats(playerId, stats) {
    const player = this.players.get(playerId);
    if (player) {
      Object.assign(player, stats);
      
      // Vérifier si le joueur a perdu
      if (stats.isGameOver && this.gameState === 'playing') {
        // Trouver le gagnant (l'autre joueur)
        const winner = Array.from(this.players.values()).find(p => p.id !== playerId);
        if (winner) {
          this.endGame(winner.id, 'knockout');
        }
      }
    }
  }

  broadcastGameState() {
    if (this.gameState === 'playing') {
      const gameState = {
        players: Array.from(this.players.values()).map(p => ({
          id: p.id,
          username: p.username,
          score: p.score || 0,
          lines: p.lines || 0,
          level: p.level || 1,
          isGameOver: p.isGameOver || false
        })),
        timestamp: Date.now()
      };

      this.players.forEach(player => {
        io.to(player.socketId).emit('gameUpdate', gameState);
      });
    }
  }
}

class MatchmakingManager {
  constructor() {
    this.waitingPlayers = [];
    this.activeRooms = new Map();
  }

  addPlayerToQueue(player) {
    // Supprimer le joueur de la queue s'il y est déjà
    this.removePlayerFromQueue(player.id);
    
    this.waitingPlayers.push(player);
    console.log(`Joueur ${player.username} ajouté à la queue. Queue: ${this.waitingPlayers.length}`);
    
    // Essayer de créer un match
    this.tryCreateMatch();
  }

  removePlayerFromQueue(playerId) {
    this.waitingPlayers = this.waitingPlayers.filter(p => p.id !== playerId);
  }

  tryCreateMatch() {
    if (this.waitingPlayers.length >= 2) {
      const player1 = this.waitingPlayers.shift();
      const player2 = this.waitingPlayers.shift();
      
      const roomId = uuidv4();
      const room = new GameRoom(roomId);
      
      room.addPlayer(player1);
      room.addPlayer(player2);
      
      this.activeRooms.set(roomId, room);
      
      // Notifier les joueurs qu'ils ont trouvé un match
      console.log(`📤 Envoi matchFound à ${player1.username} (${player1.socketId})`);
      io.to(player1.socketId).emit('matchFound', {
        roomId: roomId,
        opponent: {
          id: player2.id,
          username: player2.username
        }
      });
      
      console.log(`📤 Envoi matchFound à ${player2.username} (${player2.socketId})`);
      io.to(player2.socketId).emit('matchFound', {
        roomId: roomId,
        opponent: {
          id: player1.id,
          username: player1.username
        }
      });
      
      console.log(`✅ Match créé: ${player1.username} vs ${player2.username} dans room ${roomId}`);
    }
  }

  getRoom(roomId) {
    return this.activeRooms.get(roomId);
  }

  removeRoom(roomId) {
    this.activeRooms.delete(roomId);
  }

  removePlayerFromRoom(playerId) {
    for (const [roomId, room] of this.activeRooms) {
      const removedPlayer = room.removePlayer(playerId);
      if (removedPlayer) {
        // Si la room est vide, la supprimer
        if (room.players.size === 0) {
          this.removeRoom(roomId);
        }
        return room;
      }
    }
    return null;
  }
}

// Instance globale du gestionnaire de matchmaking
const matchmaker = new MatchmakingManager();

// Map des joueurs connectés
const connectedPlayers = new Map();

// Endpoint de santé pour tester la connectivité
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Serveur Tetris Battle Royale opérationnel',
    timestamp: new Date().toISOString(),
    connectedPlayers: connectedPlayers.size,
    activeRooms: matchmaker.activeRooms.size
  });
});

// Gestionnaire de connexions Socket.io
io.on('connection', (socket) => {
  console.log(`🔍 Connexion depuis: ${socket.handshake.headers.origin || 'origine inconnue'}`);
  console.log(`🔍 User-Agent: ${socket.handshake.headers['user-agent'] || 'inconnu'}`);
  console.log(`✅ Nouvelle connexion: ${socket.id}`);
  
  // Ajouter le joueur à la map des connectés
  connectedPlayers.set(socket.id, {
    id: socket.id,
    socketId: socket.id,
    connectedAt: new Date()
  });
  
  let currentPlayer = null;

  // Rejoindre la queue de matchmaking
  socket.on('joinQueue', (data) => {
    currentPlayer = {
      id: socket.id,
      socketId: socket.id,
      username: data.username || `Joueur${Math.floor(Math.random() * 1000)}`,
      score: 0,
      lines: 0,
      level: 1,
      isGameOver: false
    };
    
    matchmaker.addPlayerToQueue(currentPlayer);
    
    socket.emit('queueJoined', {
      position: matchmaker.waitingPlayers.length,
      estimatedWait: matchmaker.waitingPlayers.length * 5
    });
  });

  // Quitter la queue
  socket.on('leaveQueue', () => {
    if (currentPlayer) {
      matchmaker.removePlayerFromQueue(currentPlayer.id);
      socket.emit('queueLeft');
    }
  });

  // Événements de jeu
  socket.on('gameMove', (data) => {
    if (currentPlayer && currentPlayer.roomId) {
      const room = matchmaker.getRoom(currentPlayer.roomId);
      if (room) {
        // Relayer le mouvement aux autres joueurs
        socket.to(currentPlayer.roomId).emit('opponentMove', {
          playerId: currentPlayer.id,
          move: data
        });
      }
    }
  });

  socket.on('sendAttack', (data) => {
    console.log(`💥 Réception d'attaque de ${currentPlayer?.username || 'inconnu'}:`, data);
    if (currentPlayer && currentPlayer.roomId) {
      const room = matchmaker.getRoom(currentPlayer.roomId);
      if (room) {
        console.log(`🎯 Relais attaque dans room ${currentPlayer.roomId}`);
        room.sendAttack(currentPlayer.id, data.lines);
      } else {
        console.log(`❌ Room ${currentPlayer.roomId} non trouvée pour attaque`);
      }
    } else {
      console.log(`❌ Joueur non valide pour attaque:`, { player: currentPlayer?.id, room: currentPlayer?.roomId });
    }
  });

  // Alias pour l'événement attack (utilisé par certains clients)
  socket.on('attack', (data) => {
    if (currentPlayer && currentPlayer.roomId) {
      const room = matchmaker.getRoom(currentPlayer.roomId);
      if (room) {
        room.sendAttack(currentPlayer.id, data.lines);
      }
    }
  });

  socket.on('updateStats', (data) => {
    if (currentPlayer && currentPlayer.roomId) {
      const room = matchmaker.getRoom(currentPlayer.roomId);
      if (room) {
        room.updatePlayerStats(currentPlayer.id, data);
        room.broadcastGameState();
      }
    }
  });

  // Événement gameUpdate (alias pour updateStats)
  socket.on('gameUpdate', (data) => {
    if (currentPlayer && currentPlayer.roomId) {
      const room = matchmaker.getRoom(currentPlayer.roomId);
      if (room) {
        room.updatePlayerStats(currentPlayer.id, data);
        // Broadcast l'update aux autres joueurs
        socket.to(currentPlayer.roomId).emit('opponentMove', {
          playerId: currentPlayer.id,
          board: data.board,
          score: data.score,
          lines: data.lines,
          level: data.level
        });
      }
    }
  });

  // Événement joinRoom
  socket.on('joinRoom', (data) => {
    if (currentPlayer && data.roomId) {
      const room = matchmaker.getRoom(data.roomId);
      if (room && room.players.has(currentPlayer.id)) {
        currentPlayer.roomId = data.roomId;
        socket.join(data.roomId);
        console.log(`✅ Joueur ${currentPlayer.username} a rejoint la room ${data.roomId}`);
        
        socket.emit('roomJoined', {
          roomId: data.roomId,
          players: Array.from(room.players.values()).map(p => ({
            id: p.id,
            username: p.username
          }))
        });
      }
    }
  });

  // Événement gameEnd
  socket.on('gameEnd', (data) => {
    console.log(`💀 gameEnd reçu de ${currentPlayer?.username}:`, data);
    
    if (currentPlayer && currentPlayer.roomId) {
      const room = matchmaker.getRoom(currentPlayer.roomId);
      if (room && room.gameState === 'playing') {
        // Le joueur qui envoie gameEnd a PERDU
        // Le gagnant est l'autre joueur dans la room
        const allPlayers = Array.from(room.players.values());
        const otherPlayer = allPlayers.find(p => p.id !== currentPlayer.id);
        
        if (otherPlayer) {
          console.log(`🏆 ${currentPlayer.username} a perdu, ${otherPlayer.username} gagne !`);
          room.endGame(otherPlayer.id, data.isGameOver ? 'game_over' : (data.reason || 'manual'));
        } else {
          console.log(`❌ Pas d'adversaire trouvé pour ${currentPlayer.username}`);
        }
      }
    }
  });

  socket.on('playerReady', (data) => {
    if (currentPlayer && currentPlayer.roomId) {
      currentPlayer.isReady = true;
      socket.to(currentPlayer.roomId).emit('opponentReady', {
        playerId: currentPlayer.id
      });
    }
  });

  // Gestion de la déconnexion
  socket.on('disconnect', () => {
    console.log(`❌ Déconnexion: ${socket.id}`);
    
    // Retirer de la map des connectés
    connectedPlayers.delete(socket.id);
    
    if (currentPlayer) {
      // Retirer de la queue
      matchmaker.removePlayerFromQueue(currentPlayer.id);
      
      // Retirer de la room active
      const room = matchmaker.removePlayerFromRoom(currentPlayer.id);
      if (room) {
        // Notifier les autres joueurs de la déconnexion
        room.players.forEach(player => {
          io.to(player.socketId).emit('opponentDisconnect', {
            playerId: currentPlayer.id,
            username: currentPlayer.username
          });
        });
      }
    }
  });
});

// Routes API pour le statut du serveur
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    players: matchmaker.waitingPlayers.length,
    activeGames: matchmaker.activeRooms.size,
    uptime: process.uptime()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`🎮 Serveur Tetris Battle Royale démarré sur le port ${PORT}`);
  console.log(`📊 Status: http://localhost:${PORT}/status`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  console.log('Arrêt du serveur...');
  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});
