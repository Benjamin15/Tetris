# 🎮 Tetris Battle Royale Mobile

Un jeu Tetris Battle Royale développé avec React Native et Expo, supportant le multijoueur en temps réel.

## 🚀 Fonctionnalités

### Mode Solo
- Jeu Tetris classique avec 7 types de pièces
- Système de score et niveaux progressifs
- Contrôles tactiles optimisés pour mobile
- Interface moderne avec thème cyberpunk

### Mode Versus Local
- Jeu à deux joueurs sur le même appareil
- Double grille de jeu côte à côte
- Contrôles tactiles séparés pour chaque joueur
- Système d'attaque par lignes complètes
- Envoi de "lignes garbage" entre les joueurs

### Mode Battle Royale (1vs1)
- Matchmaking automatique
- Combat en temps réel contre un autre joueur
- Système d'attaque par lignes complètes
- Envoi de "lignes garbage" à l'adversaire

### Mode Entraînement
- Pratique libre sans contraintes
- Idéal pour s'améliorer avant les combats

## 🎯 Contrôles

### Mode Solo/Entraînement
- **Swipe horizontal** : Déplacer la pièce gauche/droite
- **Swipe vertical** : Chute rapide
- **Tap** : Rotation de la pièce
- **Boutons tactiles** : Contrôles alternatifs

### Mode Versus Local
- **Joueur 1 (gauche)** : Zone de swipe + boutons dédiés
- **Joueur 2 (droite)** : Zone de swipe + boutons dédiés
- **Tap sur la grille** : Rotation pour chaque joueur
- Contrôles séparés et optimisés pour le jeu à deux

## 🛠️ Technologies

- **React Native** + **Expo** - Framework mobile cross-platform
- **React Native Gesture Handler** - Gestion des gestes tactiles
- **Socket.io** - Communication temps réel (multijoueur)
- **React Native SVG** - Rendu graphique
- **AsyncStorage** - Stockage local

## 📱 Installation et Lancement

### Prérequis
- Node.js (version 18+)
- Expo CLI
- Un émulateur Android/iOS ou un appareil physique

### Installation
```bash
# Cloner le projet
git clone [repository-url]
cd tetris

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

### Lancer sur un appareil
```bash
# Android
npm run android

# iOS
npm run ios

# Web (pour test)
npm run web
```

## 🏗️ Architecture

```
src/
├── components/          # Composants réutilisables
│   ├── GameBoard.js    # Plateau de jeu principal
│   ├── ScoreBoard.js   # Affichage score et infos
│   ├── TouchControls.js # Contrôles tactiles (solo)
│   └── VersusControls.js # Contrôles tactiles (versus)
├── game/               # Logique de jeu
│   ├── TetrisEngine.js # Moteur de jeu principal
│   ├── VersusGameManager.js # Gestionnaire de partie versus
│   └── constants.js    # Constantes du jeu
├── screens/            # Écrans de l'application
│   ├── MenuScreen.js   # Menu principal
│   ├── GameScreen.js   # Écran de jeu (solo/training)
│   ├── LobbyScreen.js  # Lobby multijoueur
│   └── VersusScreen.js # Écran de jeu versus local
├── multiplayer/        # Gestion multijoueur
│   └── SocketManager.js # Gestionnaire de connexions
└── utils/              # Fonctions utilitaires
    └── gameUtils.js    # Utilitaires de jeu
```

## 🎨 Design System

### Couleurs
- **Primaire** : `#64ffda` (cyan)
- **Secondaire** : `#8892b0` (gris bleu)
- **Arrière-plan** : `#1a1a2e` (bleu foncé)
- **Panels** : `#16213e` (bleu moyen)
- **Bordures** : `#0e4a67` (bleu accent)
- **Danger** : `#ff6b6b` (rouge)

### Thème
Design cyberpunk sombre avec des accents néon cyan.

## 🚧 Développement Futur

### Multijoueur
- [ ] Serveur Node.js avec Socket.io
- [ ] Système de matchmaking par rating
- [ ] Mode Battle Royale 4+ joueurs
- [ ] Tournois et classements

### Fonctionnalités
- [ ] Power-ups spéciaux
- [ ] Système d'achèvement
- [ ] Personnalisation des pièces
- [ ] Mode spectateur
- [ ] Replay des parties

### Technique
- [ ] Synchronisation réseau optimisée
- [ ] Anti-cheat basique
- [ ] Système de reconnexion
- [ ] Analytics de jeu

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment procéder :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📋 Todo

- [x] Interface de base
- [x] Moteur de jeu Tetris
- [x] Contrôles tactiles
- [x] Mode solo fonctionnel
- [x] Mode versus local (2 joueurs)
- [x] Interface multijoueur (UI)
- [ ] Serveur multijoueur
- [ ] Tests unitaires
- [ ] Optimisations performance
- [ ] Publication sur stores

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

Développé avec ❤️ pour l'apprentissage et le fun !

---

*Prêt pour le combat ? Que le meilleur Tetris player gagne ! 🏆*
