import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  styled,
  Box,
  Container,
  Chip,
  Divider,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import axios from "../features/axios";
import dayjs from "dayjs";
import "dayjs/locale/fr";
dayjs.locale("fr");

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "1rem",
  boxShadow: theme.shadows[2],
  transition: "transform 0.2s",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[3],
  },
}));

const CardContentStyled = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const ChefDashboard = () => {
  const user = useSelector((state) => state.user);
  const [reservations, setReservations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departmentName, setDepartmentName] = useState(null);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingDepartment, setLoadingDepartment] = useState(true);
  const [errorReservations, setErrorReservations] = useState(null);
  const [errorEmployees, setErrorEmployees] = useState(null);
  const [errorDepartment, setErrorDepartment] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [employeeToUpdate, setEmployeeToUpdate] = useState(null);
  const [openUpdateEmployee, setOpenUpdateEmployee] = useState(false);
  const [openCreateEmployee, setOpenCreateEmployee] = useState(false);
  const [newEmployeeData, setNewEmployeeData] = useState({
    name: "",
    telephone: "",
    email: "",
    age: "",
    department: "",
    role: "employee",
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const decodeText = (text) => {
    try {
      return decodeURIComponent(text);
    } catch (error) {
      console.error("Erreur lors du décodage du texte :", error);
      return text;
    }
  };

  useEffect(() => {
    const fetchDepartmentName = async () => {
      try {
        if (user && user.numdep) {
          const response = await axios.get("/departments");
          const departments = response.data;
          const foundDepartment = departments.find(
            (dept) => dept.id === user.numdep
          );
          if (foundDepartment) {
            setDepartmentName(decodeText(foundDepartment.nomdepart));
          } else {
            setErrorDepartment("Département non trouvé.");
          }
        } else {
          setErrorDepartment("Information de l'utilisateur manquante.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du département:", error);
        setErrorDepartment("Erreur lors de la récupération du département.");
      } finally {
        setLoadingDepartment(false);
      }
    };

    fetchDepartmentName();
  }, [user]);

  useEffect(() => {
    if (departmentName) {
      const fetchReservations = async () => {
        try {
          const response = await axios.get("/chef/reservations", {
            params: { department: departmentName },
          });
          setReservations(response.data);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des réservations:",
            error
          );
          setErrorReservations(
            "Erreur lors de la récupération des réservations."
          );
        } finally {
          setLoadingReservations(false);
        }
      };
      fetchReservations();
    }
  }, [departmentName]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("/chef/employees");
        setEmployees(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des employés:", error);
        setErrorEmployees("Erreur lors de la récupération des employés.");
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleToggleStatus = async (reservationId, currentStatus) => {
    try {
      const newStatus =
        currentStatus === "En attente" ? "Confirmé" : "En attente";

      const response = await axios.put(
        `/chef/reservation/${reservationId}/status`,
        {
          status: newStatus,
        }
      );

      const updatedReservations = reservations.map((reservation) =>
        reservation.id === reservationId
          ? { ...reservation, status: newStatus }
          : reservation
      );
      setReservations(updatedReservations);

      setPopupMessage(`Statut de réservation changé en ${newStatus}.`);
      setOpenPopup(true);
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      setPopupMessage("Erreur lors du changement de statut.");
      setOpenPopup(true);
    }
  };

  const handleAssignEmployee = async (reservationId, employeeId) => {
    try {
      const response = await axios.put(
        `/chef/reservation/${reservationId}/assign-employee`,
        {
          employee_id: employeeId,
        }
      );
      const updatedReservations = reservations.map((reservation) =>
        reservation.id === reservationId
          ? {
              ...reservation,
              employee_assigned: response.data.employee_assigned,
              status: "Confirmé",
            }
          : reservation
      );
      setReservations(updatedReservations);
      await axios.put(`/chef/reservation/${reservationId}/status`, {
        status: "Confirmé",
      });

      setPopupMessage(
        "Employé assigné avec succès et statut de réservation mis à jour."
      );
      setOpenPopup(true);
    } catch (error) {
      console.error("Erreur lors de l'assignation de l'employé:", error);
      setPopupMessage("Erreur lors de l'assignation de l'employé.");
      setOpenPopup(true);
    }
  };

  const handleCreateEmployee = async () => {
    try {
      const response = await axios.post("/chef/employees", newEmployeeData);
      setEmployees([...employees, response.data]);
      setPopupMessage("Employé créé avec succès.");
      setOpenPopup(true);
      setOpenCreateEmployee(false); // Close the modal
    } catch (error) {
      console.error("Erreur lors de la création de l'employé:", error);
      setPopupMessage("Erreur lors de la création de l'employé.");
      setOpenPopup(true);
    }
  };

  const handleOpenUpdateModal = (employee) => {
    setEmployeeToUpdate({ ...employee });
    setOpenUpdateEmployee(true);
  };

  const handleUpdateEmployee = async () => {
    try {
      const response = await axios.put(
        `/chef/employees/${employeeToUpdate.id}`,
        employeeToUpdate
      );
      setEmployees(
        employees.map((emp) =>
          emp.id === employeeToUpdate.id ? response.data : emp
        )
      );
      setOpenUpdateEmployee(false);
      setEmployeeToUpdate(null);
      setPopupMessage("Employé mis à jour avec succès.");
      setOpenPopup(true);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'employé:", error);
      setPopupMessage("Erreur lors de la mise à jour de l'employé.");
      setOpenPopup(true);
    }
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEmployeeToUpdate({
      ...employeeToUpdate,
      [name]: value,
    });
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await axios.delete(`/chef/employees/${employeeId}`);
      setEmployees(employees.filter((emp) => emp.id !== employeeId));
      setPopupMessage("Employé supprimé avec succès.");
      setOpenPopup(true);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'employé:", error);
      setPopupMessage("Erreur lors de la suppression de l'employé.");
      setOpenPopup(true);
    }
  };

  const formatDate = (dateString) => dayjs(dateString).format("D MMM YYYY");
  const formatTime = (timeString) =>
    dayjs(timeString, "HH:mm:ss").format("HH:mm");

  if (loadingReservations || loadingEmployees) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />{" "}
        {/* Use theme color */}
      </Box>
    );
  }

  if (errorReservations || errorEmployees) {
    return (
      <Typography variant="h6" color="error" textAlign="center" mt={4}>
        {" "}
        {/* Centered error */}
        {errorReservations || errorEmployees}
      </Typography>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, py: 4 }}>
      {/* Title and Welcome Message */}
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          mb: 3,
          color: theme.palette.primary.main,
          transition: "color 0.3s",
        }}
      >
        Bonjour {user.name}, Chef du département {departmentName}
      </Typography>
      <Typography
        variant="body1"
        sx={{ textAlign: "center", color: "text.secondary", mb: 5 }}
      >
        Bienvenue sur votre tableau de bord. Ici, vous pouvez gérer les
        réservations et les employés de votre département.
      </Typography>
      {/* Reservations Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ mt: 0, fontWeight: "bold" }}
        >
          Liste des réservations
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
          sx={{ mb: 2 }}
        >
          Consultez, confirmez et suivez les réservations de votre département.
          Vous pouvez également assigner des employés aux réservations en
          attente.
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {reservations.map((reservation) => (
            <Grid item key={reservation.id} xs={12} sm={6} md={4} lg={3}>
              <StyledCard>
                <CardContentStyled>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{ fontWeight: "bold" }}
                  >
                    {reservation.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {formatDate(reservation.date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Heure: {reservation.time}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Département: {reservation.department}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nom du Citoyen: {reservation.citizen}
                  </Typography>

                  <Box sx={{ mt: 2, display: "flex", flexDirection: "column" }}>
                    {reservation.status && (
                      <Chip
                        label={reservation.status}
                        color={
                          reservation.status === "Confirmé"
                            ? "success"
                            : "warning"
                        }
                        onClick={() =>
                          handleToggleStatus(reservation.id, reservation.status)
                        }
                        sx={{
                          mt: 1,
                          alignSelf: isMobile ? "stretch" : "flex-start",
                          cursor: "pointer",
                        }}
                      />
                    )}
                    {reservation.status !== "Confirmé" && (
                      <FormControl
                        fullWidth
                        sx={{
                          mt: 2,
                          alignSelf: isMobile ? "stretch" : "flex-start",
                        }}
                      >
                        <InputLabel>Assigner Employé</InputLabel>
                        <Select
                          label="Assigner Employé"
                          onChange={(e) =>
                            handleAssignEmployee(reservation.id, e.target.value)
                          }
                          defaultValue=""
                        >
                          <MenuItem value="">Choisir un employé</MenuItem>
                          {employees.map((employee) => (
                            <MenuItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                </CardContentStyled>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* Employees Section */}
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ mt: 0, fontWeight: "bold" }}
      >
        Liste des employés
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        gutterBottom
        sx={{ mb: 2 }}
      >
        Gérez les informations de vos employés. Vous pouvez ajouter, modifier ou
        supprimer des employés de votre département.
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateEmployee(true)}
        sx={{ position: "relative", right: "0", mb: 3 }} // Moved button, made relative
      >
        Créer un nouvel employé
      </Button>
      <Grid container spacing={3}>
        {employees.map((employee) => (
          <Grid item key={employee.id} xs={12} sm={6} md={4} lg={3}>
            <StyledCard>
              <CardContentStyled>
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  {employee.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rôle: {employee.role}
                </Typography>
                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenUpdateModal(employee)}
                    sx={{ mr: 1 }}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    Supprimer
                  </Button>
                </Box>
              </CardContentStyled>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
           
      <Dialog
        open={openCreateEmployee}
        onClose={() => setOpenCreateEmployee(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "1.5rem",
            padding: "1.5rem 2rem",
            borderBottom: "1px solid #e0e0e0",
            color: "#333",
          }}
        >
          Créer un nouvel employé
        </DialogTitle>
        <DialogContent sx={{ padding: "2rem" }}>
          <Box component="form" noValidate onSubmit={handleCreateEmployee}>
            {" "}
            {/* Form for submission */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nom"
                  fullWidth
                  name="name"
                  value={newEmployeeData.name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Téléphone"
                  fullWidth
                  name="telephone"
                  value={newEmployeeData.telephone}
                  onChange={handleInputChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  fullWidth
                  name="email"
                  value={newEmployeeData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  type="email"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Âge"
                  fullWidth
                  name="age"
                  value={newEmployeeData.age}
                  onChange={handleInputChange}
                  margin="normal"
                  type="number"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Département</InputLabel>
                  <TextField
                    label="Département"
                    value={departmentName}
                    disabled
                    InputLabelProps={{ shrink: true }}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ padding: "1rem 2rem", borderTop: "1px solid #e0e0e0" }}
        >
          <Button onClick={() => setOpenCreateEmployee(false)} color="grey">
            Annuler
          </Button>
          <Button
            type="submit"
            onClick={handleCreateEmployee}
            variant="contained"
            color="primary"
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openUpdateEmployee}
        onClose={() => setOpenUpdateEmployee(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "1.5rem",
            padding: "1.5rem 2rem",
            borderBottom: "1px solid #e0e0e0",
            color: "#333",
          }}
        >
          Modifier l'employé
        </DialogTitle>
        <DialogContent sx={{ padding: "2rem" }}>
          {employeeToUpdate && (
            <Box component="form" noValidate onSubmit={handleUpdateEmployee}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Nom"
                    fullWidth
                    name="name"
                    value={employeeToUpdate.name}
                    onChange={handleInputChange}
                    margin="normal"
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Téléphone"
                    fullWidth
                    name="telephone"
                    value={employeeToUpdate.telephone}
                    onChange={handleInputChange}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    fullWidth
                    name="email"
                    value={employeeToUpdate.email}
                    onChange={handleInputChange}
                    margin="normal"
                    type="email" // Email validation
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Âge"
                    fullWidth
                    name="age"
                    value={employeeToUpdate.age}
                    onChange={handleInputChange}
                    margin="normal"
                    type="number"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Département</InputLabel>
                    <TextField
                      label="Département"
                      value={departmentName}
                      disabled
                      InputLabelProps={{ shrink: true }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{ padding: "1rem 2rem", borderTop: "1px solid #e0e0e0" }}
        >
          <Button onClick={() => setOpenUpdateEmployee(false)} color="grey">
            Annuler
          </Button>
          <Button
            type="submit"
            onClick={handleUpdateEmployee}
            variant="contained"
            color="primary"
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        PaperProps={{
          sx: {
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "1.2rem",
            padding: "1rem 1.5rem",
            color: "#333",
          }}
        >
          Notification
        </DialogTitle>
        <DialogContent sx={{ padding: "1.5rem" }}>
          <Typography variant="body1" color="textSecondary">
            {popupMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: "1rem 1.5rem" }}>
          <Button onClick={() => setOpenPopup(false)} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChefDashboard;
