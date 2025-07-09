// Constantes de jeu
export const GAME_CONFIG = {
  BOARD_WIDTH: 10,
  BOARD_HEIGHT: 20,
  INITIAL_FALL_SPEED: 1000, // milliseconds
  MIN_FALL_SPEED: 50,
  SPEED_INCREASE_PER_LEVEL: 50,
  LINES_PER_LEVEL: 10,
};

// Scores pour les lignes
export const SCORING = {
  SINGLE: 40,
  DOUBLE: 100,
  TRIPLE: 300,
  TETRIS: 1200,
  SOFT_DROP: 1,
  HARD_DROP: 2,
};

// Configuration des couleurs du thème
export const THEME = {
  colors: {
    primary: '#64ffda',
    secondary: '#8892b0',
    background: '#1a1a2e',
    surface: '#16213e',
    border: '#0e4a67',
    error: '#ff6b6b',
    success: '#4ecdc4',
    white: '#ffffff',
    transparent: 'transparent',
  },
  
  // Couleurs des pièces Tetris
  pieces: {
    I: '#00f0f0', // Cyan
    O: '#f0f000', // Jaune
    T: '#a000f0', // Violet
    S: '#00f000', // Vert
    Z: '#f00000', // Rouge
    J: '#0000f0', // Bleu
    L: '#f0a000', // Orange
    garbage: '#666666', // Gris pour les lignes d'attaque
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 32,
    huge: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

// Configuration multijoueur
export const MULTIPLAYER_CONFIG = {
  SERVER_URL: 'http://localhost:3001',
  RECONNECT_ATTEMPTS: 3,
  PING_INTERVAL: 30000, // 30 secondes
  MATCH_TIMEOUT: 60000, // 1 minute
  GAME_START_COUNTDOWN: 5, // 5 secondes
};

// Configuration des contrôles
export const CONTROLS_CONFIG = {
  SWIPE_THRESHOLD: 30, // pixels
  VELOCITY_THRESHOLD: 1000, // pixels/second
  DOUBLE_TAP_DELAY: 300, // milliseconds
  HOLD_DELAY: 500, // milliseconds
};

// Messages d'interface
export const UI_MESSAGES = {
  gameOver: 'Game Over!',
  paused: 'PAUSE',
  searching: 'Recherche d\'un adversaire...',
  opponentFound: 'Adversaire trouvé !',
  connecting: 'Connexion...',
  disconnected: 'Connexion perdue',
  victory: 'Victoire !',
  defeat: 'Défaite !',
};

// Configuration des animations
export const ANIMATION_CONFIG = {
  fadeIn: 300,
  slideIn: 250,
  bounce: 400,
  linesClear: 500,
  pieceRotation: 150,
  backgroundBlocks: 20, // nombre de blocs d'animation
};

// Niveaux et progression
export const PROGRESSION = {
  maxLevel: 15,
  scoreMultipliers: {
    1: 1,
    2: 1.2,
    3: 1.5,
    4: 2.0,
    5: 2.5,
  },
};

export default {
  GAME_CONFIG,
  SCORING,
  THEME,
  MULTIPLAYER_CONFIG,
  CONTROLS_CONFIG,
  UI_MESSAGES,
  ANIMATION_CONFIG,
  PROGRESSION,
};
