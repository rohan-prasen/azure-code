/**
 * Pacman Loading Animation
 * 
 * Clean Pacman-style loading animation in Azure colors
 * 
 * @module components/PacmanLoader
 * @author Azure Code Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

const AZURE_CYAN = '#50E6FF';

export function PacmanLoader() {
  const [frame, setFrame] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(prev => (prev + 1) % 4);
    }, 200);
    
    return () => clearInterval(timer);
  }, []);
  
  // Pacman animation frames
  const pacmanFrames = ['ᗧ', 'ᗣ', 'ᗤ', 'ᗣ'];
  const dots = ['···', '·· ', '·  ', '   '];
  
  return (
    <Box>
      <Text color={AZURE_CYAN} bold>
        {pacmanFrames[frame]} {dots[frame]}
      </Text>
    </Box>
  );
}
