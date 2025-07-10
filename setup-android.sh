#!/bin/bash

echo "🔧 Configuration adb reverse pour Android Emulator"
echo "=================================================="

# Vérifier si adb est disponible
if ! command -v adb &> /dev/null; then
    echo "❌ adb n'est pas installé ou pas dans le PATH"
    echo "Installez Android SDK Platform Tools"
    exit 1
fi

# Vérifier si un émulateur est connecté
if ! adb devices | grep -q "emulator"; then
    echo "❌ Aucun émulateur Android détecté"
    echo "Lancez un émulateur Android avant d'exécuter ce script"
    exit 1
fi

echo "✅ Émulateur Android détecté"

# Configurer le reverse port forwarding
echo "🔧 Configuration du port forwarding..."
adb reverse tcp:3002 tcp:3002

if [ $? -eq 0 ]; then
    echo "✅ Port forwarding configuré avec succès"
    echo "L'émulateur Android peut maintenant accéder au serveur via localhost:3002"
else
    echo "❌ Erreur lors de la configuration du port forwarding"
    exit 1
fi

# Vérifier la configuration
echo "🔍 Vérification de la configuration:"
adb reverse --list

echo -e "\n💡 L'émulateur Android peut maintenant se connecter au serveur local!"
echo "URL à utiliser dans l'app: http://localhost:3002"
