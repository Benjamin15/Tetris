import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GameBoard from './GameBoard';
import { TETRIS_PIECES } from '../game/TetrisEngine';

const ScoreBoard = ({ score, level, lines, nextPiece, opponentBoard = null }) => {
  const renderNextPiece = () => {
    if (!nextPiece) return null;

    const piece = TETRIS_PIECES[nextPiece.type];
    const cellSize = 15;

    return (
      <View style={styles.nextPieceContainer}>
        <Text style={styles.sectionTitle}>Suivant</Text>
        <View style={styles.nextPieceBoard}>
          {piece.shape.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.nextPieceRow}>
              {row.map((cell, colIndex) => (
                <View
                  key={`${rowIndex}-${colIndex}`}
                  style={[
                    styles.nextPieceCell,
                    {
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: cell ? piece.color : 'transparent',
                    }
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Informations de jeu */}
      <View style={styles.gameInfo}>
        <View style={styles.statContainer}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score.toLocaleString()}</Text>
        </View>

        <View style={styles.statContainer}>
          <Text style={styles.statLabel}>Niveau</Text>
          <Text style={styles.statValue}>{level}</Text>
        </View>

        <View style={styles.statContainer}>
          <Text style={styles.statLabel}>Lignes</Text>
          <Text style={styles.statValue}>{lines}</Text>
        </View>

        {renderNextPiece()}
      </View>

      {/* Plateau de l'adversaire (mode multijoueur) */}
      {opponentBoard && (
        <View style={styles.opponentContainer}>
          <Text style={styles.sectionTitle}>Adversaire</Text>
          <GameBoard board={opponentBoard} isOpponent={true} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  gameInfo: {
    marginBottom: 20,
  },
  statContainer: {
    marginBottom: 15,
    backgroundColor: '#16213e',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0e4a67',
  },
  statLabel: {
    color: '#8892b0',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statValue: {
    color: '#64ffda',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    color: '#64ffda',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  nextPieceContainer: {
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0e4a67',
  },
  nextPieceBoard: {
    backgroundColor: '#0f0f23',
    padding: 8,
    borderRadius: 4,
  },
  nextPieceRow: {
    flexDirection: 'row',
  },
  nextPieceCell: {
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  opponentContainer: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0e4a67',
  },
});

export default ScoreBoard;
