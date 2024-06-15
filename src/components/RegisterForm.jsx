import axios from "axios";
import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const StyledForm = styled("form")(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(4),
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.background["form"],
  width: "100%",
}));

function RegistrationForm() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [emailError, setemailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorText, setPasswordErrorText] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let valid = true;
    setRegistrationError("");
    setIsLoading(true);

    if (!username) {
      setUsernameError(true);
      valid = false;
    } else {
      setUsernameError(false);
    }

    if (!email || !validateEmail(email)) {
      setemailError(true);
      valid = false;
    } else {
      setemailError(false);
    }

    if (!password) {
      setPasswordError(true);
      setPasswordErrorText("Password is required.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError(true);
      setPasswordErrorText("Password must be at least 6 characters long.");
      valid = false;
    } else if (password.length > 50) {
      setPasswordError(true);
      setPasswordErrorText("Password must be no more than 50 characters long.");
      valid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorText("");
    }

    if (!valid) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user`,
        {
          username,
          email,
          password,
        }
      );
      localStorage.setItem("userId", response.data.user_id);
      navigate("/verify");
    } catch (error) {
      if (error.response?.data?.detail) {
        const errorDetails = error.response.data.detail;
        if (Array.isArray(errorDetails)) {
          const errorMessages = errorDetails.map((err) => err.msg).join(", ");
          setRegistrationError(errorMessages);
        } else {
          setRegistrationError(errorDetails);
        }
      } else {
        setRegistrationError("Activation failed, please try again.");
      }
    }
    setUsername("");
    setEmail("");
    setPassword("");
    setIsLoading(false);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Container component="main" maxWidth="sm">
        <StyledForm onSubmit={handleSubmit} noValidate>
          {isLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: theme.shape.borderRadius,
                zIndex: 9999,
              }}
            >
              <CircularProgress size={60} sx={{ color: "primary.progress" }} />
            </Box>
          )}
          <Typography variant="h4" component="h1" gutterBottom>
            Accout Registration
          </Typography>
          {registrationError && (
            <Alert
              variant="outlined"
              severity="error"
              sx={{ borderColor: "transparent" }}
            >
              {registrationError}
            </Alert>
          )}
          <TextField
            error={usernameError}
            helperText={usernameError ? "Please enter a valid username." : ""}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Username"
            autoComplete="off"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            error={emailError}
            helperText={emailError ? "Please enter a valid email." : ""}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email"
            autoComplete="off"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            error={passwordError}
            helperText={passwordError ? passwordErrorText : ""}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Password"
            autoComplete="off"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              backgroundColor: theme.palette.primary.button,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Register
          </Button>
        </StyledForm>
      </Container>
    </Box>
  );
}

export default RegistrationForm;
