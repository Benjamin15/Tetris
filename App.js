import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';
import LobbyScreen from './src/screens/LobbyScreen';
import VersusScreen from './src/screens/VersusScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [gameConfig, setGameConfig] = useState(null);

  const navigateToScreen = (screen, config = null) => {
    setCurrentScreen(screen);
    if (config) setGameConfig(config);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return <MenuScreen onNavigate={navigateToScreen} />;
      case 'lobby':
        return <LobbyScreen onNavigate={navigateToScreen} />;
      case 'game':
        return <GameScreen onNavigate={navigateToScreen} config={gameConfig} />;
      case 'versus':
        return <VersusScreen onNavigate={navigateToScreen} />;
      default:
        return <MenuScreen onNavigate={navigateToScreen} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});
