/**
 * Welcome Box Component
 * 
 * Renders the "* Welcome to Azure Code" message in a bordered box.
 * Matches the specific aesthetic of the Claude Code screenshots.
 */
import React from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../lib/theme.js';

export const WelcomeBox = () => {
    return (
        <Box
            borderStyle={THEME.styles.boxBorder}
            borderColor={THEME.colors.primary}
            paddingX={2}
            paddingY={0}
            marginBottom={1}
        >
            <Text color={THEME.colors.primary} bold>{'* '}</Text>
            <Text color={THEME.colors.text.main}>Welcome to </Text>
            <Text color={THEME.colors.white} bold>Azure Code</Text>
        </Box>
    );
};
