import { useEffect, useRef, useState, Component } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import { Sidebar } from "./components/Sidebar";
import { HomeScreen } from "./screens/HomeScreen";
import { GameScreen } from "./screens/GameScreen";
import { StatisticsScreen } from "./screens/StatisticsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { MultiplayerGameScreen } from "./screens/MultiplayerGameScreen";
import { useStore } from "./store/useStore";
import type { Screen, Difficulty } from "./types";

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)", color: "var(--ink)", fontFamily: "DM Sans, sans-serif" }}>
          <div style={{ textAlign: "center", maxWidth: 480, padding: 40 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 12px" }}>Something went wrong</h1>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: "var(--ink)", color: "var(--bg)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ONBOARDING_KEY = "sudoku_onboarding_completed";

function AppContent() {
  const [onboardingDone, setOnboardingDone] = useState<boolean>(() => localStorage.getItem(ONBOARDING_KEY) === "true");
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [activeLobbyCode, setActiveLobbyCode] = useState<string | null>(null);
  const { loading, displayName } = useAuth();
  const { showToast } = useToast();
  const { startNewGame } = useStore();
  const darkMode = useStore((s) => s.settings.darkMode);
  const zoomLevel = useStore((s) => s.settings.zoomLevel);
  const setZoomLevel = useStore((s) => s.setZoomLevel);
  const unlockedDiffs = useStore((s) => s.settings.unlockedDifficulties);
  const prevUnlockedRef = useRef<string[]>(unlockedDiffs);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty("--zoom-scale", String(zoomLevel / 100));
  }, [zoomLevel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;
      if (e.key === "+" || e.key === "=") { e.preventDefault(); setZoomLevel(useStore.getState().settings.zoomLevel + 5); }
      else if (e.key === "-") { e.preventDefault(); setZoomLevel(useStore.getState().settings.zoomLevel - 5); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setZoomLevel]);

  useEffect(() => {
    const LABELS: Record<string, string> = { hard: "Hard", advanced: "Advanced", expert: "Expert", master: "Master" };
    const prev = prevUnlockedRef.current;
    unlockedDiffs.forEach((d) => { if (!prev.includes(d) && LABELS[d]) showToast("🔓", `${LABELS[d]} difficulty unlocked!`); });
    prevUnlockedRef.current = unlockedDiffs;
  }, [unlockedDiffs, showToast]);

  const handleStartGame = (difficulty: Difficulty) => {
    startNewGame(difficulty);
    setCurrentScreen("game");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--muted)" }}>
        Loading…
      </div>
    );
  }

  if (!onboardingDone) {
    return <OnboardingScreen onComplete={() => { localStorage.setItem(ONBOARDING_KEY, "true"); setOnboardingDone(true); }} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen onStartGame={handleStartGame} onNavigateGame={() => setCurrentScreen("game")} />;
      case "game":
        return <GameScreen onBack={() => setCurrentScreen("home")} onNavigate={setCurrentScreen} />;
      case "stats":
        return <StatisticsScreen />;
      case "settings":
        return <SettingsScreen />;
      case "profile":
        return <ProfileScreen />;
      case "multiplayer":
        return activeLobbyCode
          ? <MultiplayerGameScreen lobbyCode={activeLobbyCode} onLeave={() => { setActiveLobbyCode(null); setCurrentScreen("multiplayer"); }} />
          : <LobbyScreen onJoinLobby={(code) => setActiveLobbyCode(code)} />;
      default:
        return <HomeScreen onStartGame={handleStartGame} />;
    }
  };

  return (
    <div className="app-shell">
      {currentScreen !== "game" && !activeLobbyCode && (
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          displayName={displayName}
        />
      )}
      {renderScreen()}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
