/**
 * System Log Component
 * 
 * Displays simulated system initialization logs during startup.
 * Adds a technical "boot sequence" aesthetic.
 * 
 * @module components/SystemLog
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../lib/theme.js';

const BOOT_LOGS = [
    'Initializing Core Systems...',
    'Loading Azure Context...',
    'Verifying AI Models...',
    'Establishing Secure Link...',
    'Optimizing Tokenizer...',
    'Syncing with Cloud Foundry...',
    'System Ready.'
];

const LOG_INTERVAL = 400; // Change log every 400ms

export const SystemLog = React.memo(() => {
    const [logIndex, setLogIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setLogIndex(prev => {
                if (prev >= BOOT_LOGS.length - 1) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, LOG_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    const currentLog = BOOT_LOGS[logIndex];

    return (
        <Box marginTop={1}>
            <Text color={THEME.colors.primary} bold>{'> '}</Text>
            <Text color={THEME.colors.text.dim}>{currentLog}</Text>
        </Box>
    );
});
