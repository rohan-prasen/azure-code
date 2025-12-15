/**
 * Block ASCII Art Component
 * 
 * Renders the custom 8-bit block style "AZURE CODE" logo.
 * Uses the pre-defined block font lines for perfect retro alignment.
 */
import React from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../lib/theme.js';
import { LOGO_LINES } from '../lib/blockFont.js';

export const BlockAsciiArt = () => {
    return (
        <Box flexDirection="column" alignItems="center" marginY={1}>
            {/* AZURE - Primary Blue */}
            <Box flexDirection="column" marginBottom={1}>
                {LOGO_LINES.AZURE.map((line, i) => (
                    <Text key={`azure-${i}`} color={THEME.colors.primary} bold>
                        {line}
                    </Text>
                ))}
            </Box>

            {/* CODE - Secondary Cyan */}
            <Box flexDirection="column">
                {LOGO_LINES.CODE.map((line, i) => (
                    <Text key={`code-${i}`} color={THEME.colors.primary} dimColor bold>
                        {line}
                    </Text>
                ))}
            </Box>
        </Box>
    );
};
