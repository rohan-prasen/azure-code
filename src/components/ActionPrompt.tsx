/**
 * Action Prompt Component
 * 
 * Displays the "Press Enter to start" prompt with a blinking cursor.
 * Isolated to contain the blink interval logic.
 * 
 * @module components/ActionPrompt
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../lib/theme.js';

export const ActionPrompt = React.memo(() => {
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setShowCursor(prev => !prev), 800);
        return () => clearInterval(timer);
    }, []);

    return (
        <Box flexDirection="column" alignItems="center">
            <Box marginTop={1}>
                <Text color={THEME.colors.text.dim}>Press </Text>
                <Text color={THEME.colors.white} bold>Enter</Text>
                <Text color={THEME.colors.text.dim}> to start</Text>
                <Text color={THEME.colors.primary} bold>{showCursor ? ' █' : '  '}</Text>
            </Box>


        </Box>
    );
});
