import { useState } from "react";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { darkTheme, lightTheme } from "./theme";
import LoginForm from "./components/LoginForm";
import { ProtectedRoute } from "./ProtectedRoute";
import LeftBar from "./components/LeftBar";
import PublicChat from "./components/PublicChat";
import { AuthProvider } from "./AuthContext";
import InitialPage from "./components/InitialPage";

function App() {
    const [theme, setTheme] = useState("dark");
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    return (
        <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
            <CssBaseline />
            <AuthProvider>
                <HashRouter>
                    <Box sx={{ display: 'flex' }}>
                        <LeftBar toggleTheme={toggleTheme} currentTheme={theme} />
                        <Box component="main" sx={{ flexGrow: 1 }}>
                            <Routes>
                                <Route path="/auth" element={<LoginForm />} />
                                <Route path="/" element={<ProtectedRoute />}>
                                    <Route path="initial" element={<InitialPage />} />
                                    <Route path="public_chat" element={<PublicChat />} />
                                </Route>
                                <Route path="*" element={<Navigate to="/auth" replace />} />
                            </Routes>
                        </Box>
                    </Box>
                </HashRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
