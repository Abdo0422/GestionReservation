import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Container,
  Paper,
  CircularProgress,
  styled,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { login } from "../features/actions";
import axios from "../features/axios";
import Translate from "./Translate";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: "20px 30px",
  borderRadius: "10px",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: "10px 20px",
  borderRadius: "8px",
  fontSize: "1rem",
  color: "#fff",
  background: "linear-gradient(45deg, #059669, #10B981)",
  "&:hover": {
    background: "linear-gradient(45deg, #10B981, #059669)",
  },
}));

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'fr');
  const isArabic = language === 'ar';

  useEffect(() => {
    localStorage.setItem("language", language);
    console.log("languagenow", language);
  }, [language]);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "/login",
        { email, password }
      );

      dispatch(
        login({
          user: response.data,
          role: response.data.role,
          name: response.data.name,
          email: response.data.email,
          numdep: response.data.numdep,
        })
      );

      window.location.href = "/";
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setError(
        error.response?.data?.error ||
          <Translate textKey="loginError" />
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <StyledPaper>
        <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 600 }}>
          <Translate textKey="connexion" />
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={<Translate textKey="email" />}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={<Translate textKey="password" />}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <StyledButton fullWidth type="submit" disabled={loading}>
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <Translate textKey="login" />
                )}
              </StyledButton>
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Typography color="error" variant="body2" align="center">
                  {error}
                </Typography>
              </Grid>
            )}
          </Grid>
        </form>
      </StyledPaper>
    </Container>
  );
};
