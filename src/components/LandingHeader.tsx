/**
 * Landing Header Component
 * 
 * Static header containing the Welcome Box and ASCII Art.
 * Strictly memoized to prevent re-renders during animations.
 * 
 * @module components/LandingHeader
 */

import React from 'react';
import { Box } from 'ink';
import { WelcomeBox } from './WelcomeBox.js';
import { BlockAsciiArt } from './BlockAsciiArt.js';

export const LandingHeader = React.memo(() => {
    return (
        <Box flexDirection="column" alignItems="center">
            <WelcomeBox />
            <BlockAsciiArt />
        </Box>
    );
});
