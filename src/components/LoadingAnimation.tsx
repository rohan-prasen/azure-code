/**
 * Loading Animation - Responsive Continuous Pacman
 * 
 * Single pacman eating through stages with synchronized text and dots
 * Each stage takes 1 second, pacman eats continuously
 * Adapts to terminal size dynamically
 * 
 * @module components/LoadingAnimation
 * @author Azure Code Team
 * @version 5.0.0
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { useTerminalSize, getResponsiveBorderWidth, shouldShowAsciiArt } from '../hooks/useTerminalSize.js';

const AZURE_BLUE = '#0078D4';
const AZURE_CYAN = '#50E6FF';

interface LoadingAnimationProps {
  onComplete?: () => void;
}

const LOADING_STAGES = ['UI Components', 'Models', 'Connections'];
const PACMAN_FRAMES = ['ᗧ', 'ᗤ', 'ᗧ', 'ᗤ'];
const TOTAL_DURATION = 3000; // 3 seconds total
const ANIMATION_SPEED = 50; // Frame update speed

export function LoadingAnimation({ onComplete }: LoadingAnimationProps) {
  const terminalSize = useTerminalSize();
  const [pacmanFrame, setPacmanFrame] = useState(0);
  const [pacmanPosition, setPacmanPosition] = useState(0);
  const [startTime] = useState(Date.now());
  
  const borderWidth = getResponsiveBorderWidth(terminalSize.width);
  const showFullArt = shouldShowAsciiArt(terminalSize.width, terminalSize.height);
  
  // Responsive track length based on terminal width
  const trackLength = Math.max(Math.min(terminalSize.width - 20, 90), 30);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      // Check if completed
      if (elapsed >= TOTAL_DURATION) {
        clearInterval(interval);
        setTimeout(() => onComplete?.(), 300);
        return;
      }
      
      // Update pacman frame (mouth animation)
      setPacmanFrame(prev => (prev + 1) % PACMAN_FRAMES.length);
      
      // Update pacman position (continuous movement, no reset)
      setPacmanPosition(Math.floor((elapsed / TOTAL_DURATION) * trackLength));
      
    }, ANIMATION_SPEED);

    return () => clearInterval(interval);
  }, [startTime, trackLength, onComplete]);

  // Determine current stage based on time
  const elapsed = Date.now() - startTime;
  const currentStageIndex = Math.min(
    Math.floor(elapsed / 1000), 
    LOADING_STAGES.length - 1
  );
  
  // Build dot progress: show filling animation within current stage
  const stageProgress = (elapsed % 1000) / 1000; // 0 to 1 within current stage
  
  const dots = LOADING_STAGES.map((_, index) => {
    if (index < currentStageIndex) {
      return '●'; // Filled - completed stage
    } else if (index === currentStageIndex) {
      // Current stage - show filling animation
      if (stageProgress < 0.5) {
        return '◐'; // Half filled
      } else {
        return '●'; // Filled
      }
    } else {
      return '○'; // Empty - pending stage
    }
  }).join(' ');

  // Pacman animation - continuous eating
  const pacman = PACMAN_FRAMES[pacmanFrame];
  const eaten = ' '.repeat(pacmanPosition);
  const remaining = '·'.repeat(Math.max(0, trackLength - pacmanPosition));
  
  // Simple version for small terminals
  if (!showFullArt) {
    return (
      <Box flexDirection="column" alignItems="center" justifyContent="center" height="100%" width="100%">
        <Box justifyContent="center">
          <Text color={AZURE_BLUE} bold>AZURE </Text>
          <Text color={AZURE_CYAN} bold>CODE</Text>
        </Box>
        
        <Box justifyContent="center" marginTop={2} marginBottom={1}>
          <Text color={AZURE_CYAN} bold>
            {LOADING_STAGES[currentStageIndex]}
          </Text>
        </Box>

        <Box justifyContent="center" marginBottom={1}>
          <Text>{eaten}</Text>
          <Text color={AZURE_CYAN} bold>{pacman}</Text>
          <Text dimColor>{remaining}</Text>
        </Box>

        <Box justifyContent="center">
          <Text color={AZURE_BLUE}>
            {dots}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" height="100%" width="100%">
      {/* Top border - responsive */}
      <Box justifyContent="center">
        <Text color={AZURE_BLUE}>{'═'.repeat(borderWidth)}</Text>
      </Box>
      
      {/* AZURE - Line 1 */}
      <Box justifyContent="center" marginTop={1}>
        <Text color={AZURE_BLUE} bold>
          {' █████╗ ███████╗██╗   ██╗██████╗ ███████╗'}
        </Text>
      </Box>
      
      {/* AZURE - Line 2 */}
      <Box justifyContent="center">
        <Text color={AZURE_BLUE} bold>
          {'██╔══██╗╚══███╔╝██║   ██║██╔══██╗██╔════╝'}
        </Text>
      </Box>
      
      {/* AZURE - Line 3 */}
      <Box justifyContent="center">
        <Text color={AZURE_BLUE} bold>
          {'███████║  ███╔╝ ██║   ██║██████╔╝█████╗  '}
        </Text>
      </Box>
      
      {/* AZURE - Line 4 */}
      <Box justifyContent="center">
        <Text color={AZURE_BLUE} bold>
          {'██╔══██║ ███╔╝  ██║   ██║██╔══██╗██╔══╝  '}
        </Text>
      </Box>
      
      {/* AZURE - Line 5 */}
      <Box justifyContent="center" marginBottom={1}>
        <Text color={AZURE_BLUE} bold>
          {'██║  ██║███████╗╚██████╔╝██║  ██║███████╗'}
        </Text>
      </Box>
      
      {/* CODE - Line 1 */}
      <Box justifyContent="center" marginTop={1}>
        <Text color={AZURE_CYAN} bold>
          {' ██████╗ ██████╗ ██████╗ ███████╗'}
        </Text>
      </Box>
      
      {/* CODE - Line 2 */}
      <Box justifyContent="center">
        <Text color={AZURE_CYAN} bold>
          {'██╔════╝██╔═══██╗██╔══██╗██╔════╝'}
        </Text>
      </Box>
      
      {/* CODE - Line 3 */}
      <Box justifyContent="center">
        <Text color={AZURE_CYAN} bold>
          {'██║     ██║   ██║██║  ██║█████╗  '}
        </Text>
      </Box>
      
      {/* CODE - Line 4 */}
      <Box justifyContent="center">
        <Text color={AZURE_CYAN} bold>
          {'██║     ██║   ██║██║  ██║██╔══╝  '}
        </Text>
      </Box>
      
      {/* CODE - Line 5 */}
      <Box justifyContent="center" marginBottom={1}>
        <Text color={AZURE_CYAN} bold>
          {'╚██████╗╚██████╔╝██████╔╝███████╗'}
        </Text>
      </Box>
      
      {/* Bottom border - responsive */}
      <Box justifyContent="center" marginTop={1} marginBottom={2}>
        <Text color={AZURE_BLUE}>{'═'.repeat(borderWidth)}</Text>
      </Box>

      {/* Current stage text - changes every second */}
      <Box justifyContent="center" marginBottom={1}>
        <Text color={AZURE_CYAN} bold>
          {LOADING_STAGES[currentStageIndex]}
        </Text>
      </Box>

      {/* Pacman animation - single continuous pacman with responsive track */}
      <Box justifyContent="center" marginBottom={1}>
        <Text>{eaten}</Text>
        <Text color={AZURE_CYAN} bold>{pacman}</Text>
        <Text dimColor>{remaining}</Text>
      </Box>

      {/* Dot progress indicator - fills as stages complete */}
      <Box justifyContent="center">
        <Text color={AZURE_BLUE}>
          {dots}
        </Text>
      </Box>
    </Box>
  );
}
