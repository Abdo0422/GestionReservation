import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  Box,
  Paper,
  styled,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "../features/axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment";
import { useSnackbar } from "notistack";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: theme.shadows[3],
  overflow: "hidden",
  transition: "transform 0.2s ease-in-out",
  padding: "20px",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[5],
  },
}));

const StyledListItem = styled(Paper)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const DashboardAdmin = () => {
  const [reservations, setReservations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [nouvelUtilisateur, setNouvelUtilisateur] = useState({
    username: "",
    email: "",
    password: "",
    role: "chef",
    numdep: "",
  });
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [registeredResponse, setRegisteredResponse] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verificationMessage, setVerificationMessage] = useState(null);
  const [openVerificationModal, setOpenVerificationModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [openCreateEmployee, setOpenCreateEmployee] = useState(false);
  const [newEmployeeData, setNewEmployeeData] = useState({
    name: "",
    telephone: "",
    email: "",
    age: "",
    department: "",
  });

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchAvailableDepartments = async () => {
      try {
        const departmentsResponse = await axios.get("/departments");
        const allDepartments = departmentsResponse.data;
        const usersResponse = await axios.get("/users");
        const users = usersResponse.data;
        const departmentsWithChef = new Set(users.map((user) => user.numdep));

        const filteredDepartments = allDepartments.filter(
          (dep) => !departmentsWithChef.has(dep.id)
        );

        setAvailableDepartments(filteredDepartments);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchAvailableDepartments();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reservationsResponse = await axios.get("/reservations");
        setReservations(reservationsResponse.data);
        const employeesResponse = await axios.get("/chef/employees");
        setEmployees(employeesResponse.data);
        const usersResponse = await axios.get("/users");
        setUsers(usersResponse.data);
        const departmentsResponse = await axios.get("/departments");
        setDepartments(departmentsResponse.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleCreateUser = async () => {
    try {
      const response = await axios.post("/register", nouvelUtilisateur);
      setRegisteredResponse(response.data);
      console.log("registeredresponse:", response.data);
      setOpenModal(false);
      setError(null);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.response) {
        console.error("Server Response:", error.response.data);
        setError(
          error.response.data.error ||
            "Registration failed. Please check the form."
        );
      } else if (error.request) {
        console.error("Request Error:", error.request);
        setError("Network error. Please try again later.");
      } else {
        console.error("Other Error:", error.message);
        setError("An unexpected error occurred.");
      }
    }
  };
  useEffect(() => {
    if (registeredResponse) {
      setRegisteredEmail(registeredResponse.email);
      setNouvelUtilisateur({
        ...nouvelUtilisateur,
        email: registeredResponse.email,
      });

      setOpenVerificationModal(true);
      setNouvelUtilisateur({
        username: "",
        email: registeredResponse.email,
        password: "",
        role: "chef",
        numdep: "",
      });
      setRegisteredResponse(null);
    }
  }, [registeredResponse]);

  const handleVerifyCode = async () => {
    setIsVerifying(true);
    setError(null);
    console.log("Starting verification...");

    try {
      console.log("Sending verification request:", {
        email: registeredEmail,
        code: verificationCode,
      });

      const response = await axios.post("/verify", {
        email: registeredEmail,
        code: verificationCode,
      });

      console.log("Verification response:", response);

      if (response && response.data) {
        console.log("Verification successful!");
        setVerificationMessage("Your email has been verified successfully!");
        setOpenVerificationModal(false);
        const usersResponse = await axios.get("/users");
        setUsers(usersResponse.data);
        setVerificationCode("");
      } else {
        console.log(
          "Verification failed: No data in response or invalid response."
        );
        setError("Verification failed: Invalid code or server error.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      if (error.response) {
        console.error("Verification error details:", error.response);
      } else if (error.request) {
        console.error("Verification request error:", error.request);
      }
      setError(error.response?.data?.error);
    } finally {
      setIsVerifying(false);
      console.log("Verification process finished.");
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setError(null);
    setVerificationMessage(null);
  };

  const handleCloseVerificationModal = () => {
    setOpenVerificationModal(false);
    setVerificationMessage(null);
    setError(null);
    setVerificationCode("");
    setRegisteredEmail("");
  };

  const handleOpenUpdateModal = (user) => {
    setSelectedUser(user);
    setNouvelUtilisateur(user);
    setOpenUpdateModal(true);
    setError(null);
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
    setSelectedUser(null);
    setNouvelUtilisateur({
      username: "",
      email: "",
      password: "",
      role: "chef",
      numdep: "",
    });
    setError(null);
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(`/users/${selectedUser.id}`, nouvelUtilisateur);
      const usersResponse = await axios.get("/users");
      setUsers(usersResponse.data);
      setOpenUpdateModal(false);
      setSelectedUser(null);
      setNouvelUtilisateur({
        username: "",
        email: "",
        password: "",
        role: "chef",
        numdep: "",
      });
      setError(null);
    } catch (error) {
      console.error("Error updating user:", error);
      setError(error.response?.data?.error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
    }
  };

  const handleCreateReservation = async () => {
    try {
      await axios.post("/reservations", nouvelUtilisateur);
      const reservationsResponse = await axios.get("/reservations");
      setReservations(reservationsResponse.data);
    } catch (error) {
      console.error("Erreur lors de la création de la réservation:", error);
    }
  };

  const handleUpdateReservation = async () => {
    try {
      await axios.put(
        `/reservations/${nouvelUtilisateur.id}`,
        nouvelUtilisateur
      );
      const reservationsResponse = await axios.get("/reservations");
      setReservations(reservationsResponse.data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la réservation:", error);
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    try {
      await axios.delete(`/reservations/${reservationId}`);
      setReservations(reservations.filter((res) => res.id !== reservationId));
    } catch (error) {
      console.error("Erreur lors de la suppression de la réservation:", error);
    }
  };

  const handleCreateEmployee = async () => {
    try {
      await axios.post("/chef/employees", nouvelUtilisateur);
      const employeesResponse = await axios.get("/chef/employees");
      setEmployees(employeesResponse.data);
    } catch (error) {
      console.error("Erreur lors de la création de l'employé:", error);
    }
  };

  const handleUpdateEmployee = async () => {
    try {
      await axios.put(
        `/chef/employees/${nouvelUtilisateur.id}`,
        nouvelUtilisateur
      );
      const employeesResponse = await axios.get("/chef/employees");
      setEmployees(employeesResponse.data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'employé:", error);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await axios.delete(`/chef/employees/${employeeId}`);
      setEmployees(employees.filter((emp) => emp.id !== employeeId));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'employé:", error);
    }
  };

  return (
    <div style={{ margin: "50px" }}>
      <Typography variant="h3" align="center" gutterBottom>
        Tableau de bord de l'administrateur
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h5">Gestion des utilisateurs</Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleOpenModal}
                sx={{ mt: 2, borderRadius: 8 }}
              >
                Créer un utilisateur
              </Button>

              {/* Add Modal for user creation */}
              <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    width: 400,
                  }}
                >
                  <Typography
                    id="modal-title"
                    variant="h6"
                    component="h2"
                    gutterBottom
                  >
                    Créer un utilisateur
                  </Typography>

                  {error && <Typography color="error">{error}</Typography>}
                  {verificationMessage && (
                    <Typography color="success">
                      {verificationMessage}
                    </Typography>
                  )}

                  <TextField
                    fullWidth
                    label="Nom"
                    value={nouvelUtilisateur.username}
                    onChange={(e) =>
                      setNouvelUtilisateur({
                        ...nouvelUtilisateur,
                        username: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={nouvelUtilisateur.email}
                    onChange={(e) =>
                      setNouvelUtilisateur({
                        ...nouvelUtilisateur,
                        email: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Mot de passe"
                    type="password"
                    value={nouvelUtilisateur.password}
                    onChange={(e) =>
                      setNouvelUtilisateur({
                        ...nouvelUtilisateur,
                        password: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                  />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="department-label">Département</InputLabel>
                    <Select
                      labelId="department-label"
                      value={nouvelUtilisateur.numdep}
                      onChange={(e) =>
                        setNouvelUtilisateur({
                          ...nouvelUtilisateur,
                          numdep: e.target.value,
                        })
                      }
                      label="Département"
                    >
                      {availableDepartments.map((dep) => (
                        <MenuItem key={dep.id} value={dep.id}>
                          {dep.nomdepart}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {!verificationMessage ? (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleCreateUser}
                      disabled={isVerifying}
                    >
                      Enregistrer
                    </Button>
                  ) : (
                    <div>
                      <TextField
                        fullWidth
                        label="Code de vérification"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleVerifyCode}
                        disabled={isVerifying}
                      >
                        Vérifier
                      </Button>
                    </div>
                  )}
                </Box>
              </Modal>

              {/* Update User Modal */}
              <Modal
                open={openUpdateModal}
                onClose={handleCloseUpdateModal}
                aria-labelledby="update-modal-title"
                aria-describedby="update-modal-description"
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    width: 400,
                  }}
                >
                  <Typography
                    id="update-modal-title"
                    variant="h6"
                    component="h2"
                    gutterBottom
                  >
                    Modifier l'utilisateur
                  </Typography>
                  {error && <Typography color="error">{error}</Typography>}

                  {/* Update Form (Pre-filled with selectedUser data) */}
                  <TextField
                    fullWidth
                    label="Nom"
                    value={nouvelUtilisateur.name}
                    onChange={(e) =>
                      setNouvelUtilisateur({
                        ...nouvelUtilisateur,
                        username: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={nouvelUtilisateur.email}
                    onChange={(e) =>
                      setNouvelUtilisateur({
                        ...nouvelUtilisateur,
                        email: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Mot de passe"
                    type="password"
                    value={nouvelUtilisateur.password}
                    onChange={(e) =>
                      setNouvelUtilisateur({
                        ...nouvelUtilisateur,
                        password: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                  />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="department-label">Département</InputLabel>
                    <Select
                      labelId="department-label"
                      value={nouvelUtilisateur.numdep}
                      onChange={(e) =>
                        setNouvelUtilisateur({
                          ...nouvelUtilisateur,
                          numdep: e.target.value,
                        })
                      }
                      label="Département"
                    >
                      {departments.map((dep) => (
                        <MenuItem key={dep.id} value={dep.id}>
                          {dep.nomdepart}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleUpdateUser}
                  >
                    Mettre à jour
                  </Button>
                </Box>
              </Modal>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                {users && users.length > 0 ? (
                  users
                    .filter((user) => user.role !== "admin")
                    .map((user) => (
                      <Grid item key={user.id} xs={12}>
                        <StyledListItem elevation={1}>
                          <Box flexGrow={1}>
                            <Typography variant="body1" fontWeight="bold">
                              {user.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Email: {user.email}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Role: {user.role}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Department:{" "}
                              {departments.find((dep) => dep.id === user.numdep)
                                ?.nomdepart || "N/A"}
                            </Typography>
                          </Box>
                          <div>
                            <IconButton
                              onClick={() => handleOpenUpdateModal(user)}
                              aria-label="edit"
                              sx={{ color: "primary" }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteUser(user.id)}
                              aria-label="delete"
                              sx={{ color: "error" }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        </StyledListItem>
                      </Grid>
                    ))
                ) : (
                  <Typography variant="body2" align="center">
                    Aucun utilisateur disponible
                  </Typography>
                )}
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Gestion des réservations
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCreateReservation}
                sx={{ mt: 2, borderRadius: 8 }}
              >
                Créer une réservation
              </Button>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {reservations && reservations.length > 0 ? (
                  reservations.map((reservation) => (
                    <Grid item key={reservation.id} xs={12}>
                      <StyledListItem elevation={1}>
                        <Box flexGrow={1}>
                          {" "}
                          {/* Occupy available space */}
                          <Typography variant="body1" fontWeight="bold">
                            {reservation.description}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Date:{" "}
                            {moment(reservation.date).format("YYYY-MM-DD")} |
                            Heure: {reservation.time}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Département: {reservation.department}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Citoyen: {reservation.citizen} | Téléphone:{" "}
                            {reservation.phone}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={
                              reservation.status === "En attente"
                                ? "orange"
                                : "green"
                            }
                          >
                            Status: {reservation.status}
                          </Typography>
                        </Box>
                        <div>
                          <IconButton
                            onClick={() => setNouvelUtilisateur(reservation)}
                            aria-label="edit"
                            sx={{ color: "primary" }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() =>
                              handleDeleteReservation(reservation.id)
                            }
                            aria-label="delete"
                            sx={{ color: "error" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      </StyledListItem>
                    </Grid>
                  ))
                ) : (
                  <Typography variant="body2" align="center">
                    Aucune réservation disponible
                  </Typography>
                )}
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h5">Gestion des employés</Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCreateEmployee}
                sx={{ mt: 2, borderRadius: 8 }}
              >
                Créer un employé
              </Button>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {employees && employees.length > 0 ? (
                  employees.map((employee) => (
                    <Grid item key={employee.id} xs={12}>
                      <StyledListItem elevation={1}>
                        <Box flexGrow={1}>
                          <Typography variant="body1" fontWeight="bold">
                            {employee.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Email: {employee.email}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Téléphone: {employee.telephone}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Age: {employee.age}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Département: {employee.department}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Role: {employee.role}
                          </Typography>
                        </Box>
                        <div>
                          <IconButton
                            onClick={() => setNouvelUtilisateur(employee)}
                            aria-label="edit"
                            sx={{ color: "primary" }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteEmployee(employee.id)}
                            aria-label="delete"
                            sx={{ color: "error" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      </StyledListItem>
                    </Grid>
                  ))
                ) : (
                  <Typography variant="body2" align="center">
                    Aucun employé disponible
                  </Typography>
                )}
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
      <Modal
        open={openVerificationModal}
        onClose={handleCloseVerificationModal}
        aria-labelledby="verification-modal-title"
        aria-describedby="verification-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            width: 400,
          }}
        >
          <Typography
            id="verification-modal-title"
            variant="h6"
            component="h2"
            gutterBottom
          >
            Verify Your Email
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          {verificationMessage && (
            <Typography color="success">{verificationMessage}</Typography>
          )}
          <TextField
            fullWidth
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleVerifyCode}
            disabled={isVerifying}
          >
            Verify
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default DashboardAdmin;
