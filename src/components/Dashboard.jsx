import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  styled,
  Autocomplete,
} from "@mui/material";
import {
  CalendarMonth,
  AccessTime,
  Phone,
  Business,
  Person,
  Description,
} from "@mui/icons-material";
import axios from "../features/axios";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

const StyledCard = styled(Card)(({ theme }) => ({
  position: "relative",
  borderRadius: theme.spacing(2),
  transition: "transform 0.3s ease-in-out",
  overflow: "hidden",
  height: "100%",
  "&:hover": {
    transform: "translateY(-4px)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #059669 0%, #10B981 100%)",
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  background: theme.palette.background.paper,
  padding: theme.spacing(3),
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(4, 0),
  marginBottom: theme.spacing(4),
  textAlign: "center",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #059669 0%, #10B981 100%)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #059669 0%, #10B981 100%)",
  },
}));

const Dashboard = () => {
  const user = useSelector((state) => state.user);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [newReservation, setNewReservation] = useState({
    description: "",
    date: dayjs().format("YYYY-MM-DD"),
    time: "09:00",
    department: "",
    phone: "",
  });
  const [reservationReasons, setReservationReasons] = useState([
    "Consultation du registre de commerce",
    "Dépôt des états financiers",
    "Immatriculation d'entreprise",
    "Modification des informations d'entreprise",
    "Radiation d'entreprise",
    "Obtention de documents certifiés",
    "Réunion avec un responsable",
    "Autre",
  ]);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        if (user && user.name) {
          const response = await axios.get("/reservations/user", {
            params: { name: user.name },
          });
          setReservations(response.data);
        } else {
          setError("Utilisateur non connecté ou nom indisponible.");
        }
      } catch (err) {
        setError("Erreur lors de la récupération des réservations.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("/departments");
        const decodedDepartments = response.data.map((dept) => {
          try {
            const decodedNomDepart = decodeURIComponent(dept.nomdepart);
            return { ...dept, nomdepart: decodedNomDepart };
          } catch (error) {
            console.warn(`Error decoding nomdepart: ${dept.nomdepart}`, error);
            return { ...dept, nomdepart: dept.nomdepart || "Nom inconnu" };
          }
        });
        const filteredDepartments = decodedDepartments.filter(
          (dept) => dept.nomdepart.toLowerCase() !== "aucun"
        );

        setDepartments(filteredDepartments);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des départements:",
          error
        );
      }
    };

    fetchDepartments();
  }, []);

  const handleCreateReservation = async () => {
    try {
      const reservationData = {
        ...newReservation,
        citizen: user.name,
        status: "En attente",
      };

      const response = await axios.post("/reservations", reservationData);
      setReservations([...reservations, response.data]);
      setOpenModal(false);
      setSnackbarMessage("Réservation créée avec succès!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      setSnackbarMessage("Erreur lors de la création de la réservation.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress sx={{ color: "#059669" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh", pb: 8 }}>
      <Container maxWidth="lg">
        <HeaderBox>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Tableau de Bord des Réservations
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Gérez vos réservations au Tribunal de Commerce de Casablanca
          </Typography>
          <Button
            variant="contained"
            onClick={() => setOpenModal(true)}
            sx={{
              bgcolor: "#059669",
              "&:hover": { bgcolor: "#047857" },
              borderRadius: 2,
              px: 4,
              py: 1.5,
            }}
          >
            Nouvelle Réservation
          </Button>
        </HeaderBox>

        {error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : reservations.length === 0 ? (
          <Card sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Aucune réservation trouvée
            </Typography>
            <Button
              variant="contained"
              onClick={() => setOpenModal(true)}
              sx={{
                bgcolor: "#059669",
                "&:hover": { bgcolor: "#047857" },
                mt: 2,
              }}
            >
              Créer une Réservation
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {reservations.map((reservation) => (
              <Grid item xs={12} md={6} lg={4} key={reservation.id}>
                <StyledCard>
                  <StyledCardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Détails de la Réservation
                    </Typography>

                    <IconWrapper>
                      <Description sx={{ color: "#059669" }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography>{reservation.description}</Typography>
                      </Box>
                    </IconWrapper>

                    <IconWrapper>
                      <CalendarMonth sx={{ color: "#059669" }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Date
                        </Typography>
                        <Typography>{reservation.date}</Typography>
                      </Box>
                    </IconWrapper>

                    <IconWrapper>
                      <AccessTime sx={{ color: "#059669" }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Heure
                        </Typography>
                        <Typography>{reservation.time}</Typography>
                      </Box>
                    </IconWrapper>

                    <IconWrapper>
                      <Business sx={{ color: "#059669" }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Département
                        </Typography>
                        <Typography>{reservation.department}</Typography>
                      </Box>
                    </IconWrapper>

                    <IconWrapper>
                      <Person sx={{ color: "#059669" }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Citoyen
                        </Typography>
                        <Typography>{reservation.citizen}</Typography>
                      </Box>
                    </IconWrapper>

                    <IconWrapper>
                      <Phone sx={{ color: "#059669" }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Téléphone
                        </Typography>
                        <Typography>{reservation.phone}</Typography>
                      </Box>
                    </IconWrapper>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 2,
                      }}
                    >
                      <Chip
                        label={`Statut: ${reservation.status}`}
                        color={
                          reservation.status === "En attente"
                            ? "warning"
                            : "success"
                        }
                      />
                    </Box>
                  </StyledCardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Créer une Nouvelle Réservation</DialogTitle>
          <DialogContent>
            <Autocomplete
              fullWidth
              options={reservationReasons}
              value={newReservation.description}
              onChange={(event, newValue) => {
                setNewReservation({ ...newReservation, description: newValue });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Motif de la réservation"
                  name="description"
                />
              )}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Date"
              type="date"
              name="date"
              value={newReservation.date}
              onChange={(e) =>
                setNewReservation({
                  ...newReservation,
                  [e.target.name]: e.target.value,
                })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Heure"
              type="time"
              name="time"
              value={newReservation.time}
              onChange={(e) =>
                setNewReservation({
                  ...newReservation,
                  [e.target.name]: e.target.value,
                })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Département</InputLabel>
              <Select
                name="department"
                value={newReservation.department}
                label="Département"
                onChange={(e) =>
                  setNewReservation({
                    ...newReservation,
                    [e.target.name]: e.target.value,
                  })
                }
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.nomdepart}>
                    {dept.nomdepart}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Numéro de Téléphone"
              name="phone"
              value={newReservation.phone}
              onChange={(e) =>
                setNewReservation({
                  ...newReservation,
                  [e.target.name]: e.target.value,
                })
              }
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Annuler</Button>
            <Button
              onClick={handleCreateReservation}
              variant="contained"
              sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#047857" } }}
            >
              Créer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Dashboard;
