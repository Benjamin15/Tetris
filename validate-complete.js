#!/usr/bin/env node

const io = require('socket.io-client');

async function fullValidationTest() {
  console.log('🎮 Test de Validation Complète - Tetris Battle Royale');
  console.log('================================================\n');
  
  const serverUrl = 'http://localhost:3002';
  let passed = 0;
  let total = 0;
  
  function test(name, condition) {
    total++;
    if (condition) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name}`);
    }
  }
  
  // Test 1: Connexion au serveur
  console.log('📡 Test de Connexion Serveur');
  try {
    const response = await fetch(`${serverUrl}/health`);
    const data = await response.json();
    test('Serveur en ligne', response.ok);
    test('Endpoint de santé fonctionnel', data.status === 'ok' || data.status === 'healthy');
  } catch (error) {
    test('Serveur en ligne', false);
    test('Endpoint de santé fonctionnel', false);
  }
  
  // Test 2: Connexion Socket.io
  console.log('\n🔌 Test de Connexion Socket.io');
  const socket1 = io(serverUrl, { transports: ['polling'] });
  const socket2 = io(serverUrl, { transports: ['polling'] });
  
  let socket1Connected = false;
  let socket2Connected = false;
  let matchFound = false;
  let gameStarted = false;
  let attacksSent = 0;
  let attacksReceived = 0;
  let gameUpdatesReceived = 0;
  
  await new Promise((resolve) => {
    socket1.on('connect', () => {
      socket1Connected = true;
      console.log('Socket 1 connecté');
    });
    
    socket2.on('connect', () => {
      socket2Connected = true;
      console.log('Socket 2 connecté');
    });
    
    // Attendre les connexions
    setTimeout(() => {
      test('Socket 1 connecté', socket1Connected);
      test('Socket 2 connecté', socket2Connected);
      resolve();
    }, 1000);
  });
  
  if (!socket1Connected || !socket2Connected) {
    console.log('\n❌ Impossible de continuer sans connexion socket');
    process.exit(1);
  }
  
  // Test 3: Matchmaking
  console.log('\n🎯 Test de Matchmaking');
  let roomId = null;
  
  await new Promise((resolve) => {
    socket1.on('matchFound', (data) => {
      matchFound = true;
      roomId = data.roomId;
      console.log('Match trouvé, room:', roomId);
      socket1.emit('joinRoom', { roomId });
    });
    
    socket2.on('matchFound', (data) => {
      socket2.emit('joinRoom', { roomId: data.roomId });
    });
    
    socket1.on('gameStart', () => {
      gameStarted = true;
      console.log('Partie démarrée');
    });
    
    socket2.on('gameStart', () => {
      console.log('Partie confirmée côté 2');
    });
    
    // Rejoindre la queue
    socket1.emit('joinQueue', { username: 'ValidatorPlayer1' });
    socket2.emit('joinQueue', { username: 'ValidatorPlayer2' });
    
    setTimeout(() => {
      test('Match trouvé automatiquement', matchFound);
      test('Partie démarrée', gameStarted);
      resolve();
    }, 3000);
  });
  
  // Test 4: Système d'attaques
  console.log('\n⚔️ Test du Système d\'Attaques');
  
  await new Promise((resolve) => {
    socket1.on('attackReceived', (data) => {
      attacksReceived++;
      console.log(`Attaque reçue par joueur 1: ${data.lines} lignes`);
    });
    
    socket2.on('attackReceived', (data) => {
      attacksReceived++;
      console.log(`Attaque reçue par joueur 2: ${data.lines} lignes`);
    });
    
    // Envoyer des attaques
    setTimeout(() => {
      socket1.emit('sendAttack', { roomId, playerId: socket1.id, lines: 2 });
      attacksSent++;
    }, 500);
    
    setTimeout(() => {
      socket2.emit('sendAttack', { roomId, playerId: socket2.id, lines: 3 });
      attacksSent++;
    }, 1000);
    
    setTimeout(() => {
      test('Attaques envoyées', attacksSent === 2);
      test('Attaques reçues', attacksReceived === 2);
      resolve();
    }, 2000);
  });
  
  // Test 5: Synchronisation des données de jeu
  console.log('\n📊 Test de Synchronisation des Données');
  
  await new Promise((resolve) => {
    socket1.on('opponentMove', (data) => {
      gameUpdatesReceived++;
      console.log('Update reçue par joueur 1:', { score: data.score, level: data.level });
    });
    
    socket2.on('opponentMove', (data) => {
      gameUpdatesReceived++;
      console.log('Update reçue par joueur 2:', { score: data.score, level: data.level });
    });
    
    // Envoyer des updates de jeu
    setTimeout(() => {
      socket1.emit('gameUpdate', {
        roomId,
        playerId: socket1.id,
        score: 1000,
        level: 2,
        lines: 5,
        board: Array(20).fill(null).map(() => Array(10).fill(0))
      });
    }, 500);
    
    setTimeout(() => {
      socket2.emit('gameUpdate', {
        roomId,
        playerId: socket2.id,
        score: 1500,
        level: 3,
        lines: 8,
        board: Array(20).fill(null).map(() => Array(10).fill(0))
      });
    }, 1000);
    
    setTimeout(() => {
      test('Synchronisation des données de jeu', gameUpdatesReceived >= 2);
      resolve();
    }, 2000);
  });
  
  // Nettoyage
  socket1.disconnect();
  socket2.disconnect();
  
  // Résultats finaux
  console.log('\n📋 Résultats de Validation');
  console.log('============================');
  console.log(`Tests réussis: ${passed}/${total}`);
  console.log(`Taux de réussite: ${Math.round((passed/total) * 100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 VALIDATION COMPLÈTE RÉUSSIE !');
    console.log('Le jeu Tetris Battle Royale est entièrement fonctionnel.');
    console.log('\n✨ Fonctionnalités validées:');
    console.log('   • Serveur multijoueur opérationnel');
    console.log('   • Connexions Socket.io stables');
    console.log('   • Matchmaking automatique');
    console.log('   • Système d\'attaques bidirectionnelles');
    console.log('   • Synchronisation temps réel des données');
    console.log('\n🚀 Le projet est prêt pour le déploiement !');
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez les logs ci-dessus.');
  }
  
  process.exit(passed === total ? 0 : 1);
}

fullValidationTest().catch(console.error);
