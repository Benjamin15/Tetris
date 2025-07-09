import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MenuScreen = ({ onNavigate }) => {
  const [selectedMode, setSelectedMode] = useState(null);

  const handlePlaySolo = () => {
    onNavigate('game', { mode: 'solo' });
  };

  const handlePlayMultiplayer = () => {
    Alert.alert(
      'Mode Multijoueur',
      'Chercher un adversaire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Chercher', onPress: () => onNavigate('lobby', { mode: 'multiplayer' }) }
      ]
    );
  };

  const handlePlayVersus = () => {
    onNavigate('versus');
  };

  const handleTraining = () => {
    onNavigate('game', { mode: 'training' });
  };

  return (
    <View style={styles.container}>
      {/* Titre */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>TETRIS</Text>
        <Text style={styles.subtitle}>BATTLE ROYALE</Text>
      </View>

      {/* Menu principal */}
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={[styles.menuButton, styles.soloButton]}
          onPress={handlePlaySolo}
        >
          <Text style={styles.buttonText}>JOUER SOLO</Text>
          <Text style={styles.buttonSubtext}>Mode classique</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuButton, styles.multiplayerButton]}
          onPress={handlePlayMultiplayer}
        >
          <Text style={styles.buttonText}>BATTLE ROYALE</Text>
          <Text style={styles.buttonSubtext}>1 vs 1</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuButton, styles.versusButton]}
          onPress={handlePlayVersus}
        >
          <Text style={styles.buttonText}>VERSUS LOCAL</Text>
          <Text style={styles.buttonSubtext}>2 joueurs - même écran</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuButton, styles.trainingButton]}
          onPress={handleTraining}
        >
          <Text style={styles.buttonText}>ENTRAÎNEMENT</Text>
          <Text style={styles.buttonSubtext}>Pratique libre</Text>
        </TouchableOpacity>
      </View>

      {/* Informations supplémentaires */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Glissez pour déplacer{'\n'}
          Tapez pour tourner{'\n'}
          Glissez vers le bas pour chute rapide
        </Text>
      </View>

      {/* Animation de fond avec des blocs */}
      <View style={styles.backgroundAnimation}>
        {[...Array(20)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.floatingBlock,
              {
                left: Math.random() * screenWidth,
                top: Math.random() * screenHeight,
                backgroundColor: [
                  '#00f0f0', '#f0f000', '#a000f0', '#00f000',
                  '#f00000', '#0000f0', '#f0a000'
                ][Math.floor(Math.random() * 7)],
                opacity: 0.1,
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#64ffda',
    textShadowColor: '#0e4a67',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#8892b0',
    marginTop: 8,
    letterSpacing: 2,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 300,
  },
  menuButton: {
    backgroundColor: '#16213e',
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  soloButton: {
    borderColor: '#64ffda',
  },
  multiplayerButton: {
    borderColor: '#ff6b6b',
  },
  versusButton: {
    borderColor: '#4ecdc4',
  },
  trainingButton: {
    borderColor: '#f0a000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#8892b0',
    fontSize: 14,
  },
  infoContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: 'rgba(22, 33, 62, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0e4a67',
  },
  infoText: {
    color: '#8892b0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  backgroundAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  floatingBlock: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 2,
  },
});

export default MenuScreen;
