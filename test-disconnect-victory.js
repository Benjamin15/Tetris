#!/usr/bin/env node

/**
 * Test de notification de victoire par déconnexion
 * Simule deux joueurs, un qui se déconnecte pour donner la victoire à l'autre
 */

const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3002';

class TestPlayer {
  constructor(name) {
    this.name = name;
    this.socket = null;
    this.room = null;
    this.isConnected = false;
    this.hasWon = false;
    this.receivedDisconnectVictory = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      console.log(`🔌 ${this.name} - Connexion au serveur...`);
      
      this.socket = io(SERVER_URL, {
        transports: ['polling', 'websocket'],
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log(`✅ ${this.name} - Connecté avec ID: ${this.socket.id}`);
        this.isConnected = true;
        this.setupEventHandlers();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error(`❌ ${this.name} - Erreur de connexion:`, error.message);
        reject(error);
      });

      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error(`Timeout de connexion pour ${this.name}`));
        }
      }, 5000);
    });
  }

  setupEventHandlers() {
    // Événement de match trouvé
    this.socket.on('matchFound', (data) => {
      console.log(`🎯 ${this.name} - Match trouvé:`, data);
      this.room = data.roomId;
    });

    // Événement de début de partie
    this.socket.on('gameStart', (data) => {
      console.log(`🚀 ${this.name} - Début de partie:`, data);
    });

    // Événement de fin de partie
    this.socket.on('gameEnd', (data) => {
      console.log(`🏁 ${this.name} - Fin de partie:`, data);
      if (data.isWinner) {
        console.log(`🏆 ${this.name} - GAGNANT ! (raison: ${data.reason})`);
      } else {
        console.log(`💀 ${this.name} - PERDANT ! (raison: ${data.reason})`);
      }
    });

    // ÉVÉNEMENTS DE VICTOIRE SPÉCIFIQUES
    this.socket.on('Victory', (data) => {
      console.log(`🎉 ${this.name} - NOTIFICATION DE VICTOIRE REÇUE !`, data);
      this.hasWon = true;
      if (data.type === 'opponent_disconnect' || data.reason === 'opponent_disconnect') {
        this.receivedDisconnectVictory = true;
      }
    });

    this.socket.on('OpponentGameOver', (data) => {
      console.log(`💥 ${this.name} - Adversaire Game Over:`, data);
    });

    // Événements de déconnexion
    this.socket.on('opponentDisconnect', (data) => {
      console.log(`🔌 ${this.name} - Adversaire déconnecté:`, data);
    });
  }

  joinQueue() {
    console.log(`🔍 ${this.name} - Rejoindre la queue de matchmaking...`);
    this.socket.emit('joinQueue', {
      username: this.name
    });
  }

  disconnect() {
    if (this.socket) {
      console.log(`🔌 ${this.name} - Déconnexion...`);
      this.socket.disconnect();
    }
  }
}

async function testDisconnectVictory() {
  console.log('🧪 === TEST DE VICTOIRE PAR DÉCONNEXION ===\n');

  const player1 = new TestPlayer('StayingPlayer');
  const player2 = new TestPlayer('DisconnectingPlayer');

  try {
    // 1. Connexion des deux joueurs
    console.log('📡 Étape 1: Connexion des joueurs...');
    await player1.connect();
    await player2.connect();

    // 2. Rejoindre la queue
    console.log('\n🔍 Étape 2: Matchmaking...');
    player1.joinQueue();
    
    // Attendre un peu avant que le deuxième joueur rejoigne
    await new Promise(resolve => setTimeout(resolve, 1000));
    player2.joinQueue();

    // 3. Attendre que le match commence
    console.log('\n⏳ Étape 3: Attendre le début de partie...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 4. Player2 se déconnecte brutalement (Player1 devrait gagner)
    console.log('\n🔌 Étape 4: Player2 se déconnecte...');
    player2.disconnect();

    // 5. Attendre les notifications de victoire
    console.log('\n🎉 Étape 5: Vérification des notifications (attente 5s)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 6. Vérifier les résultats
    console.log('\n📊 === RÉSULTATS ===');
    console.log(`StayingPlayer a gagné: ${player1.hasWon}`);
    console.log(`StayingPlayer a reçu une victoire par déconnexion: ${player1.receivedDisconnectVictory}`);
    console.log(`DisconnectingPlayer a gagné: ${player2.hasWon}`);

    if (player1.hasWon && player1.receivedDisconnectVictory && !player2.hasWon) {
      console.log('✅ TEST RÉUSSI ! Les notifications de victoire par déconnexion fonctionnent !');
    } else {
      console.log('❌ TEST ÉCHOUÉ ! Les notifications de déconnexion ne fonctionnent pas correctement.');
      console.log('Détails:');
      console.log(`  - Player1 gagné: ${player1.hasWon}`);
      console.log(`  - Player1 victoire déconnexion: ${player1.receivedDisconnectVictory}`);
      console.log(`  - Player2 gagné: ${player2.hasWon}`);
    }

  } catch (error) {
    console.error('❌ Erreur pendant le test:', error.message);
  } finally {
    // Nettoyage
    console.log('\n🧹 Nettoyage...');
    player1.disconnect();
    
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
}

// Lancer le test
testDisconnectVictory().catch(console.error);
