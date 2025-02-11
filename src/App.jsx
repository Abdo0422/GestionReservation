import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ReservationForm from "./components/ReservationForm";
import ChefDashboard from "./components/ChefDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Translator from "./components/Translator";

import "./styles.css";

function App() {
  const user = useSelector((state) => state.user);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <BrowserRouter>
      <Navbar />
      <Translator />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["citoyen"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservation"
          element={
            <ProtectedRoute allowedRoles={["citoyen"]}>
              <ReservationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chef"
          element={
            <ProtectedRoute allowedRoles={["chef"]}>
              <ChefDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
