import React, { useContext, useState } from "react";
import {
  Drawer,
  Box,
  Toolbar,
  IconButton,
  useTheme,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Dialog,
  DialogTitle,
  Button,
  DialogActions,
  AppBar,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ForumIcon from "@mui/icons-material/Forum";
import { grey } from "@mui/material/colors";
import { useAuth } from "../AuthContext";
import { AuthContext } from "../AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

const LeftBar = ({ toggleTheme, currentTheme }) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const { logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === "/public_chat";

  const handlePublicChatClick = () => {
    navigate("/public_chat");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleLogoutClick = () => {
    // Implement logout functionality
    setOpen(true);
  };

  const handleConfirmLogout = async () => {
    setOpen(false);
    await logout();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getLinkStyles = (path) => {
    const isActive = location.pathname === path;
    return {
      cursor: "pointer",
      margin: 2,
      color: isActive ? "primary.main" : "textSecondary",
      "&:hover": {
        color: grey[400],
      },
    };
  };

  if (!isAuthenticated) {
    return (
      <>
        <AppBar position="fixed">
          <Toolbar sx={{ justifyContent: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                placeItemss: "center",
              }}
            >
              <Typography
                color="textSecondary"
                align="center"
                onClick={handleLoginClick}
                sx={getLinkStyles("/auth")}
              >
                Login
              </Typography>
              <Typography
                color="textSecondary"
                align="center"
                onClick={handleRegisterClick}
                sx={getLinkStyles("/register")}
              >
                Register
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
      </>
    );
  } else {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            background: theme.palette.background["default_paper"],
            color: theme.palette.text.primary,
            borderColor: "transparent",
          },
        }}
      >
        <Box sx={{ overflow: "auto" }}>
          <Toolbar />
          <List>
            {isAuthenticated ? (
              <>
                <ListItem>
                  <Avatar sx={{ ml: 2 }} />
                </ListItem>
                <Divider style={{ backgroundColor: "rgba(7,11,16,0.98)" }} />
                <ListItemButton
                  onClick={handlePublicChatClick}
                  sx={{
                    background: isActive
                      ? theme.palette.background.default
                      : theme.palette.background.default,
                  }}
                >
                  <ListItemIcon>
                    <IconButton color={isActive ? "primary" : "default"}>
                      <ForumIcon />
                    </IconButton>
                  </ListItemIcon>
                  <ListItemText primary="Chat" />
                </ListItemButton>
                <Divider style={{ backgroundColor: "rgba(7,11,16,0.98)" }} />
                <ListItemButton onClick={handleLogoutClick}>
                  <ListItemIcon>
                    <IconButton>
                      <LogoutIcon />
                    </IconButton>
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
                <Divider style={{ backgroundColor: "rgba(7,11,16,0.98)" }} />
              </>
            ) : (
              <ListItemButton onClick={handleLoginClick}>
                <ListItemText primary="Login" />
                <Divider style={{ backgroundColor: "rgba(7,11,16,0.98)" }} />
              </ListItemButton>
            )}
            <Divider style={{ backgroundColor: "rgba(7,11,16,0.98)" }} />
          </List>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{"Are you sure you want to go out?"}</DialogTitle>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleConfirmLogout} color="primary" autoFocus>
                Logout
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Drawer>
    );
  }
};

export default LeftBar;
