// Test de connexion WebSocket simple
const io = require('socket.io-client');

console.log('🔍 Test de connexion WebSocket...');

const socket = io('http://localhost:3002', {
  transports: ['polling', 'websocket'],
  timeout: 5000,
});

socket.on('connect', () => {
  console.log('✅ Connexion WebSocket réussie !');
  console.log('ID Socket:', socket.id);
  socket.disconnect();
  process.exit(0);
});

socket.on('connect_error', (error) => {
  console.error('❌ Erreur de connexion:', error.message);
  process.exit(1);
});

socket.on('disconnect', () => {
  console.log('🔌 Déconnecté');
});

// Timeout de sécurité
setTimeout(() => {
  console.error('⏰ Timeout - Connexion trop lente');
  process.exit(1);
}, 10000);
