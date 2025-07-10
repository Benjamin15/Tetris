#!/usr/bin/env node

/**
 * Test complet des attaques et victoires
 * Vérifie que les lignes supprimées sont converties en attaques ET que la victoire fonctionne
 */

const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3002';

class FullTestPlayer {
  constructor(name) {
    this.name = name;
    this.socket = null;
    this.room = null;
    this.isConnected = false;
    this.hasWon = false;
    this.attacksReceived = [];
    this.victoryReceived = false;
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

    // Événement d'attaque reçue
    this.socket.on('attackReceived', (lines) => {
      console.log(`💥 ${this.name} - ATTAQUE REÇUE: ${lines} lignes !`);
      this.attacksReceived.push(lines);
    });

    // Événement de fin de partie
    this.socket.on('gameEnd', (data) => {
      console.log(`🏁 ${this.name} - Fin de partie:`, data);
      if (data.isWinner) {
        console.log(`🏆 ${this.name} - GAGNANT !`);
        this.hasWon = true;
      } else {
        console.log(`💀 ${this.name} - PERDANT !`);
      }
    });

    // Événements de victoire
    this.socket.on('Victory', (data) => {
      console.log(`🎉 ${this.name} - NOTIFICATION DE VICTOIRE !`, data);
      this.victoryReceived = true;
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

  sendAttack(lines) {
    console.log(`⚔️  ${this.name} - Envoi d'attaque: ${lines} lignes supprimées`);
    this.socket.emit('attack', {
      lines: lines,
      source: this.socket.id
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

async function testAttacksAndVictory() {
  console.log('🧪 === TEST COMPLET: ATTAQUES + VICTOIRE ===\n');

  const attacker = new FullTestPlayer('AttackingPlayer');
  const defender = new FullTestPlayer('DefendingPlayer');

  try {
    // 1. Connexion des deux joueurs
    console.log('📡 Étape 1: Connexion des joueurs...');
    await attacker.connect();
    await defender.connect();

    // 2. Rejoindre la queue
    console.log('\n🔍 Étape 2: Matchmaking...');
    attacker.joinQueue();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    defender.joinQueue();

    // 3. Attendre que le match commence
    console.log('\n⏳ Étape 3: Attendre le début de partie...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 4. Test des attaques : attacker supprime 2 lignes
    console.log('\n⚔️  Étape 4: Test des attaques...');
    console.log('  📊 Attacker supprime 2 lignes...');
    attacker.sendAttack(2);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('  📊 Attacker supprime 4 lignes (Tetris)...');
    attacker.sendAttack(4);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Défendre fait game over (attacker devrait gagner)
    console.log('\n💀 Étape 5: Defender fait Game Over...');
    defender.simulateGameOver();

    // 6. Attendre les résultats
    console.log('\n🎉 Étape 6: Vérification des résultats...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 7. Analyse des résultats
    console.log('\n📊 === RÉSULTATS DÉTAILLÉS ===');
    console.log(`\n🎯 ATTAQUES:`);
    console.log(`  - Defender a reçu ${defender.attacksReceived.length} attaques`);
    console.log(`  - Attaques reçues: [${defender.attacksReceived.join(', ')}]`);
    
    console.log(`\n🏆 VICTOIRES:`);
    console.log(`  - Attacker a gagné: ${attacker.hasWon}`);
    console.log(`  - Attacker victoire notifiée: ${attacker.victoryReceived}`);
    console.log(`  - Defender a gagné: ${defender.hasWon}`);
    console.log(`  - Defender victoire notifiée: ${defender.victoryReceived}`);

    // 8. Validation
    let success = true;
    let issues = [];

    if (defender.attacksReceived.length === 0) {
      success = false;
      issues.push('❌ PROBLÈME: Aucune attaque reçue par le défenseur');
    } else if (defender.attacksReceived.length < 2) {
      success = false;
      issues.push('❌ PROBLÈME: Pas toutes les attaques reçues');
    } else {
      console.log('✅ Attaques envoyées et reçues correctement');
    }

    if (!attacker.hasWon) {
      success = false;
      issues.push('❌ PROBLÈME: L\'attaquant n\'a pas gagné');
    } else {
      console.log('✅ Logique de victoire correcte');
    }

    if (!attacker.victoryReceived) {
      success = false;
      issues.push('❌ PROBLÈME: Notification de victoire non reçue');
    } else {
      console.log('✅ Notification de victoire envoyée');
    }

    if (defender.hasWon || defender.victoryReceived) {
      success = false;
      issues.push('❌ PROBLÈME: Le perdant a reçu une victoire');
    } else {
      console.log('✅ Pas de fausse victoire pour le perdant');
    }

    console.log('\n🎯 === CONCLUSION ===');
    if (success) {
      console.log('🎉 ✅ TEST COMPLET RÉUSSI ! Attaques ET victoires fonctionnent parfaitement !');
    } else {
      console.log('❌ TEST ÉCHOUÉ ! Problèmes détectés :');
      issues.forEach(issue => console.log(`  ${issue}`));
    }

  } catch (error) {
    console.error('❌ Erreur pendant le test:', error.message);
  } finally {
    console.log('\n🧹 Nettoyage...');
    attacker.disconnect();
    defender.disconnect();
    
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
}

// Lancer le test
testAttacksAndVictory().catch(console.error);
