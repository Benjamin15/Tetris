#!/usr/bin/env node

const io = require('socket.io-client');

async function testRealGameFlow() {
  console.log('🎮 Test du Flow Réel de Jeu');
  console.log('===========================\n');
  
  const serverUrl = 'http://localhost:3002';
  const player1 = io(serverUrl, { transports: ['polling'] });
  const player2 = io(serverUrl, { transports: ['polling'] });
  
  let roomId = null;
  let gameStarted = false;
  
  // Player 1 setup
  player1.on('connect', () => {
    console.log('✅ Joueur 1 connecté');
    player1.emit('joinQueue', { username: 'TestJoueur1' });
  });
  
  // Player 2 setup  
  player2.on('connect', () => {
    console.log('✅ Joueur 2 connecté');
    setTimeout(() => {
      player2.emit('joinQueue', { username: 'TestJoueur2' });
    }, 500);
  });
  
  // Match events
  player1.on('matchFound', (data) => {
    console.log('🎯 Match trouvé pour Joueur 1');
    roomId = data.roomId;
    player1.emit('joinRoom', { roomId });
  });
  
  player2.on('matchFound', (data) => {
    console.log('🎯 Match trouvé pour Joueur 2');
    player2.emit('joinRoom', { roomId: data.roomId });
  });
  
  // Game start
  player1.on('gameStart', () => {
    console.log('🚀 Joueur 1 - Jeu démarré');
    gameStarted = true;
    
    // Attendre que le jeu soit vraiment en mode 'playing' puis simuler une ligne supprimée
    setTimeout(() => {
      console.log('\n💡 Joueur 1 - Simulation: Suppression d\'1 ligne');
      player1.emit('sendAttack', {
        roomId: roomId,
        playerId: player1.id,
        lines: 1 // 1 ligne supprimée
      });
    }, 4000); // Attendre 4 secondes après gameStart
    
    setTimeout(() => {
      console.log('💡 Joueur 1 - Simulation: Suppression de 2 lignes (double)');
      player1.emit('sendAttack', {
        roomId: roomId,
        playerId: player1.id,
        lines: 2 // 2 lignes supprimées
      });
    }, 6000);
  });
  
  player2.on('gameStart', () => {
    console.log('🚀 Joueur 2 - Jeu démarré');
  });
  
  // Attack events
  player2.on('attackReceived', (data) => {
    console.log(`💥 Joueur 2 - ATTAQUE REÇUE: ${data.lines} lignes de ${data.from}`);
  });
  
  player1.on('attackReceived', (data) => {
    console.log(`💥 Joueur 1 - ATTAQUE REÇUE: ${data.lines} lignes de ${data.from}`);
  });
  
  // Nettoyage
  setTimeout(() => {
    console.log('\n🧹 Test terminé');
    player1.disconnect();
    player2.disconnect();
    process.exit(0);
  }, 10000);
}

testRealGameFlow().catch(console.error);
