import {createTheme} from "@mui/material";
import {blue, grey} from "@mui/material/colors";


export const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: grey[50],
        },
        background: {
            default: grey[200],
            paper: grey[100],
            form: grey[200]
        },
        text: {
            primary: grey[900]
        },
    },
    components: {
       MuiInputLabel: {
           styleOverrides: {
               root: {
                   '&.Mui-focused': {
                       color: grey[900],
                   },
               },
           },
       },
    },
});

export const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: blue[500], // A dark blue similar to the Telegram accent
            contrastText: grey[50], // Ensuring text is visible on dark blue
        },
        secondary: {
            main: grey[800], // Dark grey for less prominent UI elements
        },
        error: {
            main: '#E57373', // Red for errors, adjusted for dark theme visibility
        },
        warning: {
            main: '#FFB74D', // Orange for warnings
        },
        info: {
            main: blue[600], // Lighter blue for informational messages
        },
        success: {
            main: '#81C784', // Green for success states
        },
        background: {
            default: '#0e1621', // Very dark blue, almost black, similar to Telegram's dark mode background
            default_paper: '#17212b',
            default_back: '#17212b',
            paper: "#0e1621", // Dark grey used for elements like cards and sheets
            form: "#17212b" // Dark shade for form backgrounds
        },
        text: {
            primary: grey[50], // Light grey for primary text, provides good contrast against dark backgrounds
            secondary: grey[400], // Medium grey for secondary text
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none', // Buttons with normal case text, not uppercase
                    margin: '8px', // Standard margin around buttons
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: grey[400], // Medium grey for label text
                    '&.Mui-focused': {
                        color: blue[500], // Light blue color when the label is focused
                    },
                },
            },
        },
    },
});