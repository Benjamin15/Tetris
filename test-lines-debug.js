#!/usr/bin/env node

const io = require('socket.io-client');

async function testLinesAttack() {
  console.log('🧪 Test Spécifique - Envoi de Lignes d\'Attaque');
  console.log('==============================================\n');
  
  const serverUrl = 'http://localhost:3002';
  const player1 = io(serverUrl, { transports: ['polling'] });
  const player2 = io(serverUrl, { transports: ['polling'] });
  
  let roomId = null;
  let attacksReceived = [];
  
  // Player 1 setup
  player1.on('connect', () => {
    console.log('✅ Joueur 1 connecté');
    player1.emit('joinQueue', { username: 'AttackTester1' });
  });
  
  // Player 2 setup
  player2.on('connect', () => {
    console.log('✅ Joueur 2 connecté');
    setTimeout(() => {
      player2.emit('joinQueue', { username: 'AttackTester2' });
    }, 500);
  });
  
  // Match found events
  player1.on('matchFound', (data) => {
    console.log('🎯 Joueur 1 - Match trouvé, room:', data.roomId);
    roomId = data.roomId;
    player1.emit('joinRoom', { roomId: data.roomId });
  });
  
  player2.on('matchFound', (data) => {
    console.log('🎯 Joueur 2 - Match trouvé, room:', data.roomId);
    player2.emit('joinRoom', { roomId: data.roomId });
  });
  
  // Game start events
  player1.on('gameStart', () => {
    console.log('🚀 Joueur 1 - Partie démarrée');
    
    // Test de différents types d'attaques
    setTimeout(() => {
      console.log('\n💥 Joueur 1 - Test 1 ligne supprimée (simple)');
      player1.emit('sendAttack', {
        roomId: roomId,
        playerId: player1.id,
        lines: 1  // 1 ligne supprimée (sera converti côté serveur)
      });
    }, 4000); // Attendre que le jeu soit en 'playing'
    
    setTimeout(() => {
      console.log('💥 Joueur 1 - Test 2 lignes supprimées (double)');
      player1.emit('sendAttack', {
        roomId: roomId,
        playerId: player1.id,
        lines: 2  // 2 lignes supprimées (sera converti côté serveur)
      });
    }, 5000);
    
    setTimeout(() => {
      console.log('💥 Joueur 1 - Test 3 lignes supprimées (triple)');
      player1.emit('sendAttack', {
        roomId: roomId,
        playerId: player1.id,
        lines: 3  // 3 lignes supprimées (sera converti côté serveur)
      });
    }, 6000);
    
    setTimeout(() => {
      console.log('💥 Joueur 1 - Test 4 lignes supprimées (tetris)');
      player1.emit('sendAttack', {
        roomId: roomId,
        playerId: player1.id,
        lines: 4  // 4 lignes supprimées (sera converti côté serveur)
      });
    }, 7000);
  });
  
  player2.on('gameStart', () => {
    console.log('🚀 Joueur 2 - Partie démarrée');
  });
  
  // Attack received events
  player2.on('attackReceived', (data) => {
    console.log(`💥 Joueur 2 - ATTAQUE REÇUE:`, data);
    attacksReceived.push(data);
  });
  
  player1.on('attackReceived', (data) => {
    console.log(`💥 Joueur 1 - ATTAQUE REÇUE:`, data);
    attacksReceived.push(data);
  });
  
  // Analyse des résultats après 9 secondes
  setTimeout(() => {
    console.log('\n📊 RÉSULTATS DU TEST');
    console.log('===================');
    console.log(`Attaques envoyées: 4`);
    console.log(`Attaques reçues: ${attacksReceived.length}`);
    
    if (attacksReceived.length > 0) {
      console.log('\n✅ Détails des attaques reçues:');
      attacksReceived.forEach((attack, index) => {
        console.log(`  ${index + 1}. ${attack.lines} lignes de ${attack.from}`);
      });
    } else {
      console.log('\n❌ AUCUNE ATTAQUE REÇUE - Problème détecté !');
    }
    
    // Nettoyage
    player1.disconnect();
    player2.disconnect();
    process.exit(0);
  }, 9000);
}

testLinesAttack().catch(console.error);
