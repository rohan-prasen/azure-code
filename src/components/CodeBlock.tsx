/**
 * Code Block Component
 * 
 * Renders a code block with a professional, minimal aesthetic.
 * Features a sleek left-border accent and syntax highlighting.
 * 
 * @module components/CodeBlock
 */

import React from 'react';
import { Box, Text } from 'ink';
import { highlight } from 'cli-highlight';
import { THEME } from '../lib/theme.js';

interface CodeBlockProps {
    code: string;
    language: string;
    terminalWidth: number;
}

function getLanguageDisplayName(lang: string): string {
    return lang.toUpperCase() || 'TEXT';
}

export const CodeBlock = React.memo(({ code, language, terminalWidth }: CodeBlockProps) => {
    let highlighted = code;
    // Calculate width to fit within the "card" feel
    const codeWidth = Math.min(terminalWidth - 10, 100);
    const displayLanguage = getLanguageDisplayName(language);

    try {
        if (code.trim()) {
            highlighted = highlight(code, {
                language: language || 'plaintext',
                ignoreIllegals: true,
            });
        }
    } catch (e) {
        highlighted = code;
    }

    const codeLines = highlighted.split('\n');

    return (
        <Box flexDirection="row" marginTop={1} marginBottom={1}>
            {/* Accent Line */}
            <Box
                width={1}
                flexDirection="column"
                marginRight={1} // Space between line and code
            >
                <Box height="100%" flexDirection="column">
                    <Text color={THEME.colors.primary}>{'│'}</Text>
                    {codeLines.map((_, i) => (
                        <Text key={i} color={THEME.colors.primary}>{'│'}</Text>
                    ))}
                </Box>
            </Box>

            <Box flexDirection="column" flexGrow={1}>
                {/* Minimal Header */}
                <Box marginBottom={0}>
                    <Text color={THEME.colors.text.dim} bold>
                        {displayLanguage}
                    </Text>
                </Box>

                {/* Content */}
                <Box flexDirection="column">
                    {codeLines.map((line, idx) => (
                        <Box key={idx}>
                            <Text>{line || ' '}</Text>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
});
