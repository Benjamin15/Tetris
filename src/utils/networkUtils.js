// Utilitaire pour détecter l'environnement et l'URL du serveur
import { Platform } from 'react-native';

// Obtenir l'IP locale automatiquement
const getLocalIP = () => {
  // Android Emulator utilise 10.0.2.2 pour accéder à localhost de l'hôte
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  
  // iOS Simulator peut utiliser localhost
  if (Platform.OS === 'ios') {
    return 'localhost';
  }
  
  // Pour les appareils physiques, utiliser l'IP locale détectée
  // Remplacez 192.168.0.16 par votre IP locale si nécessaire
  if (Platform.OS !== 'web' && !__DEV__) {
    return '192.168.0.16'; // IP locale détectée avec detect-ip.js
  }
  
  // Web utilise localhost
  return 'localhost';
};

export const getServerUrl = () => {
  // En développement, essayer de détecter l'environnement
  if (__DEV__) {
    const host = getLocalIP();
    console.log(`🌐 URL détectée pour ${Platform.OS}: http://${host}:3002`);
    return `http://${host}:3002`;
  }
  
  // En production, utiliser l'URL de production
  return 'https://your-production-server.com';
};

// URLs de fallback à tester en ordre de préférence
export const getFallbackUrls = () => {
  const urls = [];
  
  if (Platform.OS === 'android') {
    // Android: Essayer 10.0.2.2 (emulator), puis localhost, puis IP locale
    urls.push('http://10.0.2.2:3002');
    urls.push('http://localhost:3002');
    urls.push('http://192.168.0.16:3002');
  } else if (Platform.OS === 'ios') {
    // iOS: Essayer localhost, puis IP locale
    urls.push('http://localhost:3002');
    urls.push('http://192.168.0.16:3002');
  } else {
    // Web: localhost seulement
    urls.push('http://localhost:3002');
  }
  
  return urls;
};

// Tester la connectivité vers une URL
export const testConnectivity = async (url, timeout = 5000) => {
  try {
    console.log(`🔍 Test de connectivité vers: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log(`✅ ${url} est accessible`);
      return true;
    } else {
      console.log(`❌ ${url} a retourné ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${url} non accessible:`, error.message);
    return false;
  }
};

// Détecter automatiquement la meilleure URL
export const detectBestServerUrl = async () => {
  const fallbackUrls = getFallbackUrls();
  console.log('🔍 Détection automatique de la meilleure URL serveur...');
  
  for (const url of fallbackUrls) {
    const isReachable = await testConnectivity(url);
    if (isReachable) {
      console.log(`🎯 URL optimale trouvée: ${url}`);
      return url;
    }
  }
  
  console.log('❌ Aucune URL serveur accessible trouvée');
  return fallbackUrls[0]; // Retourner la première par défaut
};

export const isEmulator = () => {
  return __DEV__ && Platform.OS !== 'web';
};

export const getOptimalTransports = () => {
  // Pour React Native, privilégier polling seulement
  if (Platform.OS !== 'web') {
    return ['polling'];
  }
  
  // Pour web, on peut utiliser websocket
  return ['websocket', 'polling'];
};

export const getSocketConfig = (serverUrl) => {
  const baseConfig = {
    jsonp: false,
    timeout: 30000,
    forceNew: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    rememberUpgrade: false,
    rejectUnauthorized: false,
  };

  // Configuration spécifique pour React Native
  if (Platform.OS !== 'web') {
    console.log(`🔧 Configuration Socket.io pour ${Platform.OS}: polling uniquement`);
    return {
      ...baseConfig,
      transports: ['polling'], // Seulement polling pour React Native
      upgrade: false, // Pas d'upgrade vers websocket
      enablesXDR: true, // Activer les requêtes cross-domain
    };
  }

  // Configuration pour web
  console.log('🔧 Configuration Socket.io pour web: websocket + polling');
  return {
    ...baseConfig,
    transports: ['websocket', 'polling'],
    upgrade: true,
  };
};