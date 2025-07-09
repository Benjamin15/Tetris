import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');

const VersusControls = ({ 
  onPlayer1Move, 
  onPlayer1Rotate, 
  onPlayer1Drop,
  onPlayer2Move, 
  onPlayer2Rotate, 
  onPlayer2Drop 
}) => {

  // Gestionnaire de gestes pour le joueur 1 (côté gauche)
  const handlePlayer1PanGesture = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY } = event.nativeEvent;
      
      if (Math.abs(translationX) > Math.abs(translationY)) {
        // Mouvement horizontal
        if (translationX > 30) {
          onPlayer1Move('right');
        } else if (translationX < -30) {
          onPlayer1Move('left');
        }
      } else {
        // Mouvement vertical
        if (translationY > 30) {
          onPlayer1Drop();
        }
      }
    }
  };

  // Gestionnaire de gestes pour le joueur 2 (côté droit)
  const handlePlayer2PanGesture = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY } = event.nativeEvent;
      
      if (Math.abs(translationX) > Math.abs(translationY)) {
        // Mouvement horizontal
        if (translationX > 30) {
          onPlayer2Move('right');
        } else if (translationX < -30) {
          onPlayer2Move('left');
        }
      } else {
        // Mouvement vertical
        if (translationY > 30) {
          onPlayer2Drop();
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Contrôles Joueur 1 - Côté gauche */}
      <View style={styles.player1Controls}>
        {/* Zone de swipe pour joueur 1 */}
        <PanGestureHandler onHandlerStateChange={handlePlayer1PanGesture}>
          <View style={styles.swipeArea}>
            <Text style={styles.playerLabel}>J1</Text>
          </View>
        </PanGestureHandler>
        
        {/* Boutons joueur 1 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.player1Button]}
            onPress={() => onPlayer1Move('left')}
          >
            <Text style={styles.buttonText}>←</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.player1Button]}
            onPress={() => onPlayer1Move('right')}
          >
            <Text style={styles.buttonText}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.player1Button]}
            onPress={onPlayer1Rotate}
          >
            <Text style={styles.buttonText}>↻</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.player1Button]}
            onPress={onPlayer1Drop}
          >
            <Text style={styles.buttonText}>↓</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Séparateur */}
      <View style={styles.separator} />

      {/* Contrôles Joueur 2 - Côté droit */}
      <View style={styles.player2Controls}>
        {/* Zone de swipe pour joueur 2 */}
        <PanGestureHandler onHandlerStateChange={handlePlayer2PanGesture}>
          <View style={styles.swipeArea}>
            <Text style={styles.playerLabel}>J2</Text>
          </View>
        </PanGestureHandler>
        
        {/* Boutons joueur 2 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.player2Button]}
            onPress={() => onPlayer2Move('left')}
          >
            <Text style={styles.buttonText}>←</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.player2Button]}
            onPress={() => onPlayer2Move('right')}
          >
            <Text style={styles.buttonText}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.player2Button]}
            onPress={onPlayer2Rotate}
          >
            <Text style={styles.buttonText}>↻</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.player2Button]}
            onPress={onPlayer2Drop}
          >
            <Text style={styles.buttonText}>↓</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(22, 33, 62, 0.2)',
  },
  player1Controls: {
    flex: 1,
    padding: 10,
  },
  player2Controls: {
    flex: 1,
    padding: 10,
  },
  separator: {
    width: 1,
    backgroundColor: '#0e4a67',
  },
  swipeArea: {
    flex: 1,
    backgroundColor: 'rgba(22, 33, 62, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0e4a67',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerLabel: {
    color: '#64ffda',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  player1Button: {
    backgroundColor: '#16213e',
    borderColor: '#64ffda',
  },
  player2Button: {
    backgroundColor: '#16213e',
    borderColor: '#ff6b6b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VersusControls;
