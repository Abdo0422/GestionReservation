import React from "react";
import { useLanguage } from "../features/translations/LanguageContext";
import { Box, Button, styled, useTheme, useMediaQuery } from "@mui/material";

const LanguageSwitcher = styled(Box)(({ theme }) => ({
  position: "fixed", 
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  backgroundColor: theme.palette.grey[200],
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  zIndex: 1000,
  transition: "all 0.3s ease-in-out",
}));

const LanguageButton = styled(Button)(({ theme, active }) => ({
  minWidth: "80px",
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius * 2,
  fontWeight: 600,
  fontSize: "0.9rem",
  textTransform: "none",
  transition: "all 0.3s ease-in-out",
  color: active ? "white" : theme.palette.text.primary,
  background: active
    ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
    : "transparent",
  border: `2px solid ${active ? theme.palette.primary.main : "transparent"}`,
  "&:hover": {
    background: active
      ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
      : theme.palette.grey[300],
    borderColor: active ? theme.palette.primary.dark : theme.palette.grey[400],
  },
}));

export const Translator = () => {
  const { language, changeLanguage } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleLanguageChange = (newLanguage) => {
    setTimeout(() => {
      changeLanguage(newLanguage);
      window.location.reload();
    }, 100);
  };

  return (
    <LanguageSwitcher
      sx={{
        bottom: isMobile ? theme.spacing(2) : theme.spacing(3),
        right: isMobile ? theme.spacing(2) : theme.spacing(3),
        padding: isMobile ? theme.spacing(0.5) : theme.spacing(1),
      }}
    >
      <LanguageButton
        onClick={() => handleLanguageChange("ar")}
        active={language === "ar" ? 1 : 0}
      >
        عربي
      </LanguageButton>
      <LanguageButton
        onClick={() => handleLanguageChange("fr")}
        active={language === "fr" ? 1 : 0}
      >
        Français
      </LanguageButton>
    </LanguageSwitcher>
  );
};
