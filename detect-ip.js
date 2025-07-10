// Script pour détecter automatiquement l'IP locale
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Ignorer les adresses internes et IPv6
      if (!interface.internal && interface.family === 'IPv4') {
        return interface.address;
      }
    }
  }
  
  return 'localhost';
}

const localIP = getLocalIP();
console.log(`IP locale détectée: ${localIP}`);
console.log(`URL du serveur: http://${localIP}:3002`);
console.log(`Pour Android: http://10.0.2.2:3002`);
console.log(`Pour iOS: http://localhost:3002`);
