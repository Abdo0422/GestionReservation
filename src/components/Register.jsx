import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Modal, Paper, Container  } from '@mui/material';
import axios from '../features/axios';
import { useDispatch } from 'react-redux';
import { login } from '../features/actions';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';


const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '20px 30px',
  borderRadius: '10px',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#fff',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: '#059669',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#10B981',
  },
}));

const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const ModalBox = styled(Box)(({ theme }) => ({
  padding: 3,
  backgroundColor: 'white',
  borderRadius: 2,
  boxShadow: 3,
  width: '400px',
  marginTop: '20vh',
}));

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const response = await axios.post('/register', { username, email, password });
      console.log('Réponse:', response); 
      setVerificationMessage('Un code de vérification a été envoyé à votre email. Veuillez le vérifier.');
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
      setError(error.response ? error.response.data.error : 'Une erreur inattendue est survenue');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await axios.post('/verify', { email, code: verificationCode });
      if (response && response.data) {
        setVerificationMessage('Votre email a été vérifié avec succès!');
        const loginResponse = await axios.post('/login', { email, password });
        
        if (loginResponse && loginResponse.data) {
          dispatch(login({
            user: loginResponse.data,
            role: loginResponse.data.role,
            name: loginResponse.data.name,
            numdep: loginResponse.data.numdep,
          }));
          navigate('/');
        } else {
          setError('Échec de la connexion: Pas de données retournées du serveur');
        }
      } else {
        setError('Échec de la vérification: Pas de données retournées du serveur');
      }
    } catch (error) {
      console.error(error);
      setError(error.response ? error.response.data.error : 'Une erreur inattendue est survenue');
    }
  };

  return (
    <Container maxWidth="sm">
      <StyledPaper>
        <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 600 }}>Inscription</Typography>
        <form onSubmit={handleSubmit}>
          <StyledTextField
            fullWidth
            label="Nom d'utilisateur"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <StyledTextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <StyledTextField
            fullWidth
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <StyledTextField
            fullWidth
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          <StyledButton fullWidth type="submit">S'inscrire</StyledButton>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </form>
        {verificationMessage && (
          <Typography variant="body2" sx={{ color: 'green', textAlign: 'center', mb: 2 }}>
            {verificationMessage}
          </Typography>
        )}
      </StyledPaper>

      {/* Modal for Verification */}
      <StyledModal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalBox>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Entrez le code de vérification
          </Typography>
          <StyledTextField
            fullWidth
            label="Code de vérification"
            type="text"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
          />
          <StyledButton fullWidth onClick={handleVerifyCode}>Vérifier</StyledButton>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </ModalBox>
      </StyledModal>
    </Container>
  );
};

export default Register;
