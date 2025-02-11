import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Button,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Avatar,
  Fade,
  styled,
  Select,
  MenuItem,
} from "@mui/material";

import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/actions";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "../features/axios";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: "linear-gradient(to right, #1F2937, #374151)",
  boxShadow: "none",
  position: "relative",
  marginBottom: "20px",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #059669 0%, #10B981 50%, #059669 100%)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "1px",
    background: "rgba(255, 255, 255, 0.1)",
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 600,
  background: "linear-gradient(45deg, #FFF 30%, #E5E7EB 90%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -8,
    left: 0,
    width: "60px",
    height: "2px",
    background: "#10B981",
    transition: "width 0.3s ease",
  },
  "&:hover::after": {
    width: "100%",
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: "#fff",
  textTransform: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  fontSize: "0.95rem",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(45deg, #059669 0%, #10B981 100%)",
    opacity: 0,
    transition: "opacity 0.3s ease",
    zIndex: -1,
  },
  "&:hover": {
    backgroundColor: "transparent",
    "&::before": {
      opacity: 0.2,
    },
  },
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  color: "#fff",
  borderColor: "#10B981",
  textTransform: "none",
  padding: "8px 20px",
  borderRadius: "8px",
  fontSize: "0.95rem",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "#059669",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    background: "linear-gradient(to bottom, #1F2937, #374151)",
    color: "#fff",
    width: 280,
    padding: "20px 0",
  },
}));

const DrawerItem = styled(ListItemButton)(({ theme }) => ({
  margin: "4px 12px",
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
}));

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleLogout = async () => {
    try {
      const response = await axios.post("/logout");
      if (response.status === 200) {
        dispatch(logout());
        navigate("/login");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const navItems = [
    {
      label:
        user?.role === "citoyen"
          ? "Dashboard"
          : user?.role === "chef"
          ? "Chef Dashboard"
          : user?.role === "admin"
          ? "Admin Dashboard"
          : null,
      path:
        user?.role === "citoyen"
          ? "/dashboard"
          : user?.role === "chef"
          ? "/chef"
          : user?.role === "admin"
          ? "/admin"
          : null,
      icon: <DashboardIcon />,
      show: user?.role,
    },
    { label: "Accueil", path: "/", icon: <HomeIcon />, show: true },
    {
      label: "Connexion",
      path: "/login",
      icon: <LoginIcon />,
      show: !user?.user,
    },
    {
      label: "Inscription",
      path: "/register",
      icon: <PersonAddIcon />,
      show: !user?.user,
    },
  ];

  const renderNavItems = () => (
    <Stack direction="row" spacing={1} alignItems="center">
      {navItems.map(
        (item, index) =>
          item.show && (
            <Fade in={true} key={index} timeout={500 + index * 100}>
              <NavButton
                component={Link}
                to={item.path}
                startIcon={!isMobile && item.icon}
              >
                {item.label}
              </NavButton>
            </Fade>
          )
      )}
      {user?.user && (
        <Fade in={true} timeout={800}>
          <LogoutButton
            variant="outlined"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Déconnexion
          </LogoutButton>
        </Fade>
      )}
    </Stack>
  );

  const renderDrawerItems = () => (
    <List>
      {navItems.map(
        (item, index) =>
          item.show && (
            <ListItem key={index} disablePadding>
              <DrawerItem
                component={Link}
                to={item.path}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemIcon sx={{ color: "#10B981" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </DrawerItem>
            </ListItem>
          )
      )}
      {user?.user && (
        <ListItem disablePadding>
          <DrawerItem onClick={handleLogout}>
            <ListItemIcon sx={{ color: "#10B981" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </DrawerItem>
        </ListItem>
      )}
    </List>
  );

  return (
    <StyledAppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1.5 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={() => setIsDrawerOpen(true)}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <LogoText
            variant="h5"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              fontSize: isMobile ? "1.1rem" : "1.4rem",
            }}
          >
            Tribunal de Commerce à Casablanca
          </LogoText>

          {!isMobile && renderNavItems()}
        </Toolbar>
      </Container>

      <StyledDrawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Box sx={{ px: 2, py: 3 }}>
          <LogoText variant="h6" sx={{ mb: 3 }}>
            Tribunal de Commerce
          </LogoText>
          {renderDrawerItems()}
        </Box>
      </StyledDrawer>
    </StyledAppBar>
  );
};

export default Navbar;
