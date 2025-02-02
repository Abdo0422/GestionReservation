import React, { useState } from "react";
import { Button, TextField, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Send POST request to Flask backend for authentication
      const response = await axios.post("http://127.0.0.1:5000/api/login", {
        username: username,
        password: password
      });

      if (response.status === 200) {
        onLogin(username); 
        navigate("/reservations"); 
      }
    } catch (err) {
      setError("Identifiants invalides !");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Connexion
      </Typography>

      {/* Display error message */}
      {error && <Typography color="error">{error}</Typography>}

      <TextField
        label="Nom d'utilisateur"
        fullWidth
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        margin="normal"
      />

      <TextField
        label="Mot de passe"
        type="password"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
      />

      <Button variant="contained" onClick={handleLogin}>
        Se connecter
      </Button>
    </Container>
  );
}

export default LoginPage;
