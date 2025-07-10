#!/bin/bash

echo "🔍 Diagnostic réseau pour Tetris Battle Royale"
echo "================================================"

# Détecter l'IP locale
echo -e "\n📍 Détection de l'IP locale:"
node detect-ip.js

# Vérifier si le serveur est en cours
echo -e "\n🏃 Vérification du serveur:"
if lsof -i :3002 > /dev/null; then
    echo "✅ Serveur en cours d'exécution sur le port 3002"
    echo "PID du processus:"
    lsof -i :3002
else
    echo "❌ Aucun serveur trouvé sur le port 3002"
    echo "Lancez le serveur avec: cd server && npm start"
fi

# Test de connectivité HTTP
echo -e "\n🌐 Test de connectivité HTTP:"
echo "Testing localhost:3002..."
if curl -s "http://localhost:3002/health" > /dev/null; then
    echo "✅ localhost:3002 accessible"
else
    echo "❌ localhost:3002 non accessible"
fi

echo "Testing 10.0.2.2:3002 (Android Emulator)..."
if curl -s "http://10.0.2.2:3002/health" > /dev/null; then
    echo "✅ 10.0.2.2:3002 accessible"
else
    echo "❌ 10.0.2.2:3002 non accessible"
fi

# Obtenir l'IP locale et tester
LOCAL_IP=$(node -p "
const os = require('os');
const interfaces = os.networkInterfaces();
for (const name of Object.keys(interfaces)) {
  for (const interface of interfaces[name]) {
    if (!interface.internal && interface.family === 'IPv4') {
      console.log(interface.address);
      process.exit(0);
    }
  }
}
console.log('localhost');
")

echo "Testing ${LOCAL_IP}:3002 (IP locale)..."
if curl -s "http://${LOCAL_IP}:3002/health" > /dev/null; then
    echo "✅ ${LOCAL_IP}:3002 accessible"
else
    echo "❌ ${LOCAL_IP}:3002 non accessible"
fi

# Test WebSocket
echo -e "\n🔌 Test de connexion WebSocket:"
node test-connection.js

echo -e "\n💡 Recommandations:"
echo "1. Pour Android Emulator: Utilisez adb reverse port forwarding"
echo "   adb reverse tcp:3002 tcp:3002"
echo "2. Pour les appareils physiques: Utilisez l'IP locale ${LOCAL_IP}"
echo "3. Assurez-vous que le firewall autorise les connexions sur le port 3002"
echo "4. Sur React Native, utilisez transport polling uniquement"
