/**
 * Command Dropdown Component - Compact
 * 
 * Minimalist command autocomplete.
 * 
 * @module components/CommandDropdown
 * @author Azure Code Team
 * @version 3.0.0
 */

import React from 'react';
import { Box, Text } from 'ink';
import { SLASH_COMMANDS } from '../lib/commands/parser.js';

interface CommandDropdownProps {
  filter: string;
  selectedIndex: number;
}

const AZURE_BLUE = '#0078D4';
const AZURE_CYAN = '#50E6FF';

export function CommandDropdown({ filter, selectedIndex }: CommandDropdownProps) {
  // Filter commands based on input
  const searchTerm = filter.toLowerCase().replace(/^\//, '');
  
  const filteredCommands = SLASH_COMMANDS.filter(cmd => {
    if (!searchTerm) return true;
    return (
      cmd.name.toLowerCase().includes(searchTerm) ||
      cmd.description.toLowerCase().includes(searchTerm) ||
      (cmd.aliases && cmd.aliases.some(a => a.toLowerCase().includes(searchTerm)))
    );
  });

  if (filteredCommands.length === 0) {
    return null;
  }

  // Limit to 6 visible commands
  const visibleCommands = filteredCommands.slice(0, 6);
  const hasMore = filteredCommands.length > 6;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={AZURE_BLUE}
      paddingX={1}
      paddingY={0}
    >
      {/* Command list */}
      {visibleCommands.map((cmd, index) => {
        const isSelected = index === selectedIndex;
        
        return (
          <Box key={cmd.name}>
            <Text 
              color={isSelected ? AZURE_CYAN : undefined}
              bold={isSelected}
              dimColor={!isSelected}
            >
              {isSelected ? '› ' : '  '}
              /{cmd.name}
            </Text>
            <Text dimColor> {cmd.description}</Text>
          </Box>
        );
      })}

      {/* Show more indicator */}
      {hasMore && (
        <Box>
          <Text dimColor>  +{filteredCommands.length - 6} more</Text>
        </Box>
      )}
    </Box>
  );
}
