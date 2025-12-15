/**
 * Header Component - Responsive Minimal
 * 
 * Ultra-minimal single-line header that adapts to terminal width.
 * Just the essentials, no wasted space.
 * 
 * @module components/Header
 * @author Azure Code Team
 * @version 3.0.0
 */

import React from 'react';
import { Box, Text } from 'ink';
import { MODELS } from '../lib/models/config.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';

const AZURE_BLUE = '#0078D4';

interface HeaderProps {
  model: string;
  isLoading: boolean;
  tokenCount?: number;
}

/**
 * Responsive minimal header
 */
export function Header({ model, isLoading, tokenCount }: HeaderProps) {
  const modelConfig = MODELS[model];
  const terminalSize = useTerminalSize();
  const status = isLoading ? '⋯' : '●';
  const statusColor = isLoading ? AZURE_BLUE : 'green';
  
  // Show abbreviated model name on small terminals
  const modelName = terminalSize.isSmall 
    ? (modelConfig?.name.split(' ').map(w => w[0]).join('') || model.slice(0, 10))
    : (modelConfig?.name || model);
  
  return (
    <Box paddingX={2} paddingY={1} justifyContent="space-between">
      <Box>
        <Text color={AZURE_BLUE} bold>Azure Code</Text>
        {!terminalSize.isSmall && <Text dimColor> {modelName}</Text>}
      </Box>
      <Text color={statusColor}>{status}</Text>
    </Box>
  );
}
