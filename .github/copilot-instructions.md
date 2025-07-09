<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Tetris Battle Royale Mobile - Instructions pour Copilot

Cette application est un jeu Tetris Battle Royale mobile développé avec React Native et Expo, conçu pour supporter le multijoueur en temps réel.

## Architecture du projet

### Structure des dossiers
- `src/components/` - Composants React Native réutilisables (GameBoard, ScoreBoard, TouchControls)
- `src/game/` - Logique de jeu Tetris (TetrisEngine, gestion des pièces, scoring)
- `src/screens/` - Écrans de l'application (Menu, Game, Lobby)
- `src/multiplayer/` - Gestion du multijoueur (SocketManager, synchronisation)
- `src/utils/` - Fonctions utilitaires

### Technologies utilisées
- **React Native + Expo** - Framework mobile cross-platform
- **React Native Gesture Handler** - Gestion des contrôles tactiles avancés
- **Socket.io** - Communication temps réel pour le multijoueur
- **React Native SVG** - Rendu graphique avancé
- **AsyncStorage** - Stockage local des données

## Fonctionnalités principales

### Gameplay Tetris
- Grille de jeu 10x20 standard
- 7 types de pièces (I, O, T, S, Z, J, L) avec rotations
- Système de score et niveaux progressifs
- Détection et suppression de lignes complètes
- Chute automatique avec accélération par niveau

### Contrôles mobiles
- **Swipe horizontal** - Déplacement gauche/droite
- **Swipe vertical** - Chute rapide
- **Tap** - Rotation des pièces
- **Boutons tactiles** - Contrôles alternatifs

### Mode Battle Royale
- Duel 1vs1 en temps réel
- Système d'attaque par lignes complètes
- Envoi de "lignes garbage" à l'adversaire
- Combos et multiplicateurs d'attaque

### Interface utilisateur
- Design sombre avec thème cyberpunk
- Animations fluides et effets visuels
- Interface responsive pour différentes tailles d'écran
- Indicateurs visuels pour les actions (pause, game over, etc.)

## Règles de développement

### Style de code
- Utiliser les hooks React (useState, useEffect, useRef)
- Composants fonctionnels uniquement
- Noms de variables descriptifs en camelCase
- Commentaires pour la logique complexe de jeu

### Performance
- Optimiser la boucle de jeu (60 FPS)
- Éviter les re-renders inutiles avec React.memo si nécessaire
- Gérer correctement les intervalles et timeouts
- Nettoyer les ressources dans useEffect cleanup

### Multijoueur (futures fonctionnalités)
- Architecture client-serveur avec Socket.io
- Synchronisation des états de jeu
- Gestion de la latence et des déconnexions
- Matchmaking par niveau de compétence

## Conventions de nommage

### Fichiers
- Composants : PascalCase (ex: `GameBoard.js`)
- Écrans : PascalCase avec suffixe Screen (ex: `GameScreen.js`)
- Utilitaires : camelCase (ex: `socketManager.js`)

### Variables et fonctions
- Variables d'état : camelCase descriptif (ex: `isGameOver`, `currentPiece`)
- Fonctions de gestion d'événements : préfixe `handle` (ex: `handleGameOver`)
- Constantes : UPPER_SNAKE_CASE (ex: `BOARD_WIDTH`)

### Couleurs (thème)
- Primaire : `#64ffda` (cyan)
- Secondaire : `#8892b0` (gris bleu)
- Arrière-plan : `#1a1a2e` (bleu foncé)
- Panels : `#16213e` (bleu moyen)
- Bordures : `#0e4a67` (bleu accent)
- Erreur/Danger : `#ff6b6b` (rouge)

## Extensions recommandées
- React Native Tools
- ES7+ React/Redux/React-Native snippets
- Bracket Pair Colorizer
- Auto Rename Tag
