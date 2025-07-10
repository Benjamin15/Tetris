#!/bin/bash

echo "🎮 Démarrage du serveur Tetris Battle Royale..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js pour continuer."
    exit 1
fi

# Aller dans le dossier serveur
cd server

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Démarrer le serveur
echo "🚀 Démarrage du serveur sur le port 3001..."
npm start
