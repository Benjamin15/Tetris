#!/usr/bin/env node

const io = require('socket.io-client');

async function testBattleRoyale() {
  console.log('🎮 Test du mode Battle Royale - Synchronisation des attaques');
  
  // Configuration des clients
  const serverUrl = 'http://localhost:3002';
  const player1 = io(serverUrl, { transports: ['polling'] });
  const player2 = io(serverUrl, { transports: ['polling'] });
  
  let player1Connected = false;
  let player2Connected = false;
  let matchFound = false;
  let roomId = null;
  
  // Player 1 events
  player1.on('connect', () => {
    console.log('✅ Joueur 1 connecté');
    player1Connected = true;
    
    // Rejoindre la queue
    player1.emit('joinQueue', {
      username: 'TestPlayer1'
    });
  });
  
  player1.on('matchFound', (data) => {
    console.log('🎯 Joueur 1 - Match trouvé:', data);
    matchFound = true;
    roomId = data.roomId;
    
    // Rejoindre la room
    player1.emit('joinRoom', { roomId: data.roomId });
  });
  
  player1.on('roomJoined', (data) => {
    console.log('🏠 Joueur 1 - Room rejointe:', data);
  });
  
  player1.on('gameStart', (data) => {
    console.log('🚀 Joueur 1 - Début de partie');
    
    // Simuler quelques lignes supprimées pour tester l'attaque
    setTimeout(() => {
      console.log('💥 Joueur 1 - Envoi d\'une attaque (2 lignes)');
      player1.emit('sendAttack', {
        roomId: roomId,
        playerId: player1.id,
        lines: 2
      });
    }, 3000); // Attendre plus longtemps
  });
  
  player1.on('attackReceived', (data) => {
    console.log('💥 Joueur 1 - Attaque reçue:', data);
  });
  
  player1.on('opponentMove', (data) => {
    console.log('👤 Joueur 1 - Mouvement adversaire:', data);
  });
  
  // Player 2 events
  player2.on('connect', () => {
    console.log('✅ Joueur 2 connecté');
    player2Connected = true;
    
    // Attendre un peu avant de rejoindre la queue
    setTimeout(() => {
      player2.emit('joinQueue', {
        username: 'TestPlayer2'
      });
    }, 1000);
  });
  
  player2.on('matchFound', (data) => {
    console.log('🎯 Joueur 2 - Match trouvé:', data);
    
    // Rejoindre la room
    player2.emit('joinRoom', { roomId: data.roomId });
  });
  
  player2.on('roomJoined', (data) => {
    console.log('🏠 Joueur 2 - Room rejointe:', data);
  });
  
  player2.on('gameStart', (data) => {
    console.log('🚀 Joueur 2 - Début de partie');
    
    // Envoyer des stats de jeu
    setTimeout(() => {
      console.log('📊 Joueur 2 - Envoi de stats de jeu');
      player2.emit('gameUpdate', {
        roomId: roomId,
        playerId: player2.id,
        score: 1500,
        lines: 3,
        level: 2,
        board: Array(20).fill(null).map(() => Array(10).fill(0))
      });
    }, 2500);
    
    // Répondre à l'attaque du joueur 1
    setTimeout(() => {
      console.log('💥 Joueur 2 - Contre-attaque (3 lignes)');
      player2.emit('sendAttack', {
        roomId: roomId,
        playerId: player2.id,
        lines: 3
      });
    }, 4000); // Délai plus long
  });
  
  player2.on('attackReceived', (data) => {
    console.log('💥 Joueur 2 - Attaque reçue:', data);
  });
  
  player2.on('opponentMove', (data) => {
    console.log('👤 Joueur 2 - Mouvement adversaire:', data);
  });
  
  // Nettoyage après 15 secondes
  setTimeout(() => {
    console.log('🧹 Nettoyage et déconnexion');
    player1.disconnect();
    player2.disconnect();
    process.exit(0);
  }, 15000);
}

testBattleRoyale().catch(console.error);
