import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  styled,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/actions";
import {
  Activity,
  Scale,
  Shield,
  Users,
  Calendar,
  Building2,
} from "lucide-react";
import Translate from "./Translate";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLanguage } from "../features/translations/LanguageContext";

const StyledBox = styled(Box)(({ theme, language }) => ({
  minHeight: "100vh",
  backgroundColor: "#f5f5f5",
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
  direction: language === "ar" ? "rtl" : "ltr",
  fontFamily:
    language === "ar" ? "'Cairo', sans-serif" : "'Roboto', sans-serif",
}));

const SectionBox = styled(Box)(({ theme, language }) => ({
  marginBottom: theme.spacing(16),
  position: "relative",
  textAlign: language === "ar" ? "right" : "left",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    backgroundColor: theme.palette.primary.main,
    opacity: 0.1,
    transform: "skewY(-6deg)",
  },
}));

const CardBox = styled(Box)(({ theme, language }) => ({
  backgroundColor: "white",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  padding: theme.spacing(4),
  textAlign: "center",
  direction: language === "ar" ? "rtl" : "ltr",
}));

const StyledButton = styled(Button)(({ theme, language }) => ({
  padding: "12px 24px",
  borderRadius: "8px",
  fontSize: "16px",
  width: "200px",
  transition: "all 0.3s ease",
  textAlign: language === "ar" ? "right" : "center",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

export const Home = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const { language } = useLanguage();
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const qa = [
    {
      question: <Translate textKey="q1" />,
      answer: <Translate textKey="a1" />,
    },
    {
      question: <Translate textKey="q2" />,
      answer: <Translate textKey="a2" />,
    },
    {
      question: <Translate textKey="q3" />,
      answer: <Translate textKey="a3" />,
    },
    {
      question: <Translate textKey="q4" />,
      answer: <Translate textKey="a4" />,
    },
  ];

  const testimonials = [
    {
      name: <Translate textKey="t1Name" />,
      text: <Translate textKey="t1Text" />,
    },
    {
      name: <Translate textKey="t2Name" />,
      text: <Translate textKey="t2Text" />,
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  const features = [
    {
      icon: <Users className="w-12 h-12 text-emerald-600 mb-4" />,
      title: <Translate textKey="userManagement" />,
      desc: <Translate textKey="userManagementDesc" />,
    },
    {
      icon: <Calendar className="w-12 h-12 text-emerald-600 mb-4" />,
      title: <Translate textKey="reservationManagement" />,
      desc: <Translate textKey="reservationManagementDesc" />,
    },
    {
      icon: <Building2 className="w-12 h-12 text-emerald-600 mb-4" />,
      title: <Translate textKey="departmentManagement" />,
      desc: <Translate textKey="departmentManagementDesc" />,
    },
  ];

  const benefits = [
    {
      icon: <Activity className="w-12 h-12 text-emerald-600 mb-4" />,
      title: <Translate textKey="intuitiveInterface" />,
      desc: <Translate textKey="intuitiveInterfaceDesc" />,
    },
    {
      icon: <Scale className="w-12 h-12 text-emerald-600 mb-4" />,
      title: <Translate textKey="fairJustice" />,
      desc: <Translate textKey="fairJusticeDesc" />,
    },
    {
      icon: <Shield className="w-12 h-12 text-emerald-600 mb-4" />,
      title: <Translate textKey="maximumSecurity" />,
      desc: <Translate textKey="maximumSecurityDesc" />,
    },
  ];

  return (
    <StyledBox>
      <Container maxWidth="lg">
        {/* Welcome Section */}
        <SectionBox>
          <CardBox>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333" }}>
              <Translate textKey="tribunalCommerce" />
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", mt: 2, mb: 4 }}
            >
              <Translate textKey="yourPortal" />
              <br />
              <Translate textKey="modernJustice" />
            </Typography>
            <Box sx={{ mt: 2 }}>
              {user?.user ? (
                <StyledButton
                  variant="contained"
                  color="error"
                  onClick={handleLogout}
                >
                  <Translate textKey="logout" />
                </StyledButton>
              ) : (
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <StyledButton
                    variant="contained"
                    sx={{
                      bgcolor: "#059669",
                      "&:hover": { bgcolor: "#047857" },
                    }}
                  >
                    <Translate textKey="login" />
                  </StyledButton>
                </Link>
              )}
            </Box>
          </CardBox>
        </SectionBox>

        {/* Q&A Section */}
        <SectionBox
          sx={{ mt: 16, direction: language === "ar" ? "rtl" : "ltr" }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#333",
              mb: 4,
              textAlign: "center",
            }}
          >
            <Translate textKey="faq" />
          </Typography>
          {qa.map((item, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              sx={{ direction: language === "ar" ? "rtl" : "ltr" }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    sx={{
                      transform:
                        language === "ar" ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                }
                aria-controls={`panel${index}bh-content`}
                id={`panel${index}bh-header`}
              >
                <Typography
                  sx={{ width: "100%", flexShrink: 0, fontWeight: "bold" }}
                >
                  {item.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{ direction: language === "ar" ? "rtl" : "ltr" }}
              >
                <Typography>{item.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </SectionBox>

        {/* Testimonials Section */}
        <SectionBox
          sx={{ mt: 16, direction: language === "ar" ? "rtl" : "ltr" }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#333",
              mb: 4,
              textAlign: "center",
            }}
          >
            <Translate textKey="testimonials" />
          </Typography>
          <Grid
            container
            spacing={4}
            justifyContent="center"
            direction={language === "ar" ? "row-reverse" : "row"}
          >
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <CardBox sx={{ direction: language === "ar" ? "rtl" : "ltr" }}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontStyle: "italic", mb: 2 }}
                  >
                    "{testimonial.text}"
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#333" }}
                  >
                    - {testimonial.name}
                  </Typography>
                </CardBox>
              </Grid>
            ))}
          </Grid>
        </SectionBox>

        {/* Features Section */}
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 16 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <CardBox>
                {feature.icon}
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#333" }}
                >
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
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#333" }}
                >
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
