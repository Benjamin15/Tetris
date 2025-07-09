import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../game/TetrisEngine';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameBoard = ({ board, isOpponent = false }) => {
  const cellSize = isOpponent ? 12 : Math.min(screenWidth * 0.8 / BOARD_WIDTH, (screenHeight * 0.6) / BOARD_HEIGHT);
  const boardWidth = cellSize * BOARD_WIDTH;
  const boardHeight = cellSize * BOARD_HEIGHT;

  const renderCell = (cellValue, rowIndex, colIndex) => {
    return (
      <View
        key={`${rowIndex}-${colIndex}`}
        style={[
          styles.cell,
          {
            width: cellSize,
            height: cellSize,
            backgroundColor: cellValue || (isOpponent ? '#2a2a2a' : '#1a1a1a'),
            borderColor: isOpponent ? '#3a3a3a' : '#333333',
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
        borderColor: isOpponent ? '#444444' : '#666666',
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
