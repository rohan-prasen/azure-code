/**
 * Banner Component - Responsive ASCII Art
 * 
 * Professional ANSI Shadow style ASCII art for "AZURE CODE"
 * Two-color gradient with horizontal rule borders.
 * Adapts to terminal width dynamically.
 * 
 * @module components/Banner
 * @author Azure Code Team
 * @version 4.0.0
 */

import React from 'react';
import { Box, Text } from 'ink';
import { useTerminalSize, getResponsiveBorderWidth, shouldShowAsciiArt } from '../hooks/useTerminalSize.js';

const AZURE_BLUE = '#0078D4';
const AZURE_CYAN = '#50E6FF';

/**
 * Responsive banner with ANSI Shadow ASCII art
 * 
 * Features:
 * - Large multi-line "AZURE CODE" in ANSI Shadow font
 * - Two-color gradient (Azure Blue for AZURE, Azure Cyan for CODE)
 * - Responsive horizontal rule borders that adapt to terminal width
 * - Center-aligned for professional appearance
 * - Hides ASCII art on small terminals, shows simple text instead
 */
export const Banner = React.memo(function Banner() {
  const terminalSize = useTerminalSize();
  const borderWidth = getResponsiveBorderWidth(terminalSize.width);
  const showFullArt = shouldShowAsciiArt(terminalSize.width, terminalSize.height);
  
  // Simple fallback for very small terminals
  if (!showFullArt) {
    return (
      <Box flexDirection="column" paddingY={1}>
        <Box justifyContent="center">
          <Text color={AZURE_BLUE} bold>{'═'.repeat(Math.min(terminalSize.width - 4, 40))}</Text>
        </Box>
        <Box justifyContent="center" paddingY={1}>
          <Text color={AZURE_BLUE} bold>AZURE </Text>
          <Text color={AZURE_CYAN} bold>CODE</Text>
        </Box>
        <Box justifyContent="center">
          <Text color={AZURE_BLUE} bold>{'═'.repeat(Math.min(terminalSize.width - 4, 40))}</Text>
        </Box>
      </Box>
    );
  }
  
  return (
    <Box flexDirection="column" paddingY={2}>
      {/* Top border - double line for premium feel */}
      <Box justifyContent="center">
        <Text color={AZURE_BLUE}>{'╔' + '═'.repeat(borderWidth - 2) + '╗'}</Text>
      </Box>
      
      {/* AZURE - Line 1 */}
      <Box justifyContent="center">
        <Text color={AZURE_BLUE} bold>
          {'║ █████╗ ███████╗██╗   ██╗██████╗ ███████╗'}
        </Text>
      </Box>
      
      {/* AZURE - Line 2 */}
      <Box justifyContent="center">
        <Text color={AZURE_BLUE} bold>
          {'║██╔══██╗╚══███╔╝██║   ██║██╔══██╗██╔════╝'}
        </Text>
      </Box>
      
      {/* AZURE - Line 3 */}
      <Box justifyContent="center">
        <Text color={AZURE_BLUE} bold>
          {'║███████║  ███╔╝ ██║   ██║██████╔╝█████╗  '}
        </Text>
      </Box>
      
      {/* AZURE - Line 4 */}
      <Box justifyContent="center">
        <Text color={AZURE_BLUE} bold>
          {'║██╔══██║ ███╔╝  ██║   ██║██╔══██╗██╔══╝  '}
        </Text>
      </Box>
      
      {/* AZURE - Line 5 */}
      <Box justifyContent="center">
        <Text color={AZURE_BLUE} bold>
          {'║██║  ██║███████╗╚██████╔╝██║  ██║███████╗'}
        </Text>
      </Box>
      
      {/* Separator */}
      <Box justifyContent="center" marginTop={1} marginBottom={1}>
        <Text color={AZURE_CYAN}>{'║' + ' '.repeat(borderWidth - 2) + '║'}</Text>
      </Box>
      
      {/* CODE - Line 1 */}
      <Box justifyContent="center">
        <Text color={AZURE_CYAN} bold>
          {'║  ██████╗ ██████╗ ██████╗ ███████╗       '}
        </Text>
      </Box>
      
      {/* CODE - Line 2 */}
      <Box justifyContent="center">
        <Text color={AZURE_CYAN} bold>
          {'║ ██╔════╝██╔═══██╗██╔══██╗██╔════╝       '}
        </Text>
      </Box>
      
      {/* CODE - Line 3 */}
      <Box justifyContent="center">
        <Text color={AZURE_CYAN} bold>
          {'║ ██║     ██║   ██║██║  ██║█████╗         '}
        </Text>
      </Box>
      
      {/* CODE - Line 4 */}
      <Box justifyContent="center">
        <Text color={AZURE_CYAN} bold>
          {'║ ██║     ██║   ██║██║  ██║██╔══╝         '}
        </Text>
      </Box>
      
      {/* CODE - Line 5 */}
      <Box justifyContent="center">
        <Text color={AZURE_CYAN} bold>
          {'║ ╚██████╗╚██████╔╝██████╔╝███████╗       '}
        </Text>
      </Box>
      
      {/* Bottom border - double line */}
      <Box justifyContent="center" marginTop={1}>
        <Text color={AZURE_CYAN}>{'╚' + '═'.repeat(borderWidth - 2) + '╝'}</Text>
      </Box>
      
      {/* Tagline */}
      <Box justifyContent="center" marginTop={2}>
        <Text dimColor>AI-Powered Terminal Assistant • Professional Grade</Text>
      </Box>
    </Box>
  );
});
