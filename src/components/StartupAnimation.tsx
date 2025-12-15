/**
 * Startup Animation Component
 * 
 * Displays the "while(curious)" code snippet animation
 * mimicking the Claude Code startup sequence.
 */
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../lib/theme.js';

const CODE_LINES = [
    { text: 'while', color: '#C586C0' }, // keyword
    { text: '(', color: '#D4D4D4' },
    { text: 'curious', color: '#9CDCFE' }, // variable
    { text: ') {', color: '#D4D4D4' },

    { text: '  question_everything', color: '#DCDCAA' }, // function
    { text: '();', color: '#D4D4D4' },

    { text: '  dig_deeper', color: '#DCDCAA' },
    { text: '();', color: '#D4D4D4' },

    { text: '  connect_dots', color: '#DCDCAA' },
    { text: '(', color: '#D4D4D4' },
    { text: 'unexpected', color: '#9CDCFE' },
    { text: ');', color: '#D4D4D4' },

    { text: '  if', color: '#C586C0' },
    { text: ' (', color: '#D4D4D4' },
    { text: 'stuck', color: '#9CDCFE' },
    { text: ') {', color: '#D4D4D4' },

    { text: '    keep_thinking', color: '#DCDCAA' },
    { text: '();', color: '#D4D4D4' },

    { text: '  }', color: '#D4D4D4' },
    { text: '}', color: '#D4D4D4' }
];

// Simplified for Ink rendering (line by line)
const RENDER_LINES = [
    <Text>
        <Text color="#C586C0">while</Text>
        <Text color="#D4D4D4">(</Text>
        <Text color="#9CDCFE">curious</Text>
        <Text color="#D4D4D4">) {'{'}</Text>
    </Text>,

    <Text>
        <Text>{'  '}</Text>
        <Text color="#DCDCAA">question_everything</Text>
        <Text color="#D4D4D4">();</Text>
    </Text>,

    <Text>
        <Text>{'  '}</Text>
        <Text color="#DCDCAA">dig_deeper</Text>
        <Text color="#D4D4D4">();</Text>
    </Text>,

    <Text>
        <Text>{'  '}</Text>
        <Text color="#DCDCAA">connect_dots</Text>
        <Text color="#D4D4D4">(</Text>
        <Text color="#9CDCFE">unexpected</Text>
        <Text color="#D4D4D4">);</Text>
    </Text>,

    <Text>{''}</Text>, // Spacer

    <Text>
        <Text>{'  '}</Text>
        <Text color="#C586C0">if</Text>
        <Text color="#D4D4D4"> (</Text>
        <Text color="#9CDCFE">stuck</Text>
        <Text color="#D4D4D4">) {'{'}</Text>
    </Text>,

    <Text>
        <Text>{'    '}</Text>
        <Text color="#CE9178">keep_thinking</Text>
        <Text color="#D4D4D4">();</Text>
    </Text>,

    <Text>
        <Text>{'  '}</Text>
        <Text color="#D4D4D4">{'}'}</Text>
    </Text>,

    <Text>
        <Text color="#D4D4D4">{'}'}</Text>
    </Text>
];

export const StartupAnimation = ({ onComplete }: { onComplete: () => void }) => {
    const [visibleLines, setVisibleLines] = useState<number>(0);

    useEffect(() => {
        if (visibleLines < RENDER_LINES.length) {
            const timer = setTimeout(() => {
                setVisibleLines(prev => prev + 1);
            }, 100); // Speed of animation per line
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(onComplete, 500);
            return () => clearTimeout(timer);
        }
    }, [visibleLines, onComplete]);

    return (
        <Box flexDirection="column" marginY={1} paddingX={2}>
            {RENDER_LINES.slice(0, visibleLines).map((line, i) => (
                <Box key={i}>
                    {line}
                </Box>
            ))}
        </Box>
    );
};
