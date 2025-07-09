import { SCORING, PROGRESSION } from './constants';

/**
 * Calcule le score basé sur le nombre de lignes et le niveau
 */
export const calculateScore = (lines, level) => {
  const baseScores = {
    1: SCORING.SINGLE,
    2: SCORING.DOUBLE,
    3: SCORING.TRIPLE,
    4: SCORING.TETRIS,
  };
  
  const baseScore = baseScores[lines] || 0;
  return baseScore * level;
};

/**
 * Calcule le niveau basé sur le nombre de lignes totales
 */
export const calculateLevel = (totalLines) => {
  return Math.min(
    Math.floor(totalLines / 10) + 1,
    PROGRESSION.maxLevel
  );
};

/**
 * Calcule la vitesse de chute basée sur le niveau
 */
export const calculateFallSpeed = (level) => {
  const baseSpeed = 1000;
  const speedDecrease = 50;
  const minimumSpeed = 50;
  
  return Math.max(
    baseSpeed - (level - 1) * speedDecrease,
    minimumSpeed
  );
};

/**
 * Génère un ID unique pour les sessions
 */
export const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Formate un score avec des séparateurs de milliers
 */
export const formatScore = (score) => {
  return score.toLocaleString();
};

/**
 * Calcule le temps écoulé depuis le début d'une partie
 */
export const formatGameTime = (startTime) => {
  const elapsed = Date.now() - startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Vérifie si un mouvement est valide (utilitaire pour les validations côté client)
 */
export const isValidGameMove = (moveType, gameState) => {
  if (!gameState || gameState.isGameOver) return false;
  
  const validMoves = ['left', 'right', 'down', 'rotate', 'drop', 'hold'];
  return validMoves.includes(moveType);
};

/**
 * Calcule le nombre de lignes à envoyer à l'adversaire basé sur les lignes complétées
 */
export const calculateAttackLines = (clearedLines, level) => {
  const attackLines = {
    1: 0, // Une seule ligne ne donne pas d'attaque
    2: 1, // Double = 1 ligne d'attaque
    3: 2, // Triple = 2 lignes d'attaque
    4: 4, // Tetris = 4 lignes d'attaque
  };
  
  const baseAttack = attackLines[clearedLines] || 0;
  
  // Bonus basé sur le niveau (plus le niveau est élevé, plus l'attaque est forte)
  const levelBonus = Math.floor(level / 5);
  
  return baseAttack + levelBonus;
};

/**
 * Génère une ligne de "garbage" (attaque) avec un trou aléatoire
 */
export const generateGarbageLine = (width = 10) => {
  const line = Array(width).fill('#666666');
  const holePosition = Math.floor(Math.random() * width);
  line[holePosition] = 0;
  return line;
};

/**
 * Vérifie si le jeu doit se terminer (détection de game over)
 */
export const checkGameOver = (board, topRows = 2) => {
  // Vérifie si les 2 premières lignes contiennent des blocs
  for (let y = 0; y < topRows; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] !== 0) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Crée une copie profonde d'un plateau de jeu
 */
export const cloneBoard = (board) => {
  return board.map(row => [...row]);
};

/**
 * Mélange un tableau (Fisher-Yates shuffle)
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Génère une séquence de pièces aléatoires (bag system)
 */
export const generatePieceBag = () => {
  const pieces = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return shuffleArray(pieces);
};

/**
 * Calcule les statistiques de jeu
 */
export const calculateGameStats = (gameState) => {
  const { score, lines, level } = gameState;
  
  return {
    piecesPerMinute: 0, // TODO: implémenter le tracking des pièces
    efficiency: score / Math.max(lines, 1), // Score par ligne
    averageLevel: level,
    gameTime: formatGameTime(Date.now() - 60000), // TODO: vrai temps de jeu
  };
};

/**
 * Valide les données reçues du réseau
 */
export const validateNetworkData = (data, expectedFields) => {
  if (!data || typeof data !== 'object') return false;
  
  return expectedFields.every(field => data.hasOwnProperty(field));
};

/**
 * Applique une limite de taux (rate limiting) pour les actions
 */
export const createRateLimiter = (maxActions, timeWindow) => {
  const actions = [];
  
  return () => {
    const now = Date.now();
    const cutoff = now - timeWindow;
    
    // Supprimer les actions anciennes
    while (actions.length > 0 && actions[0] < cutoff) {
      actions.shift();
    }
    
    if (actions.length >= maxActions) {
      return false; // Trop d'actions
    }
    
    actions.push(now);
    return true; // Action autorisée
  };
};

/**
 * Utilitaires pour l'accessibilité
 */
export const getAccessibilityLabel = (gameState) => {
  if (!gameState) return 'Jeu en cours de chargement';
  
  if (gameState.isGameOver) {
    return `Jeu terminé. Score final: ${formatScore(gameState.score)}`;
  }
  
  return `Score: ${formatScore(gameState.score)}, Niveau: ${gameState.level}, Lignes: ${gameState.lines}`;
};

export default {
  calculateScore,
  calculateLevel,
  calculateFallSpeed,
  generateSessionId,
  formatScore,
  formatGameTime,
  isValidGameMove,
  calculateAttackLines,
  generateGarbageLine,
  checkGameOver,
  cloneBoard,
  shuffleArray,
  generatePieceBag,
  calculateGameStats,
  validateNetworkData,
  createRateLimiter,
  getAccessibilityLabel,
};
