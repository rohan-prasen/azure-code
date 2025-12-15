/**
 * Azure Code Theme Configuration
 * Central source of truth for all colors and styles.
 */

export const THEME = {
    // Brand Colors
    colors: {
        primary: '#0078D4',    // Azure Blue - Main brand color
        secondary: '#50E6FF',  // Azure Cyan - Highlights/Accents
        white: '#FFFFFF',

        // UI Colors
        text: {
            main: '#FFFFFF',
            dim: '#808080',      // Gray for less important text
            error: '#FF0000',
        },

        background: {
            main: '#111111',     // Dark background
            box: '#111111',
        },

        border: {
            default: '#0078D4',  // Primary blue for borders
            dim: '#333333',
        }
    },

    // Shared Styles
    styles: {
        boxBorder: 'round',    // Rounded corners for all boxes
    }
} as const;
