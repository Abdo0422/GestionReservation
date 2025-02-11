import React, { useState } from "react";
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
import axios from "axios";

// Styled Components
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "https://3z82zf-5000.csb.app/api/login",
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
          "Une erreur s'est produite lors de la connexion."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <StyledPaper>
        <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 600 }}>
          Connexion
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
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
                label="Mot de passe"
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
                  "Se connecter"
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

export default Login;
