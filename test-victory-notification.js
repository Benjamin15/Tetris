#!/usr/bin/env node

/**
 * Test de notification de victoire
 * Simule deux joueurs, un qui fait game over pour déclencher la victoire de l'autre
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
        console.log(`🏆 ${this.name} - GAGNANT !`);
      } else {
        console.log(`💀 ${this.name} - PERDANT !`);
      }
    });

    // ÉVÉNEMENTS DE VICTOIRE SPÉCIFIQUES
    this.socket.on('Victory', (data) => {
      console.log(`🎉 ${this.name} - NOTIFICATION DE VICTOIRE REÇUE !`, data);
      this.hasWon = true;
    });

    this.socket.on('OpponentGameOver', (data) => {
      console.log(`💥 ${this.name} - Adversaire Game Over:`, data);
    });

    // Autres événements
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

  simulateGameOver() {
    console.log(`💀 ${this.name} - Simulation Game Over...`);
    this.socket.emit('gameEnd', {
      reason: 'game_over',
      isGameOver: true,
      finalScore: Math.floor(Math.random() * 10000)
    });
  }

  disconnect() {
    if (this.socket) {
      console.log(`🔌 ${this.name} - Déconnexion...`);
      this.socket.disconnect();
    }
  }
}

async function testVictoryNotification() {
  console.log('🧪 === TEST DE NOTIFICATION DE VICTOIRE ===\n');

  const player1 = new TestPlayer('TestPlayer1');
  const player2 = new TestPlayer('TestPlayer2');

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

    // 4. Simuler que Player2 fait game over (Player1 devrait gagner)
    console.log('\n💀 Étape 4: Player2 fait Game Over...');
    player2.simulateGameOver();

    // 5. Attendre les notifications de victoire
    console.log('\n🎉 Étape 5: Vérification des notifications...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 6. Vérifier les résultats
    console.log('\n📊 === RÉSULTATS ===');
    console.log(`Player1 a gagné: ${player1.hasWon}`);
    console.log(`Player2 a gagné: ${player2.hasWon}`);

    if (player1.hasWon && !player2.hasWon) {
      console.log('✅ TEST RÉUSSI ! Les notifications de victoire fonctionnent !');
    } else {
      console.log('❌ TEST ÉCHOUÉ ! Les notifications ne fonctionnent pas correctement.');
    }

  } catch (error) {
    console.error('❌ Erreur pendant le test:', error.message);
  } finally {
    // Nettoyage
    console.log('\n🧹 Nettoyage...');
    player1.disconnect();
    player2.disconnect();
    
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
}

// Lancer le test
testVictoryNotification().catch(console.error);
