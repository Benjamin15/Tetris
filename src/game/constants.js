// Constantes de scoring
export const SCORING = {
  SINGLE: 40,
  DOUBLE: 100,
  TRIPLE: 300,
  TETRIS: 1200,
  SOFT_DROP: 1,
  HARD_DROP: 2,
};

// Constantes de progression
export const PROGRESSION = {
  linesPerLevel: 10,
  maxLevel: 30,
  baseSpeed: 1000,
  speedDecrease: 50,
  minimumSpeed: 50,
};

// Constantes du plateau
export const BOARD = {
  width: 10,
  height: 20,
  visibleHeight: 20,
};

// Constantes des pièces
export const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// Constantes multijoueur
export const MULTIPLAYER = {
  maxPlayers: 2,
  gameStartCountdown: 3,
  reconnectTimeout: 30000,
  pingInterval: 5000,
};

// Constantes d'attaque
export const ATTACK = {
  linesRequired: 2, // Minimum de lignes pour attaquer
  attackMultiplier: {
    2: 1, // Double = 1 ligne d'attaque
    3: 2, // Triple = 2 lignes d'attaque
    4: 4, // Tetris = 4 lignes d'attaque
  },
  comboBonus: 0.5, // Bonus par combo
  maxCombo: 10,
};

// Constantes de contrôles
export const CONTROLS = {
  repeatDelay: 250, // Délai avant répétition
  repeatRate: 100,  // Vitesse de répétition
  rotationDelay: 150, // Délai entre rotations
};

// Couleurs des pièces
export const PIECE_COLORS = {
  I: '#00f0f0', // Cyan
  O: '#f0f000', // Jaune
  T: '#a000f0', // Violet
  S: '#00f000', // Vert
  Z: '#f00000', // Rouge
  J: '#0000f0', // Bleu
  L: '#f0a000', // Orange
  GHOST: 'rgba(255, 255, 255, 0.3)', // Pièce fantôme
  GARBAGE: '#666666', // Lignes d'attaque
};

// Thème de couleurs
export const THEME = {
  primary: '#64ffda',
  secondary: '#8892b0',
  background: '#1a1a2e',
  panel: '#16213e',
  border: '#0e4a67',
  danger: '#ff6b6b',
  success: '#4ecdc4',
  warning: '#f0a000',
  text: {
    primary: '#ffffff',
    secondary: '#8892b0',
    accent: '#64ffda',
  },
};

export default {
  SCORING,
  PROGRESSION,
  BOARD,
  PIECE_TYPES,
  MULTIPLAYER,
  ATTACK,
  CONTROLS,
  PIECE_COLORS,
  THEME,
};
