/**
 * Banner Component - Landing Page
 * 
 * Assembles the "Claude Code" style landing page:
 * 1. Welcome Box
 * 2. Block ASCII Art
 * 3. Blinking "Press Enter" prompt
 * 
 * @module components/Banner
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { WelcomeBox } from './WelcomeBox.js';
import { BlockAsciiArt } from './BlockAsciiArt.js';
import { THEME } from '../lib/theme.js';

export const Banner = React.memo(function Banner() {
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const timer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box flexDirection="column" alignItems="center" paddingY={2}>
      {/* 1. Welcome Box */}
      <WelcomeBox />

      {/* 2. ASCII Art Logo */}
      <BlockAsciiArt />

      {/* 3. Press Enter Prompt */}
      <Box marginTop={2}>
        <Text color={THEME.colors.text.dim}>Press </Text>
        <Text color={THEME.colors.white} bold>Enter</Text>
        <Text color={THEME.colors.text.dim}> to continue</Text>
        <Text color={THEME.colors.primary} bold>{showCursor ? ' █' : '  '}</Text>
      </Box>
    </Box>
  );
});
