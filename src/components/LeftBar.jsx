import React, {useContext, useState} from 'react';
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
  ListItemButton, Divider, Switch, Dialog, DialogTitle, Button, DialogActions
} from "@mui/material";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import ForumIcon from '@mui/icons-material/Forum';
import { useAuth } from "../AuthContext";
import { AuthContext } from '../AuthContext';
import {useLocation, useNavigate} from "react-router-dom";

const LeftBar = ({ toggleTheme, currentTheme }) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const { logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === '/public_chat';

  const handlePublicChatClick = () => {
    navigate("/public_chat");
  };

  const handleLoginClick = () => {
    navigate("/login");
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

   if (!isAuthenticated) {
        return null;
    }
    else {
     return (
         <Drawer
             variant="permanent"
             sx={{
               width: 240,
               flexShrink: 0,
               '& .MuiDrawer-paper': {
                 width: 240,
                 boxSizing: 'border-box',
                 background: theme.palette.background["default_paper"],
                 color: theme.palette.text.primary,
                 borderColor: "transparent"
               },
             }}
         >

           <Box sx={{overflow: 'auto'}}>
             <Toolbar/>
             <List>
               {isAuthenticated ? (
                   <>
                     <ListItem>
                       <Avatar sx={{ml: 2}}/>
                     </ListItem>
                     <Divider style={{backgroundColor: 'rgba(7,11,16,0.98)'}}/>
                     <ListItemButton
                         onClick={handlePublicChatClick}
                         sx={{background: isActive ? theme.palette.background.default : theme.palette.background.default}}
                     >
                       <ListItemIcon>
                         <IconButton color={isActive ? "primary" : "default"}>
                           <ForumIcon/>
                         </IconButton>
                       </ListItemIcon>
                       <ListItemText primary="Chat"/>
                     </ListItemButton>
                     <Divider style={{backgroundColor: 'rgba(7,11,16,0.98)'}}/>
                     <ListItemButton onClick={handleLogoutClick}>
                       <ListItemIcon>
                         <IconButton>
                           <LogoutIcon/>
                         </IconButton>
                       </ListItemIcon>
                       <ListItemText primary="Logout"/>
                     </ListItemButton>
                     <Divider style={{backgroundColor: 'rgba(7,11,16,0.98)'}}/>
                   </>
               ) : (
                   <ListItemButton onClick={handleLoginClick}>
                     <ListItemText primary="Login"/>
                     <Divider style={{backgroundColor: 'rgba(7,11,16,0.98)'}}/>
                   </ListItemButton>
               )}
               <ListItemButton onClick={toggleTheme}>
                 <ListItemIcon>
                   <IconButton color="inherit">
                     <DarkModeIcon/>
                   </IconButton>
                 </ListItemIcon>
                 <ListItemText primary="Night Mode"/>
                 <Switch
                     onClick={toggleTheme}
                     edge="end"
                     onChange={toggleTheme}
                     checked={currentTheme === 'dark'}
                 />
               </ListItemButton>
               <Divider style={{backgroundColor: 'rgba(7,11,16,0.98)'}}/>
             </List>
             <Dialog open={open} onClose={handleClose}>
               <DialogTitle>{"Вы уверены, что хотите выйти?"}</DialogTitle>
               <DialogActions>
                 <Button onClick={handleClose}>Отмена</Button>
                 <Button onClick={handleConfirmLogout} color="primary" autoFocus>
                   Выйти
                 </Button>
               </DialogActions>
             </Dialog>
           </Box>
         </Drawer>
     );
   }
};

export default LeftBar;