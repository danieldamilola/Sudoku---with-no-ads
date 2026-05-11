import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  active = false,
  style,
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: '#3b5bdb',
      color: '#ffffff',
      border: 'none',
    },
    secondary: {
      backgroundColor: active ? '#dbe4ff' : '#ffffff',
      color: active ? '#3b5bdb' : '#1a1a1a',
      border: '1px solid #dee2e6',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#3b5bdb',
      border: 'none',
    },
    dark: {
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      border: 'none',
    },
  };

  return (
    <button
      style={{
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '14px',
        fontWeight: '600',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.5 : 1,
        ...variantStyles[variant],
        ...style,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
