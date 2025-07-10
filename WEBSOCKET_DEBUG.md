# 🔧 Diagnostic des Erreurs WebSocket

## ❌ Erreur : "websocket error"

### Causes Possibles

#### 1. **Serveur Non Démarré**
```bash
# Vérifier l'état du serveur
curl http://localhost:3002/health

# Si erreur "connection refused", démarrer le serveur
cd server
npm start
```

#### 2. **Problème de Transport WebSocket**
Le problème vient souvent du fait que React Native a des difficultés avec WebSocket.

**Solution** : Le code a été modifié pour utiliser `polling` au lieu de `websocket`.

#### 3. **Firewall/Antivirus**
Certains firewalls bloquent les connexions WebSocket.

**Solution** :
- Désactiver temporairement le firewall
- Ajouter une exception pour le port 3002

#### 4. **Émulateur/Simulateur**
Les émulateurs ont parfois des problèmes de réseau.

**Solutions** :
```bash
# Android Emulator - Rediriger le port
adb reverse tcp:3002 tcp:3002

# iOS Simulator - Utiliser l'IP locale
# Remplacer localhost par l'IP de votre machine
```

### 🔍 Tests de Diagnostic

#### Test 1 : Serveur HTTP
```bash
curl http://localhost:3002/health
# Doit retourner : {"status":"healthy","timestamp":"..."}
```

#### Test 2 : WebSocket depuis Node.js
```bash
node test-connection.js
# Doit afficher : "✅ Connexion WebSocket réussie !"
```

#### Test 3 : Depuis l'App
1. Ouvrir l'app
2. Aller dans Battle Royale
3. Vérifier les logs dans la console

### 🛠️ Solutions Recommandées

#### Solution 1 : Mode Polling (Appliqué)
Le `SocketManager` utilise maintenant `polling` uniquement :
```javascript
transports: ['polling'] // Plus stable que websocket
```

#### Solution 2 : Redirection de Port (Android)
```bash
# Si vous utilisez un émulateur Android
adb reverse tcp:3002 tcp:3002
```

#### Solution 3 : IP Locale (iOS/Réseau)
Modifier l'URL de connexion :
```javascript
// Au lieu de localhost, utiliser l'IP de votre machine
'http://192.168.1.XXX:3002'
```

#### Solution 4 : Mode Web pour Test
```bash
# Tester d'abord en mode web
npm start
# Appuyer sur 'w' pour ouvrir en navigateur
```

### 📱 Configuration par Plateforme

#### Android Emulator
```bash
# Configuration réseau
adb reverse tcp:3002 tcp:3002
```

#### iOS Simulator
```bash
# Utiliser l'IP locale
ipconfig getifaddr en0  # macOS
# Utiliser cette IP dans l'app
```

#### Appareil Physique
```bash
# S'assurer que l'appareil et l'ordinateur sont sur le même réseau
# Utiliser l'IP locale de l'ordinateur
```

### 🚨 Vérification Finale

1. ✅ Serveur démarré et répond sur HTTP
2. ✅ Mode `polling` activé
3. ✅ Port 3002 accessible
4. ✅ Même réseau (appareil physique)
5. ✅ Redirection port (émulateur Android)

### 💡 Astuce

En cas de problème persistant, utiliser le **mode web** pour vérifier que le serveur fonctionne :
```bash
npm start
# Appuyer sur 'w'
# Tester Battle Royale dans le navigateur
```
