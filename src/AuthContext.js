import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { Typography, Box, CircularProgress } from "@mui/material";
import { Modal } from "./components/Modal";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    const formParams = new URLSearchParams();
    formParams.append("username", username);
    formParams.append("password", password);
    formParams.append("grant_type", "password");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/token`,
        formParams,
        { withCredentials: true }
      );
      if (response.data.message === "Authentication successful") {
        setUser({ username });
        setIsAuthenticated(true);
        localStorage.setItem("isLoggedIn", "true");
      }
    } catch (error) {
      console.error("Login attempt failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      console.log(response.data.message);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    setUser(null);
    setIsAuthenticated(false);
    if (socket) {
      socket.close(1000, "Logout initiated by client");
    }
    window.location.href = "/auth";
    setLoading(false);
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      const verifyUser = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/auth/verify`,
            { withCredentials: true }
          );
          if (response.status === 200) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("isLoggedIn");
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Authentication check failed:", error);
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("userId");
          setUser(null);
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
        }
      };
      verifyUser().catch((error) =>
        console.error("Error in verifyUser:", error)
      );
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [setLoading]);

  useEffect(() => {
    const verifyUser = async () => {
      if (isAuthenticated) {
        try {
          const ws = new WebSocket(
            `${process.env.REACT_APP_SOCKET_URL}/auth/ws`
          );
          ws.onopen = () => {
            ws.send(JSON.stringify({ type: "ping" }));
          };
          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case "AUTH_STATUS":
                console.log("AUTH:", data.isAuthenticated);
                setIsAuthenticated(data.isAuthenticated);
                if (data.isAuthenticated) {
                  setUser(data.user);
                } else {
                  setUser(null);
                  setIsAuthenticated(false);
                  localStorage.removeItem("isLoggedIn");
                  localStorage.removeItem("userId");
                  window.location.href = "/auth";
                }
                break;
              case "message":
                console.log("Server:", data.message);
                break;
              default:
                console.log("Default:", data.message);
            }
          };
          ws.onclose = (event) => {
            if (event.code === 4001) {
              console.log("Authentication problem...");
              setIsModalOpen(true);
            }
          };
          setSocket(ws);
        } catch {
          console.error("Authentication check failed:");
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        } finally {
          setLoading(false);
        }
      }
    };
    verifyUser().catch((error) => console.error("Error in verifyUser:", error));
  }, [isAuthenticated, setLoading]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    window.location.href = "/auth";
  };

  const value = {
    setUser,
    user,
    login,
    logout,
    socket,
    isAuthenticated,
    setIsAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <Typography component="span">
          Your session is expired. Please, login again.
        </Typography>
      </Modal>
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
