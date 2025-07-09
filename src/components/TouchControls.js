import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');

const TouchControls = ({ onMove, onRotate, onDrop, onHold }) => {
  const handlePanGesture = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY, velocityX, velocityY } = event.nativeEvent;
      
      // Détection des mouvements
      if (Math.abs(translationX) > Math.abs(translationY)) {
        // Mouvement horizontal
        if (translationX > 30) {
          onMove('right');
        } else if (translationX < -30) {
          onMove('left');
        }
      } else {
        // Mouvement vertical
        if (translationY > 30 || velocityY > 1000) {
          onDrop();
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Zone de swipe principal */}
      <PanGestureHandler onHandlerStateChange={handlePanGesture}>
        <View style={styles.swipeArea}>
          <Text style={styles.swipeText}>Zone de contrôle</Text>
          <Text style={styles.instructionText}>
            ← → Déplacer{'\n'}
            ↓ Chute rapide{'\n'}
            Tap: Rotation
          </Text>
        </View>
      </PanGestureHandler>
      
      {/* Boutons de contrôle */}
      <View style={styles.buttonContainer}>
        <View style={styles.leftButtons}>
          <TouchableOpacity 
            style={styles.moveButton}
            onPress={() => onMove('left')}
          >
            <Text style={styles.buttonText}>←</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.moveButton}
            onPress={() => onMove('right')}
          >
            <Text style={styles.buttonText}>→</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.rightButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onRotate}
          >
            <Text style={styles.buttonText}>↻</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onDrop}
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
  },
  swipeArea: {
    flex: 1,
    backgroundColor: 'rgba(22, 33, 62, 0.3)',
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0e4a67',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  swipeText: {
    color: '#64ffda',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionText: {
    color: '#8892b0',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  leftButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  moveButton: {
    backgroundColor: '#16213e',
    borderWidth: 2,
    borderColor: '#0e4a67',
    borderRadius: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#0e4a67',
    borderWidth: 2,
    borderColor: '#64ffda',
    borderRadius: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#64ffda',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default TouchControls;
