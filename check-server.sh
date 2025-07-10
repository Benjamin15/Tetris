#!/bin/bash

echo "🔍 Vérification du serveur Tetris Battle Royale..."

# Vérifier si le serveur répond
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/health 2>/dev/null)

if [ "$response" = "200" ]; then
    echo "✅ Serveur en ligne et fonctionnel"
    curl -s http://localhost:3002/status | jq 2>/dev/null || echo "Serveur actif"
else
    echo "❌ Serveur non accessible sur le port 3002"
    echo "💡 Démarrez le serveur avec: ./start-server.sh"
fi
