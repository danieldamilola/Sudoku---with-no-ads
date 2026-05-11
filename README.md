# Sudoku — No Ads. No Noise. Just the Puzzle.

A clean, minimalist Sudoku game built with React Native for mobile and Tauri for desktop. Focus on the puzzle without distractions.

## Features

- **Clean Design**: Minimalist interface inspired by high-quality stationery
- **Multiple Difficulties**: Beginner, Skill, Hard, Advanced, Expert, Master
- **Game Statistics**: Track your progress, streaks, and best times
- **Game Tools**: Undo, Erase, Notes mode, and Hints
- **Dark Mode**: Easy on the eyes with a calming dark theme
- **Responsive**: Works on mobile devices and desktop
- **Zoom Controls**: Adjustable interface scale (65%-100%) on desktop
- **No Ads**: Pure puzzle experience
- **Persistent State**: Your game progress and settings are saved

## Tech Stack

### Mobile (React Native)
- React Native with Expo
- TypeScript
- Zustand for state management
- Expo Haptics for haptic feedback
- AsyncStorage for persistence

### Desktop (Tauri)
- React with Vite
- TypeScript
- Zustand for state management
- Tauri for desktop wrapper
- Rust for native code

## Project Structure

```
sudoku_app/
├── src/                    # Mobile React Native source
│   ├── components/         # Reusable components
│   ├── screens/           # Screen components
│   ├── store/             # Zustand store
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── assets/            # Images and icons
├── src-desktop/           # Desktop React source
│   ├── src/
│   │   ├── components/    # Desktop components
│   │   ├── screens/       # Desktop screens
│   │   ├── store/         # Zustand store
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   └── context/       # React contexts
│   └── src-tauri/        # Tauri native code (Rust)
└── android/              # Android native code (generated)
```

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- For desktop: Rust and Cargo
- For Android: Android Studio with SDK

### Mobile Setup

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android device/emulator
npx expo start --android

# Run on iOS device/simulator (macOS only)
npx expo start --ios
```

### Desktop Setup

```bash
# Navigate to desktop directory
cd src-desktop

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run tauri build
```

## Building

### Mobile APK

```bash
# Prebuild native files
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

### Desktop Executable

```bash
cd src-desktop
npm run tauri build

# Executables location: src-desktop/src-tauri/target/release/
# - sudoku-desktop.exe (raw executable)
# - Sudoku_1.0.0_x64-setup.exe (NSIS installer)
# - Sudoku_1.0.0_x64_en-US.msi (MSI installer)
```

## Development

### Mobile Development

```bash
# Start Expo development server
npx expo start

# Open in Expo Go app
# Scan QR code with Expo Go (Android) or Camera app (iOS)
```

### Desktop Development

```bash
cd src-desktop

# Start Vite dev server
npm run dev

# Open http://localhost:5173 in browser
```

## Configuration

### Game Settings

- **Dark Mode**: Toggle between light and dark themes
- **Mistake Limit**: Set maximum allowed mistakes (Off, 3, 5)
- **Show Mistakes**: Highlight incorrect entries immediately
- **Highlight Duplicates**: Show matching digits when a cell is selected
- **Auto-remove Notes**: Remove placed digits from nearby pencil marks
- **Show Timer**: Display game timer
- **Haptic Feedback**: Vibration on mobile (Android only)
- **Sound Effects**: Audio feedback (not yet implemented)

### Desktop Zoom

Use keyboard shortcuts or settings to adjust zoom:
- **Ctrl +**: Zoom in (+5%)
- **Ctrl -**: Zoom out (-5%)
- **Range**: 65% to 100%

## Game Controls

### Mobile
- Tap a cell to select it
- Use the number pad to enter numbers
- Tap the Notes button to enable pencil marks
- Use Undo, Erase, and Hint buttons as needed

### Desktop
- Click a cell to select it
- Use the number pad or keyboard (1-9) to enter numbers
- Use Backspace/Delete to erase
- Press N to toggle Notes mode
- Use Ctrl+Z to undo

## Difficulty Levels

| Level | Description | Avg Time |
|-------|-------------|----------|
| Beginner | Gentle logic for a quick mental break | 3-5 min |
| Skill | Balanced puzzles for daily focus | 8-12 min |
| Hard | Complex patterns and deep strategy | 15-25 min |
| Advanced | Challenging for experienced players | 25-35 min |
| Expert | Extreme challenges for the dedicated | 35-45 min |
| Master | Ultimate challenge for Sudoku masters | 45+ min |

## Design System

The app follows a "Calm Minimalism" design philosophy:
- Warm, paper-like neutral colors
- Indigo Blue as the primary accent color
- DM Sans for UI text
- DM Mono for the Sudoku grid
- Soft, rounded corners (8px)
- Flat design without shadows

See `DESIGN.md` for detailed design specifications.

## License

This project is 

## Credits

Built with React Native, Expo, and Tauri.
