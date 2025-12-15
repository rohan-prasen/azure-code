/**
 * Loading Animation Component (Pacman Only)
 * 
 * Handles the high-frequency Pacman animation loop.
 * Renders full-screen and perfectly centered.
 * 
 * @module components/LoadingAnimation
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../lib/theme.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import { SystemLog } from './SystemLog.js';

const LOADING_STAGES = ['UI Components', 'Models', 'Connections'];
const PACMAN_FRAMES = ['ᗧ', 'ᗤ', 'ᗧ', 'ᗤ'];
const TOTAL_DURATION = 3000; // 3 seconds
const ANIMATION_SPEED = 80;

interface LoadingAnimationProps {
  onComplete: () => void;
}

export const LoadingAnimation = React.memo(({ onComplete }: LoadingAnimationProps) => {
  const { width: terminalWidth, height: terminalHeight } = useTerminalSize();
  const [pacmanFrame, setPacmanFrame] = useState(0);
  const [pacmanPosition, setPacmanPosition] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Responsive track length
  const trackLength = Math.max(Math.min(terminalWidth - 20, 60), 30);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const currentElapsed = now - startTime;

      if (currentElapsed >= TOTAL_DURATION) {
        setElapsed(TOTAL_DURATION); // Clamp to end
        clearInterval(interval);
        onComplete();
        return;
      }

      setElapsed(currentElapsed);
      setPacmanFrame(prev => (prev + 1) % PACMAN_FRAMES.length);
      setPacmanPosition(Math.floor((currentElapsed / TOTAL_DURATION) * trackLength));
    }, ANIMATION_SPEED);

    return () => clearInterval(interval);
  }, [startTime, trackLength, onComplete]);

  // Derived calculations 
  const currentStageIndex = Math.min(
    Math.floor(elapsed / 1000),
    LOADING_STAGES.length - 1
  );

  const stageProgress = (elapsed % 1000) / 1000;

  const dots = useMemo(() => LOADING_STAGES.map((_, index) => {
    if (index < currentStageIndex) {
      return '●';
    } else if (index === currentStageIndex) {
      return stageProgress < 0.5 ? '◐' : '●';
    } else {
      return '○';
    }
  }).join(' '), [currentStageIndex, stageProgress]);

  const pacman = PACMAN_FRAMES[pacmanFrame];
  const eaten = ' '.repeat(pacmanPosition);
  const remaining = '·'.repeat(Math.max(0, trackLength - pacmanPosition));

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height={terminalHeight}
      width={terminalWidth}
    >
      {/* Stage Name */}
      <Box marginBottom={1}>
        <Text color={THEME.colors.secondary} bold>
          {LOADING_STAGES[currentStageIndex]}
        </Text>
      </Box>

      {/* The Track */}
      <Box marginBottom={1}>
        <Text>{eaten}</Text>
        <Text color={THEME.colors.secondary} bold>{pacman}</Text>
        <Text dimColor>{remaining}</Text>
      </Box>

      {/* Stage Dots */}
      <Box>
        <Text color={THEME.colors.primary}>
          {dots}
        </Text>
      </Box>

      {/* System Boot Log */}
      <SystemLog />
    </Box>
  );
});
