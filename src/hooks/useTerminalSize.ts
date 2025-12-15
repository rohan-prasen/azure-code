/**
 * Terminal Size Hook
 * 
 * Tracks terminal dimensions and provides responsive sizing utilities
 * Updates smoothly when terminal is resized
 * 
 * @module hooks/useTerminalSize
 * @author Azure Code Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';

export interface TerminalSize {
  width: number;
  height: number;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
}

/**
 * Hook to track terminal size with responsive breakpoints
 * 
 * Breakpoints:
 * - Small: < 80 columns
 * - Medium: 80-120 columns
 * - Large: > 120 columns
 * 
 * @returns Terminal size with responsive flags
 */
export function useTerminalSize(): TerminalSize {
  const [size, setSize] = useState<TerminalSize>(() => {
    const width = process.stdout.columns || 80;
    const height = process.stdout.rows || 24;
    
    return {
      width,
      height,
      isSmall: width < 80,
      isMedium: width >= 80 && width <= 120,
      isLarge: width > 120,
    };
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events to prevent layout thrashing
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = process.stdout.columns || 80;
        const height = process.stdout.rows || 24;
        
        setSize(prev => {
          // Only update if dimensions actually changed
          if (prev.width === width && prev.height === height) return prev;
          
          return {
            width,
            height,
            isSmall: width < 80,
            isMedium: width >= 80 && width <= 120,
            isLarge: width > 120,
          };
        });
      }, 100);
    };

    // Listen for terminal resize events
    process.stdout.on('resize', handleResize);

    return () => {
      process.stdout.off('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return size;
}

/**
 * Get responsive padding based on terminal width
 * 
 * @param terminalWidth - Current terminal width
 * @returns Padding value (0-2)
 */
export function getResponsivePadding(terminalWidth: number): number {
  if (terminalWidth < 80) return 1;
  if (terminalWidth < 120) return 2;
  return 2;
}

/**
 * Get responsive border width for ASCII art
 * 
 * @param terminalWidth - Current terminal width
 * @returns Border character count
 */
export function getResponsiveBorderWidth(terminalWidth: number): number {
  if (terminalWidth < 80) return Math.min(terminalWidth - 10, 50);
  if (terminalWidth < 120) return 65;
  return Math.min(terminalWidth - 20, 100);
}

/**
 * Check if ASCII art should be shown based on terminal size
 * 
 * @param terminalWidth - Current terminal width
 * @param terminalHeight - Current terminal height
 * @returns True if terminal is large enough for ASCII art
 */
export function shouldShowAsciiArt(terminalWidth: number, terminalHeight: number): boolean {
  return terminalWidth >= 60 && terminalHeight >= 20;
}

/**
 * Get maximum message display count based on terminal height
 * 
 * @param terminalHeight - Current terminal height
 * @returns Number of messages to display
 */
export function getMaxMessageCount(terminalHeight: number): number {
  // Reserve space for header (3 lines) and input (3 lines)
  const availableLines = Math.max(terminalHeight - 6, 5);
  // Each message takes roughly 4-5 lines (header + content + spacing)
  return Math.floor(availableLines / 5);
}
