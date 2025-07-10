# 🔧 Guide de Dépannage - Tetris Battle Royale

## Problèmes Courants et Solutions

### 🔌 Problème : "Connexion au serveur échouée"

#### Cause possible 1 : Serveur non démarré
```bash
# Vérifier l'état du serveur
curl -s http://localhost:3002/health

# Si pas de réponse, démarrer le serveur
cd server
npm start
```

#### Cause possible 2 : Port 3002 occupé
```bash
# Voir qui utilise le port
lsof -ti:3002

# Tuer le processus si nécessaire
kill -9 $(lsof -ti:3002)

# Redémarrer le serveur
cd server && npm start
```

#### Cause possible 3 : Dépendances manquantes
```bash
# Installer les dépendances du serveur
cd server
npm install
npm start
```

### 🎮 Problème : "Adversaire trouvé instantanément sans deuxième joueur"

#### Solution : Lobby en mode simulation vs mode réel
Le **LobbyScreen** est maintenant corrigé pour utiliser le vrai serveur.
- ✅ **Ancien problème** : Simulation d'adversaire après 3 secondes
- ✅ **Nouvelle solution** : Vraie connexion au serveur, attente d'un vrai joueur

#### Pour tester correctement :
1. **Démarrer le serveur** : `cd server && npm start`
2. **Ouvrir 2 instances de l'app** :
   - Appareil physique + Expo Web
   - 2 émulateurs différents
   - 2 appareils physiques
3. **Naviguer vers Battle Royale sur les 2 instances**
4. **Rechercher un adversaire** → Match automatique quand 2 joueurs connectés

### 📱 Problème : "Queue rejointe mais pas de match"

#### Cause : Un seul joueur connecté
- Le matchmaking nécessite **2 joueurs minimum**
- La queue affiche le nombre de joueurs en attente
- Le match se lance automatiquement dès qu'un 2ème joueur rejoint

#### Solution : 
```bash
# Vérifier le nombre de joueurs connectés
curl -s http://localhost:3002/status
```

### 🔄 Problème : "Reconnexion constante"

#### Cause : Connexions multiples
Le SocketManager est maintenant corrigé pour éviter les connexions multiples.

#### Si le problème persiste :
```bash
# Redémarrer complètement
1. Fermer l'app
2. Arrêter le serveur (Ctrl+C)
3. Redémarrer le serveur : cd server && npm start
4. Relancer l'app : npm start
```

### 🚀 Processus de Test Recommandé

#### 1. Préparation
```bash
# Terminal 1 : Serveur
cd server
npm start
# ✅ Serveur démarré sur le port 3002

# Terminal 2 : App mobile
npm start
# ✅ Metro bundler démarré
```

#### 2. Test avec 2 joueurs
```bash
# Joueur 1 : Appareil physique
# Scanner le QR code Expo

# Joueur 2 : Navigateur
# Appuyer sur 'w' dans Metro pour ouvrir la version web
```

#### 3. Navigation
```
Menu Principal → BATTLE ROYALE → Connexion → Queue → Match !
```

## 📊 Monitoring du Serveur

```bash
# État général
curl http://localhost:3002/status

# Santé du serveur
curl http://localhost:3002/health

# Logs en temps réel
cd server && npm start
```

## 🔍 Debug Mode

Pour activer plus de logs :
```javascript
// Dans SocketManager.js, décommenter :
console.log('Debug:', eventName, data);
```

## ✅ Vérification Finale

- [ ] Serveur démarré et répond sur :3002
- [ ] 2 instances de l'app connectées
- [ ] Navigation Battle Royale réussie
- [ ] Matchmaking fonctionne
- [ ] Combat en temps réel actif

---

**En cas de problème persistant** : Redémarrer complètement serveur + app + nettoyer les caches Expo.
