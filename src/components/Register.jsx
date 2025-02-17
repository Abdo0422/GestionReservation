import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Modal,
  Paper,
  Container,
} from "@mui/material";
import axios from "../features/axios";
import { useDispatch } from "react-redux";
import { login } from "../features/actions";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import Translate from "./Translate";


const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: "2rem 3rem",
  borderRadius: "10px",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: "#059669",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#10B981",
  },
}));

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const ModalBox = styled(Box)(({ theme }) => ({
  padding: "2rem",
  backgroundColor: "white",
  borderRadius: "10px",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
  width: "400px",
  maxWidth: "90vw",
  marginTop: "10vh",
}));

export const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const response = await axios.post("/register", {
        username,
        email,
        password,
      });
      console.log("Réponse:", response);
      setVerificationMessage(
        "Un code de vérification a été envoyé à votre email. Veuillez le vérifier."
      );
      setOpenModal(true);

      dispatch(
        login({
          user: response.data.user,
          role: response.data.role,
          token: response.data.token,
        })
      );
    } catch (error) {
      console.error(error);
      setError(
        error.response
          ? error.response.data.error
          : "Une erreur inattendue est survenue"
      );
    }
  };

  const handleVerifyCode = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const response = await axios.post("/verify", {
        email,
        code: verificationCode,
      });

      if (response && response.data) {
        setVerificationMessage("Votre email a été vérifié avec succès!");
        const loginResponse = await axios.post("/login", { email, password });

        if (loginResponse && loginResponse.data) {
          dispatch(
            login({
              user: loginResponse.data,
              role: loginResponse.data.role,
              name: loginResponse.data.name,
              numdep: loginResponse.data.numdep,
            })
          );
          navigate("/");
          setOpenModal(false);
        } else {
          setError(
            "Échec de la connexion: Pas de données retournées du serveur"
          );
        }
      } else {
        setError(
          "Échec de la vérification: Pas de données retournées du serveur"
        );
      }
    } catch (error) {
      console.error(error);
      setError(
        error.response
          ? error.response.data.error
          : "Une erreur inattendue est survenue"
      );
    } finally {
      setIsVerifying(false);
    }
  };

return (
    <Container maxWidth="sm">
      <StyledPaper>
        <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 600 }}>
          <Translate textKey="inscription" />
        </Typography>
        <form onSubmit={handleSubmit}>
          <StyledTextField
            fullWidth
            label={<Translate textKey="username" />}
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <StyledTextField
            fullWidth
            label={<Translate textKey="email" />}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <StyledTextField
            fullWidth
            label={<Translate textKey="password" />}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <StyledTextField
            fullWidth
            label={<Translate textKey="confirmPassword" />}
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          <StyledButton fullWidth type="submit">
            <Translate textKey="register" />
          </StyledButton>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </form>
        {verificationMessage && (
          <Typography
            variant="body2"
            sx={{ color: "green", textAlign: "center", mb: 2 }}
          >
            {verificationMessage}
          </Typography>
        )}
      </StyledPaper>

      <StyledModal open={openModal}>
        <ModalBox>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <Translate textKey="enterVerificationCode" />
          </Typography>
          <StyledTextField
            fullWidth
            label={<Translate textKey="verificationCode" />}
            type="text"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
          />
          <StyledButton
            fullWidth
            onClick={handleVerifyCode}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <Translate textKey="verifying" />
            ) : (
              <Translate textKey="verify" />
            )}
          </StyledButton>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </ModalBox>
      </StyledModal>
    </Container>
  );
};
