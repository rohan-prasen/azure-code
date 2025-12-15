/**
 * Chat Input Box Component
 * 
 * Handles user input, slash commands, and the command dropdown.
 * Isolated to prevent re-rendering the message list on every keystroke.
 * 
 * @module components/ChatInputBox
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { CommandDropdown } from './CommandDropdown.js';
import { SLASH_COMMANDS } from '../lib/commands/parser.js';
import { THEME } from '../lib/theme.js';

interface ChatInputBoxProps {
    onSendMessage: (message: string) => void;
    responsivePadding: number;
    terminalWidth: number;
}

export const ChatInputBox = React.memo(({ onSendMessage, responsivePadding }: ChatInputBoxProps) => {
    const [input, setInput] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownIndex, setDropdownIndex] = useState(0);
    const handlingSpecialKey = useRef(false);

    // State ref for event handlers to access latest state without re-binding
    const stateRef = useRef({ input, showDropdown, dropdownIndex });
    useEffect(() => {
        stateRef.current = { input, showDropdown, dropdownIndex };
    }, [input, showDropdown, dropdownIndex]);

    const getFilteredCommands = useCallback((currentInput: string) => {
        const searchTerm = currentInput.toLowerCase().replace(/^\//, '');
        if (!searchTerm) return SLASH_COMMANDS;
        return SLASH_COMMANDS.filter(cmd =>
            cmd.name.toLowerCase().includes(searchTerm) ||
            cmd.description.toLowerCase().includes(searchTerm) ||
            (cmd.aliases && cmd.aliases.some(a => a.toLowerCase().includes(searchTerm)))
        );
    }, []);

    const handleInputChange = useCallback((value: string) => {
        if (handlingSpecialKey.current) return;
        setInput(value);
        if (value.startsWith('/') && value.length > 0) {
            setShowDropdown(true);
            setDropdownIndex(0);
        } else {
            setShowDropdown(false);
        }
    }, []);

    const handleSubmit = useCallback((value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        // Command selection logic
        const { showDropdown: currentShow, dropdownIndex: currentIndex } = stateRef.current;
        if (currentShow) {
            const cmds = getFilteredCommands(value);
            if (cmds.length > 0 && cmds[currentIndex]) {
                const selected = cmds[currentIndex];
                if (!selected.requiresArgs) {
                    onSendMessage(`/${selected.name}`);
                } else {
                    const parts = trimmedValue.split(' ');
                    if (parts.length > 1) onSendMessage(trimmedValue);
                    else {
                        setInput(`/${selected.name} `);
                        setShowDropdown(false);
                        return;
                    }
                }
                setInput('');
                setShowDropdown(false);
                return;
            }
        }

        onSendMessage(trimmedValue);
        setInput('');
        setShowDropdown(false);
    }, [onSendMessage, getFilteredCommands]);

    useInput((inputChar, key) => {
        if (!stateRef.current.showDropdown) return;

        const { input: curInput, dropdownIndex: curIdx } = stateRef.current;
        if (key.upArrow) {
            handlingSpecialKey.current = true;
            setDropdownIndex(Math.max(0, curIdx - 1));
            setTimeout(() => { handlingSpecialKey.current = false; }, 0);
        } else if (key.downArrow) {
            handlingSpecialKey.current = true;
            // In a real app we'd check max length, simple increment here
            setDropdownIndex(curIdx + 1);
            setTimeout(() => { handlingSpecialKey.current = false; }, 0);
        } else if (key.escape) {
            setShowDropdown(false);
        }
    }, { isActive: showDropdown });

    return (
        <Box flexDirection="column">
            {showDropdown && (
                <Box paddingX={responsivePadding} paddingBottom={1}>
                    <CommandDropdown filter={input} selectedIndex={dropdownIndex} />
                </Box>
            )}

            <Box paddingX={responsivePadding} paddingY={1}>
                <Box
                    width="100%"
                    borderStyle={THEME.styles.boxBorder}
                    borderColor={THEME.colors.border.dim}
                    paddingX={1}
                >
                    <Text color={THEME.colors.secondary} bold>{'> '}</Text>
                    <Box flexGrow={1}>
                        <TextInput
                            value={input}
                            onChange={handleInputChange}
                            onSubmit={handleSubmit}
                            placeholder="Type a message..."
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
});
