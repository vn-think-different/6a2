import confetti from 'canvas-confetti';

export const triggerCelebration = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'],
  });
};

export const triggerHeartCelebration = () => {
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: ['#f43f5e', '#fb7185', '#fda4af'],
  });
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: ['#f43f5e', '#fb7185', '#fda4af'],
  });
};
