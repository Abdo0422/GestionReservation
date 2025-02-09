import React from 'react';
import { Box, Container, Grid, Typography, Button, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/actions';
import { Activity, Scale, Shield, Users, Calendar, Building2 } from 'lucide-react';

const StyledBox = styled(Box)(({ theme }) => {
  console.log(theme); 
  return {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  };
});

const SectionBox = styled(Box)(({ theme }) => {
  console.log(theme);  
  return {
    marginBottom: theme.spacing(16),
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      backgroundColor: theme.palette.primary.main,  
      opacity: 0.1,
      transform: 'skewY(-6deg)',
    },
  };
});

const CardBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  padding: theme.spacing(4),
  textAlign: 'center',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: '12px 24px',
  borderRadius: '8px',
  fontSize: '16px',
  width: '200px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,  // Default hover color if emerald is not defined
  },
}));

const Home = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const features = [
    { icon: <Users className="w-12 h-12 text-emerald-600 mb-4" />, title: "Gestion des Utilisateurs", desc: "Gérez efficacement les comptes et les accès" },
    { icon: <Calendar className="w-12 h-12 text-emerald-600 mb-4" />, title: "Gestion des Réservations", desc: "Planifiez et suivez les audiences" },
    { icon: <Building2 className="w-12 h-12 text-emerald-600 mb-4" />, title: "Gestion des Départements", desc: "Coordonnez les différents services" }
  ];

  const benefits = [
    { icon: <Activity className="w-12 h-12 text-emerald-600 mb-4" />, title: "Interface Intuitive", desc: "Navigation simple et efficace" },
    { icon: <Scale className="w-12 h-12 text-emerald-600 mb-4" />, title: "Justice Équitable", desc: "Processus transparent et équitable" },
    { icon: <Shield className="w-12 h-12 text-emerald-600 mb-4" />, title: "Sécurité Maximale", desc: "Protection des données sensibles" }
  ];

  return (
    <StyledBox>
      <Container maxWidth="lg">
        {/* Welcome Section */}
        <SectionBox>
          <CardBox>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
              Tribunal de Commerce de Casablanca
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 2, mb: 4 }}>
              Votre portail numérique pour accéder aux services du Tribunal de Commerce. Une justice moderne au service des entreprises.
            </Typography>
            <Box sx={{ mt: 2 }}>
              {user?.user ? (
                <StyledButton variant="contained" color="error" onClick={handleLogout}>
                  Se Déconnecter
                </StyledButton>
              ) : (
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <StyledButton variant="contained" sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}>
                    Se Connecter
                  </StyledButton>
                </Link>
              )}
            </Box>
          </CardBox>
        </SectionBox>

        {/* Features Section */}
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 16 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <CardBox>
                {feature.icon}
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.desc}
                </Typography>
              </CardBox>
            </Grid>
          ))}
        </Grid>

        {/* Benefits Section */}
        <Grid container spacing={4} justifyContent="center">
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <CardBox>
                {benefit.icon}
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                  {benefit.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {benefit.desc}
                </Typography>
              </CardBox>
            </Grid>
          ))}
        </Grid>
      </Container>
    </StyledBox>
  );
};

export default Home;
