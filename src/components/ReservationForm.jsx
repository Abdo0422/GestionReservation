import React, { useState } from "react";
import {
  Button,
  TextField,
  Container,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Box,
  FormHelperText,
  Tooltip,
} from "@mui/material";
import axios from "axios";

function ReservationForm() {
  const [space, setSpace] = useState("");
  const [resource, setResource] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  const handleReservation = async () => {
    if (!space && !resource) {
      setError("Vous devez sélectionner soit un espace, soit une ressource.");
      return;
    }
    const reservationData = { space, resource, date, time };
    try {
      await axios.post(
        "http://127.0.0.1:5000/api/reservations",
        reservationData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("Réservation effectuée avec succès !");
      setError(""); // Clear any previous error message
    } catch (error) {
      console.error("Erreur lors de la réservation :", error);
      alert("Erreur lors de la réservation. Vérifiez la console pour plus de détails.");
    }
  };

  return (
    <Container sx={{ paddingTop: "40px", maxWidth: "sm" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: "bold",
          fontFamily: "Roboto, sans-serif",
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        Réservez un espace ou une ressource
      </Typography>

      {/* Form in a column layout */}
      <Grid container spacing={3} direction="column" alignItems="stretch">
        {/* Space Selection */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Espaces</InputLabel>
            <Select
              value={space}
              onChange={(e) => setSpace(e.target.value)}
              displayEmpty
              sx={{
                backgroundColor: "#f0f0f0",
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
            >
              <MenuItem value="">
                <em>Aucun</em>
              </MenuItem>
              <MenuItem value="courtroom">Salle du Tribunal de Commerce de Casablanca</MenuItem>
              <MenuItem value="meeting-room">Salle de Réunion</MenuItem>
              <MenuItem value="conference-room">Salle de Conférence</MenuItem>
              <MenuItem value="lounge">Salon</MenuItem>
              <MenuItem value="auditorium">Auditorium</MenuItem>
            </Select>
            {error && !space && !resource && (
              <FormHelperText error>{error}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Resource Selection */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Ressources</InputLabel>
            <Select
              value={resource}
              onChange={(e) => setResource(e.target.value)}
              displayEmpty
              sx={{
                backgroundColor: "#f0f0f0",
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
            >
              <MenuItem value="">
                <em>Aucune</em>
              </MenuItem>
              <MenuItem value="court-record">Ressources du Tribunal de Commerce de Casablanca</MenuItem>
              <MenuItem value="documents">Documents Juridiques</MenuItem>
              <MenuItem value="projector">Projecteur</MenuItem>
              <MenuItem value="microphone">Microphone</MenuItem>
              <MenuItem value="laptop">Ordinateur Portable</MenuItem>
              <MenuItem value="printer">Imprimante</MenuItem>
            </Select>
            {error && !space && !resource && (
              <FormHelperText error>{error}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Date Input */}
        <Grid item xs={12}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={date}
            onChange={(e) => setDate(e.target.value)}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              backgroundColor: "#f0f0f0",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          />
        </Grid>

        {/* Time Input */}
        <Grid item xs={12}>
          <TextField
            label="Heure"
            type="time"
            fullWidth
            value={time}
            onChange={(e) => setTime(e.target.value)}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              backgroundColor: "#f0f0f0",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          />
        </Grid>

        {/* Reservation Button */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Tooltip title="Cliquez pour finaliser votre réservation" arrow>
              <Button
                variant="contained"
                onClick={handleReservation}
                sx={{
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                    transform: "scale(1.05)",
                    transition: "transform 0.2s",
                  },
                  padding: "10px 20px",
                }}
              >
                Finaliser la réservation
              </Button>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ReservationForm;
