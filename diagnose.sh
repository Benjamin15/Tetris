#!/bin/bash

echo "🔍 Diagnostic Tetris Battle Royale"
echo "=================================="

# Vérifier Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js installé: $(node --version)"
else
    echo "❌ Node.js non installé"
    exit 1
fi

# Vérifier le serveur HTTP
echo ""
echo "🌐 Test du serveur HTTP..."
if curl -s -f http://localhost:3002/health > /dev/null; then
    echo "✅ Serveur HTTP accessible"
    echo "   Status: $(curl -s http://localhost:3002/status | jq -r '.status // "online"' 2>/dev/null || echo "online")"
else
    echo "❌ Serveur HTTP inaccessible"
    echo "💡 Démarrer avec: cd server && npm start"
fi

# Vérifier le port
echo ""
echo "🔌 Test du port 3002..."
if lsof -ti:3002 > /dev/null 2>&1; then
    echo "✅ Port 3002 utilisé par PID: $(lsof -ti:3002)"
else
    echo "❌ Port 3002 libre - serveur non démarré"
fi

# Test WebSocket si disponible
echo ""
echo "🔗 Test WebSocket..."
if [ -f "test-connection.js" ]; then
    if timeout 10 node test-connection.js 2>/dev/null; then
        echo "✅ WebSocket fonctionne"
    else
        echo "❌ WebSocket ne fonctionne pas"
    fi
else
    echo "⚠️  Script de test WebSocket non trouvé"
fi

# Vérifications Android
echo ""
echo "📱 Vérifications Android..."
if command -v adb &> /dev/null; then
    echo "✅ ADB installé"
    if adb devices | grep -q "device$"; then
        echo "✅ Appareil Android connecté"
        echo "💡 Pour redirection port: adb reverse tcp:3002 tcp:3002"
    else
        echo "⚠️  Aucun appareil Android connecté"
    fi
else
    echo "⚠️  ADB non installé"
fi

# Résumé
echo ""
echo "📋 Résumé des recommandations:"
echo "1. Démarrer le serveur: cd server && npm start"
echo "2. Android: adb reverse tcp:3002 tcp:3002"
echo "3. Test web: npm start puis appuyer 'w'"
echo "4. Voir WEBSOCKET_DEBUG.md pour plus d'aide"
