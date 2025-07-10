// Test de détection d'URL pour Node.js
const fetch = require('node-fetch');

// URLs de fallback à tester
const getFallbackUrls = () => {
  return [
    'http://localhost:3002',
    'http://10.0.2.2:3002',
    'http://192.168.0.16:3002'
  ];
};

// Tester la connectivité vers une URL
const testConnectivity = async (url, timeout = 5000) => {
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
const detectBestServerUrl = async () => {
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

// Exécuter le test
detectBestServerUrl().then(url => {
  console.log(`\n🌐 Résultat final: ${url}`);
}).catch(error => {
  console.error('Erreur:', error);
});
