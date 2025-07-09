// Définition des pièces Tetris
export const TETRIS_PIECES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00f0f0'
  },
  O: {
    shape: [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0]
    ],
    color: '#f0f000'
  },
  T: {
    shape: [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0]
    ],
    color: '#a000f0'
  },
  S: {
    shape: [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: '#00f000'
  },
  Z: {
    shape: [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: '#f00000'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#0000f0'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#f0a000'
  }
};

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export class TetrisEngine {
  constructor(onUpdate, onGameOver, onLinesClear) {
    this.board = this.createEmptyBoard();
    this.currentPiece = null;
    this.nextPiece = null;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.isGameOver = false;
    this.dropTime = 0;
    this.dropInterval = 1000; // 1 seconde au début
    
    this.onUpdate = onUpdate;
    this.onGameOver = onGameOver;
    this.onLinesClear = onLinesClear;
    
    this.init();
  }
  
  createEmptyBoard() {
    return Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
  }
  
  init() {
    this.currentPiece = this.generatePiece();
    this.nextPiece = this.generatePiece();
    this.onUpdate && this.onUpdate(this.getGameState());
  }
  
  generatePiece() {
    const pieces = Object.keys(TETRIS_PIECES);
    const pieceType = pieces[Math.floor(Math.random() * pieces.length)];
    const piece = TETRIS_PIECES[pieceType];
    
    return {
      type: pieceType,
      shape: piece.shape,
      color: piece.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
      y: 0,
      rotation: 0
    };
  }
  
  rotatePiece(piece) {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return { ...piece, shape: rotated };
  }
  
  isValidMove(piece, newX, newY, newShape = null) {
    const shape = newShape || piece.shape;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;
          
          // Vérifier les limites
          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
            return false;
          }
          
          // Vérifier collision avec pièces existantes
          if (boardY >= 0 && this.board[boardY][boardX]) {
            return false;
          }
        }
      }
    }
    return true;
  }
  
  movePiece(direction) {
    if (!this.currentPiece || this.isGameOver) return false;
    
    let newX = this.currentPiece.x;
    let newY = this.currentPiece.y;
    
    switch (direction) {
      case 'left':
        newX -= 1;
        break;
      case 'right':
        newX += 1;
        break;
      case 'down':
        newY += 1;
        break;
    }
    
    if (this.isValidMove(this.currentPiece, newX, newY)) {
      this.currentPiece.x = newX;
      this.currentPiece.y = newY;
      this.onUpdate && this.onUpdate(this.getGameState());
      return true;
    }
    
    // Si on ne peut pas bouger vers le bas, fixer la pièce
    if (direction === 'down') {
      this.lockPiece();
    }
    
    return false;
  }
  
  rotatePieceOnBoard() {
    if (!this.currentPiece || this.isGameOver) return false;
    
    const rotatedPiece = this.rotatePiece(this.currentPiece);
    
    if (this.isValidMove(this.currentPiece, this.currentPiece.x, this.currentPiece.y, rotatedPiece.shape)) {
      this.currentPiece.shape = rotatedPiece.shape;
      this.currentPiece.rotation = (this.currentPiece.rotation + 90) % 360;
      this.onUpdate && this.onUpdate(this.getGameState());
      return true;
    }
    
    return false;
  }
  
  dropPiece() {
    while (this.movePiece('down')) {
      // Continue jusqu'à ce que la pièce ne puisse plus descendre
    }
  }
  
  lockPiece() {
    if (!this.currentPiece) return;
    
    // Placer la pièce sur le plateau
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          const boardY = this.currentPiece.y + y;
          const boardX = this.currentPiece.x + x;
          
          if (boardY >= 0) {
            this.board[boardY][boardX] = this.currentPiece.color;
          }
        }
      }
    }
    
    // Vérifier les lignes complètes
    const clearedLines = this.clearLines();
    
    if (clearedLines > 0) {
      this.lines += clearedLines;
      this.score += this.calculateScore(clearedLines);
      this.level = Math.floor(this.lines / 10) + 1;
      this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
      
      this.onLinesClear && this.onLinesClear(clearedLines);
    }
    
    // Générer la prochaine pièce
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.generatePiece();
    
    // Vérifier si le jeu est terminé
    if (!this.isValidMove(this.currentPiece, this.currentPiece.x, this.currentPiece.y)) {
      this.isGameOver = true;
      this.onGameOver && this.onGameOver();
    }
    
    this.onUpdate && this.onUpdate(this.getGameState());
  }
  
  clearLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell !== 0)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        y++; // Vérifier à nouveau la même ligne
      }
    }
    
    return linesCleared;
  }
  
  calculateScore(lines) {
    const baseScore = [0, 40, 100, 300, 1200];
    return baseScore[lines] * this.level;
  }
  
  getBoardWithCurrentPiece() {
    const boardCopy = this.board.map(row => [...row]);
    
    if (this.currentPiece) {
      for (let y = 0; y < this.currentPiece.shape.length; y++) {
        for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
          if (this.currentPiece.shape[y][x]) {
            const boardY = this.currentPiece.y + y;
            const boardX = this.currentPiece.x + x;
            
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              boardCopy[boardY][boardX] = this.currentPiece.color;
            }
          }
        }
      }
    }
    
    return boardCopy;
  }
  
  update(deltaTime) {
    if (this.isGameOver) return;
    
    this.dropTime += deltaTime;
    
    if (this.dropTime >= this.dropInterval) {
      this.movePiece('down');
      this.dropTime = 0;
    }
  }
  
  getGameState() {
    return {
      board: this.getBoardWithCurrentPiece(),
      nextPiece: this.nextPiece,
      score: this.score,
      level: this.level,
      lines: this.lines,
      isGameOver: this.isGameOver
    };
  }
  
  // Méthodes pour le multijoueur
  addGarbageLines(count) {
    for (let i = 0; i < count; i++) {
      this.board.pop();
      const garbageLine = Array(BOARD_WIDTH).fill('#666666');
      // Ajouter un trou aléatoire dans la ligne
      const holePosition = Math.floor(Math.random() * BOARD_WIDTH);
      garbageLine[holePosition] = 0;
      this.board.unshift(garbageLine);
    }
    
    this.onUpdate && this.onUpdate(this.getGameState());
  }
}
