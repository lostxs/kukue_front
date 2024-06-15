import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { MuiOtpInput } from "mui-one-time-password-input";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const StyledForm = styled("form")(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(4),
  background: "transparent",
  width: "100%",
}));

function OtpForm() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [activationError, setActivationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/auth");
    }
  }, [navigate]);

  const handleChange = (newValue) => {
    setOtp(newValue);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setActivationError("");
    setIsLoading(true);

    if (!otp) {
      setOtpError(true);
      setIsLoading(false);
      return;
    } else {
      setOtpError(false);
    }

    try {
      const userId = localStorage.getItem("userId");
      await axios.post(`${process.env.REACT_APP_API_URL}/user/activate`, {
        user_id: userId,
        code: otp,
      });
      setOpen(true);
      localStorage.removeItem("userId");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Activation failed, please try again.";
      setActivationError(errorMessage);
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    navigate("/auth");
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
            OTP
          </Typography>
          {activationError && (
            <Alert
              variant="outlined"
              severity="error"
              sx={{ borderColor: "transparent" }}
            >
              {activationError}
            </Alert>
          )}
          {otpError && (
            <Alert
              variant="outlined"
              severity="error"
              sx={{ borderColor: "transparent" }}
            >
              Field OTP is required
            </Alert>
          )}
          <MuiOtpInput value={otp} onChange={handleChange} length={6} />
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
            Submit
          </Button>
        </StyledForm>
      </Container>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{"Account activated successfully!"}</DialogTitle>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            Back to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OtpForm;
