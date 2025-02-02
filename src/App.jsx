import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LoginPage from "./components/LoginPage";
import ReservationForm from "./components/ReservationForm";
import ReservationList from "./components/ReservationList";
import "@fontsource/poppins";
import "@fontsource/roboto";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setUsername(username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div>
        {/* Navigation Bar */}
        <AppBar
          position="sticky"
          sx={{
            background: "linear-gradient(90deg, #3a7bd5, #00d2ff)",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
          }}
        >
          <Toolbar>
            {isLoggedIn && (
              <IconButton edge="start" color="inherit" onClick={toggleSidebar} sx={{ marginRight: 2 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: "Poppins, sans-serif" }}>
              Mon Application de Réservation
            </Typography>

            {isLoggedIn ? (
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  fontFamily: "Roboto, sans-serif",
                  "&:hover": {
                    backgroundColor: "#ff6f61",
                    color: "#fff",
                  },
                }}
              >
                Se Déconnecter
              </Button>
            ) : (
              <Button
                color="inherit"
                component={Link}
                to="/"
                sx={{
                  fontFamily: "Roboto, sans-serif",
                  "&:hover": {
                    backgroundColor: "#ff6f61",
                    color: "#fff",
                  },
                }}
              >
                Se Connecter
              </Button>
            )}
          </Toolbar>
        </AppBar>

        {isLoggedIn && (
          <Box
            sx={{
              position: "fixed",
              top: 70,
              left: sidebarOpen ? 0 : -250,
              width: 250,
              height: "calc(100vh - 64px)",
              backgroundColor: "#f8f9fa",
              color: "#333",
              boxShadow: "2px 0 5px rgba(0,0,0,0.2)",
              borderTopRightRadius: "12px",
              borderBottomRightRadius: "12px",
              transition: "left 0.3s ease-in-out",
              zIndex: 1200,
              fontFamily: "Roboto, sans-serif",
            }}
          >
            <List>
              <ListItem
                button
                component={Link}
                to="/reservations"
                onClick={toggleSidebar}
                sx={{
                  "&:hover": {
                    backgroundColor: "#00d2ff",
                    color: "#fff",
                  },
                }}
              >
                <ListItemText primary="Réservations" />
              </ListItem>
              <ListItem
                button
                component={Link}
                to="/reserve"
                onClick={toggleSidebar}
                sx={{
                  "&:hover": {
                    backgroundColor: "#00d2ff",
                    color: "#fff",
                  },
                }}
              >
                <ListItemText primary="Réserver" />
              </ListItem>
            </List>
          </Box>
        )}

        <Box
          sx={{
            marginTop: "64px",
            marginLeft: sidebarOpen ? "250px" : "0",
            transition: "margin-left 0.3s ease",
            padding: "20px",
            backgroundColor: "#f4f6f9",
            minHeight: "calc(100vh - 64px)",
            fontFamily: "Roboto, sans-serif",
          }}
        >
          <Container>
            <Routes>
              <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
              <Route
                path="/reservations"
                element={isLoggedIn ? <ReservationList /> : <LoginPage onLogin={handleLogin} />}
              />
              <Route
                path="/reserve"
                element={isLoggedIn ? <ReservationForm /> : <LoginPage onLogin={handleLogin} />}
              />
            </Routes>
          </Container>
        </Box>
      </div>
    </Router>
  );
}

export default App;
