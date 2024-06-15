import {
  Box,
  Typography,
  Paper,
  List,
  TextField,
  IconButton,
  ListItemText,
  ListItem,
  Grid,
  Button,
  Modal,
  CssBaseline,
  useTheme,
  InputAdornment,
  Avatar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { grey } from "@mui/material/colors";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PublicChat() {
  const theme = useTheme();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const websocket = useRef(null);
  const [loadIndex, setLoadIndex] = useState(-20);
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef(null);
  const [chat_token, set_chat_token] = useState(null);
  const [currentUser, setCurrentUser] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        navigate(-1);
      }
    };

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [navigate]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/messages/request-chat-token`,
          {
            withCredentials: true,
          }
        );
        set_chat_token(response.data.chat_token);
        setCurrentUser(response.data.username);
      } catch (error) {
        console.error("Failed to fetch chat token:", error);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (chat_token) {
      websocket.current = new WebSocket(
        `${process.env.REACT_APP_SOCKET_URL}/messages/ws?chat_token=${chat_token}`
      );
      websocket.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "users_list") {
          setUsers(data.users);
        } else if (
          data.type === "system_message" ||
          data.type === "broadcast_message"
        ) {
          setMessages((prevMessages) =>
            Array.isArray(data)
              ? [...data, ...prevMessages]
              : [...prevMessages, data]
          );
          scrollToBottomNew();
        } else if (data.type === "new_message") {
          setMessages((prevMessages) =>
            Array.isArray(data)
              ? [...data, ...prevMessages]
              : [...prevMessages, data]
          );
        } else if (
          data.type === "initial_load" ||
          data.type === "more_messages"
        ) {
          setMessages((prevMessages) => [...data.messages, ...prevMessages]);
          if (data.type === "initial_load") {
            scrollToBottom();
          } else {
            maintainScrollPosition();
          }
        } else if (data.type === "typing") {
          setTypingUsers((prevTypingUsers) => {
            if (!prevTypingUsers.includes(data.username)) {
              return [...prevTypingUsers, data.username];
            }
            scrollToBottomNew();
            return prevTypingUsers;
          });
        } else if (data.type === "stop_typing") {
          setTypingUsers((prevTypingUsers) =>
            prevTypingUsers.filter((user) => user !== data.username)
          );
        }
      };
      return () => {
        if (websocket.current) {
          websocket.current.close();
        }
      };
    }
  }, [chat_token]);

  const handleScroll = () => {
    if (isLoading) return;

    const nextLoadIndex = loadIndex - 20;
    const target = listRef.current;
    const scrollPosition = target.scrollTop;
    const maxScroll = target.scrollHeight - target.clientHeight;
    const scrolledPercentage = (scrollPosition / maxScroll) * 100;

    if (scrolledPercentage < 30 && messages.length > 0) {
      setIsLoading(true);
      websocket.current.send(
        JSON.stringify({
          action: "load_more_messages",
          start: nextLoadIndex,
          count: 20,
        })
      );
      setLoadIndex(nextLoadIndex);
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const maintainScrollPosition = () => {
    const target = listRef.current;
    const previousHeight = target.scrollHeight;
    const previousScrollTop = target.scrollTop;
    setTimeout(() => {
      const newHeight = target.scrollHeight;
      target.scrollTop = previousScrollTop + (newHeight - previousHeight);
    }, 0);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }, 0);
  };

  const scrollToBottomNew = () => {
    const target = listRef.current;
    const scrollPosition = target.scrollTop;
    const maxScroll = target.scrollHeight - target.clientHeight;
    const scrolledPercentage = (scrollPosition / maxScroll) * 100;

    if (scrolledPercentage > 30) {
      target.scrollTo({ top: maxScroll, behavior: "smooth" });
    }

    setTimeout(() => {}, 1000);
  };

  const handleSendMessage = () => {
    if (message && websocket.current) {
      const msgData = JSON.stringify({
        action: "send_message",
        content: message,
        username: currentUser,
      });
      websocket.current.send(msgData);
      setMessage("");
      websocket.current.send(
        JSON.stringify({
          action: "stop_typing",
          username: currentUser,
        })
      );
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (websocket.current) {
      websocket.current.send(
        JSON.stringify({
          action: "typing",
          username: currentUser,
        })
      );
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        websocket.current.send(
          JSON.stringify({
            action: "stop_typing",
            username: currentUser,
          })
        );
      }, 3000);
    }
  };

  const handleOpenUsersModal = () => {
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  const modalBody = (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 400,
        background: theme.palette.background.default,
        boxShadow: 24,
        p: 4,
      }}
    >
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Active Users
      </Typography>
      <List>
        {users.map((user, index) => (
          <ListItem key={index}>
            <ListItemText primary={user} />
          </ListItem>
        ))}
      </List>
      <Button onClick={handleCloseModal}>Close</Button>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100%" }}>
      <CssBaseline />
      <Grid container sx={{ height: "100%" }}>
        <Grid
          item
          xs={12}
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <ChatHeader title="Public Chat" onOpenUsers={handleOpenUsersModal} />
          <Paper
            elevation={3}
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              minHeight: 0,
              p: 2,
              background: theme.palette.background.paper,
              display: "flex",
              flexDirection: "column",
            }}
            onScroll={handleScroll}
            ref={listRef}
          >
            <List sx={{ width: "100%" }}>
              {messages.map((msg, index) => (
                <ListItem
                  key={index}
                  sx={{
                    justifyContent:
                      msg.username === currentUser ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        msg.username === currentUser
                          ? "flex-end"
                          : "flex-start",
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection:
                          msg.username === currentUser ? "row-reverse" : "row",
                        maxWidth: "60%",
                        wordWrap: "break-word",
                      }}
                    >
                      {msg.username !== "system" && (
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor:
                              msg.username === currentUser
                                ? theme.palette.primary.main
                                : theme.palette.secondary.main,
                            color: theme.palette.getContrastText(
                              msg.username === currentUser
                                ? theme.palette.primary.main
                                : theme.palette.secondary.main
                            ),
                            marginLeft: msg.username === currentUser ? 1 : 0,
                            marginRight: msg.username === currentUser ? 0 : 1,
                          }}
                        >
                          {msg.username.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                      <Box
                        sx={{
                          backgroundColor:
                            msg.username === "system"
                              ? "transparent"
                              : msg.username === currentUser
                              ? theme.palette.primary.dark
                              : "#17212b",
                          borderRadius: "10px",
                          padding: "10px",
                          maxWidth: "100%",
                          wordWrap: "break-word",
                        }}
                      >
                        {msg.username !== "system" && (
                          <Typography
                            variant="subtitle2"
                            sx={{
                              marginBottom: 1,
                              textAlign:
                                msg.username === currentUser ? "right" : "left",
                              color:
                                msg.username === currentUser
                                  ? "white"
                                  : grey[500],
                            }}
                          >
                            {msg.username}
                          </Typography>
                        )}
                        <ListItemText
                          primary={msg.content}
                          sx={{
                            color:
                              msg.username === "system" ? "#29b6f6" : "white",
                          }}
                          secondary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "0.8rem",
                                color:
                                  msg.username === "system"
                                    ? "#29b6f6"
                                    : grey[300],
                              }}
                            >
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Typography>
                          }
                        />
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
            {typingUsers.length > 0 && (
              <Box sx={{ padding: 2, color: grey[500] }}>
                {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"}{" "}
                typing...
              </Box>
            )}
          </Paper>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderLeft: 1,
              borderColor: theme.palette.background.paper,
            }}
          >
            <TextField
              fullWidth
              autoComplete="off"
              InputProps={{
                style: { height: "50px", padding: "10px" },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSendMessage} color="primary">
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              variant="standard"
              placeholder="Write a message..."
              value={message}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
          </Box>
          <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            {modalBody}
          </Modal>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PublicChat;
