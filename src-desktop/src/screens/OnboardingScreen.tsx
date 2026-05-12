import type React from 'react';
import { useState } from 'react';
import { ChevronRight, ChevronLeft, Play, BarChart3, Award } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: Play,
    title: 'No Ads. No Noise.',
    subtitle: 'Just the puzzle.',
    description:
      'A clean, focused Sudoku experience without distractions. No banners, no popups — just you and the grid.',
  },
  {
    icon: Award,
    title: 'Six Difficulty Levels',
    subtitle: 'From Beginner to Master.',
    description:
      'Start with gentle warm-ups or jump straight into extreme challenges. Each tier unlocks as you prove your skill.',
  },
  {
    icon: BarChart3,
    title: 'Track Your Progress',
    subtitle: 'Statistics & streaks.',
    description:
      'Monitor your improvement with detailed stats, best times, and win streaks. See your 30-day activity at a glance.',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [current, setCurrent] = useState(0);
  const isLast = current === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const handlePrev = () => {
    setCurrent((c) => Math.max(0, c - 1));
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = SLIDES[current];
  const Icon = slide.icon;

  return (
    <div className="onboarding-root">
      {/* Skip button */}
      {!isLast && (
        <button className="onboarding-skip" type="button" onClick={handleSkip}>
          Skip
        </button>
      )}

      <div className="onboarding-card">
        {/* Icon */}
        <div className="onboarding-icon-ring">
          <Icon size={48} strokeWidth={1.5} />
        </div>

        {/* Text content */}
        <h1 className="onboarding-title">{slide.title}</h1>
        <p className="onboarding-subtitle">{slide.subtitle}</p>
        <p className="onboarding-desc">{slide.description}</p>

        {/* Pagination dots */}
        <div className="onboarding-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`onboarding-dot ${i === current ? 'active' : ''}`}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="onboarding-actions">
          {current > 0 && (
            <button
              className="ghost-button onboarding-btn"
              type="button"
              onClick={handlePrev}
            >
              <ChevronLeft size={18} strokeWidth={2} />
              Previous
            </button>
          )}
          <button
            className="primary-button onboarding-btn onboarding-btn-primary"
            type="button"
            onClick={handleNext}
          >
            {isLast ? 'Get Started' : 'Next'}
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};
