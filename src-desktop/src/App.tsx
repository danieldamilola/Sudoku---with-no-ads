import { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';
import { StatisticsScreen } from './screens/StatisticsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { useStore } from './store/useStore';
import type { Screen, Difficulty } from './types';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const { startNewGame } = useStore();
  const darkMode = useStore((s) => s.settings.darkMode);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const handleStartGame = (difficulty: Difficulty) => {
    startNewGame(difficulty);
    setCurrentScreen('game');
  };

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onStartGame={handleStartGame} onNavigateGame={() => setCurrentScreen('game')} />;
      case 'game':
        return <GameScreen onBack={() => setCurrentScreen('home')} onNavigate={handleNavigate} />;
      case 'stats':
        return <StatisticsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen onStartGame={handleStartGame} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="app-shell">
        {currentScreen !== 'game' && (
          <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} />
        )}
        {renderScreen()}
      </div>
    </ThemeProvider>
  );
}

export default App;
