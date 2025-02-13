import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  styled,
} from "@mui/material";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import Translate from "./Translate";

const StyledFooter = styled(Box)(({ theme }) => ({
  backgroundColor: "#1a1a1a",
  color: "#ffffff",
  padding: "64px 0 32px 0",
  position: "relative",
  overflow: "hidden",
  marginTop: "80px",
}));

const FooterLink = styled(Typography)({
  color: "#ffffff",
  cursor: "pointer",
  marginBottom: "8px",
  transition: "color 0.3s ease",
  "&:hover": {
    color: "#4dabf5",
  },
});

const SocialButton = styled(IconButton)({
  color: "#ffffff",
  margin: "0 8px",
  transition: "transform 0.3s ease, color 0.3s ease",
  "&:hover": {
    color: "#4dabf5",
    transform: "translateY(-3px)",
  },
});

const NewsletterForm = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  marginTop: "24px",
});

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribeSuccess(true);
      setEmail("");
      setTimeout(() => setSubscribeSuccess(false), 3000);
    }
  };

  return (
    <StyledFooter component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Box mb={3}>
              <img
                src="https://example.com/logo-tribunal-casablanca.png"
                alt="Tribunal de Commerce de Casablanca"
                style={{ height: "40px", marginBottom: "16px" }}
              />
              <Typography variant="body2" sx={{ mb: 2 }}>
                <Translate textKey="footerDescription" />{" "}
                {/* Translated description */}
              </Typography>
              <Box>
                <SocialButton aria-label="Facebook">
                  <FaFacebook />
                </SocialButton>
                <SocialButton aria-label="Twitter">
                  <FaTwitter />
                </SocialButton>
                <SocialButton aria-label="LinkedIn">
                  <FaLinkedin />
                </SocialButton>
                <SocialButton aria-label="Instagram">
                  <FaInstagram />
                </SocialButton>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              <Translate textKey="about" />
            </Typography>
            <FooterLink variant="body2">
              <Translate textKey="mission" />
            </FooterLink>
            <FooterLink variant="body2">
              <Translate textKey="history" />
            </FooterLink>
            <FooterLink variant="body2">
              <Translate textKey="services" />
            </FooterLink>
            <FooterLink variant="body2">
              <Translate textKey="contact" />
            </FooterLink>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              <Translate textKey="usefulLinks" /> {/* New translation key */}
            </Typography>
            <FooterLink variant="body2">
              <Translate textKey="judicialProcedures" />
            </FooterLink>
            <FooterLink variant="body2">
              <Translate textKey="forms" />
            </FooterLink>
            <FooterLink variant="body2">
              <Translate textKey="legalConsultations" />
            </FooterLink>
            <FooterLink variant="body2">
              <Translate textKey="regulations" />
            </FooterLink>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              <Translate textKey="stayInformed" />
            </Typography>
            <NewsletterForm component="form" onSubmit={handleSubscribe}>
              <Typography variant="body2">
                <Translate textKey="newsletterSignup" />
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={<Translate textKey="enterYourEmail" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="small"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "4px",
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.5)",
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#4dabf5",
                  "&:hover": {
                    backgroundColor: "#2196f3",
                  },
                }}
              >
                <Translate textKey="subscribe" />
              </Button>
              {subscribeSuccess && (
                <Typography variant="body2" color="#4dabf5">
                  <Translate textKey="thanksForSubscription" />
                </Typography>
              )}
            </NewsletterForm>
          </Grid>
        </Grid>

        <Box
          mt={8}
          pt={3}
          borderTop={1}
          borderColor="rgba(255, 255, 255, 0.1)"
          textAlign="center"
        >
          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)">
            <Translate textKey="copyright" values="2025" />
          </Typography>
        </Box>
      </Container>
    </StyledFooter>
  );
};
