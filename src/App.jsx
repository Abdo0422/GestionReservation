import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Dashboard } from "./components/Dashboard";
import { ReservationForm } from "./components/ReservationForm";
import { ChefDashboard } from "./components/ChefDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { Home } from "./components/Home";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Translator } from "./components/Translator";
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import './styles.css';
import Translate from "./components/Translate";

export function App() {
  const user = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [cookieAccepted, setCookieAccepted] = useState(localStorage.getItem("cookiesAccepted") === "true");


  useEffect(() => {
    let timeoutId;

    const handleRouteChange = () => {
      setIsLoading(true);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsLoading(false), 500);
    };

    handleRouteChange();

    const handlePopState = () => handleRouteChange();
    const handleClick = (event) => {
      if (event.target.tagName === 'A') handleRouteChange();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('click', handleClick);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    if (cookieAccepted) {
      localStorage.setItem("cookiesAccepted", "true");
    }
  }, [cookieAccepted]);


  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <Navbar />
      <Translator />
      <div className="content-wrapper">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <CircularProgress />
            </div>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["citoyen"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/reservation" element={<ProtectedRoute allowedRoles={["citoyen"]}><ReservationForm /></ProtectedRoute>} />
          <Route path="/chef" element={<ProtectedRoute allowedRoles={["chef"]}><ChefDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </div>
      <Footer />

      <Snackbar
        open={!cookieAccepted}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={() => setCookieAccepted(true)}>
              <Translate textKey="acceptCookies" /> 
            </Button>
          }
        >
          <AlertTitle><Translate textKey="cookieNotice"/></AlertTitle>
          <Translate textKey="cookiePopupMessage"/> 
        </Alert>
      </Snackbar>

    </BrowserRouter>
  );
}