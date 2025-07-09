import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../game/TetrisEngine';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameBoard = ({ board, isOpponent = false, isPlayer1 = false, isPlayer2 = false }) => {
  // Calcul de la taille des cellules basé sur le mode
  let cellSize;
  if (isOpponent) {
    cellSize = 12;
  } else if (isPlayer1 || isPlayer2) {
    // Mode versus : plus petit pour accommoder 2 grilles
    cellSize = Math.min(screenWidth * 0.4 / BOARD_WIDTH, (screenHeight * 0.5) / BOARD_HEIGHT);
  } else {
    // Mode solo : taille normale
    cellSize = Math.min(screenWidth * 0.8 / BOARD_WIDTH, (screenHeight * 0.6) / BOARD_HEIGHT);
  }
  
  const boardWidth = cellSize * BOARD_WIDTH;
  const boardHeight = cellSize * BOARD_HEIGHT;

  const renderCell = (cellValue, rowIndex, colIndex) => {
    // Couleurs spécifiques selon le joueur
    let borderColor = '#333333';
    let backgroundColor = cellValue || '#1a1a1a';
    
    if (isOpponent) {
      borderColor = '#3a3a3a';
      backgroundColor = cellValue || '#2a2a2a';
    } else if (isPlayer1) {
      borderColor = '#0e4a67';
      backgroundColor = cellValue || '#0f0f23';
    } else if (isPlayer2) {
      borderColor = '#4a0e0e';
      backgroundColor = cellValue || '#230f0f';
    }

    return (
      <View
        key={`${rowIndex}-${colIndex}`}
        style={[
          styles.cell,
          {
            width: cellSize,
            height: cellSize,
            backgroundColor,
            borderColor,
          }
        ]}
      />
    );
  };

  const renderRow = (row, rowIndex) => {
    return (
      <View key={rowIndex} style={styles.row}>
        {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
      </View>
    );
  };

  return (
    <View style={[
      styles.board,
      {
        width: boardWidth,
        height: boardHeight,
        borderColor: isOpponent ? '#444444' : 
                    isPlayer1 ? '#64ffda' : 
                    isPlayer2 ? '#ff6b6b' : '#666666',
      }
    ]}>
      {board.map((row, rowIndex) => renderRow(row, rowIndex))}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    borderWidth: 2,
    backgroundColor: '#0f0f23',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
  },
});

export default GameBoard;
