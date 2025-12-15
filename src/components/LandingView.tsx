/**
 * Landing View Component
 * 
 * Composes atomic components to implement the Unified Landing Flow.
 * 
 * @module components/LandingView
 */

import React from 'react';
import { Box } from 'ink';
import { LandingHeader } from './LandingHeader.js';
import { ActionPrompt } from './ActionPrompt.js';

interface LandingViewProps {
    onSequenceComplete?: () => void;
}

import { useTerminalSize } from '../hooks/useTerminalSize.js';

export const LandingView = React.memo(({ }: LandingViewProps) => {
    const { width, height } = useTerminalSize();

    return (
        <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height={height}
            width={width}
        >
            {/* 1. Static Header */}
            <LandingHeader />

            {/* 2. Prompt Area */}
            <Box marginY={2} flexDirection="column" alignItems="center" minHeight={6}>
                <ActionPrompt />
            </Box>
        </Box>
    );
});
