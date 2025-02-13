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
  Slide,
  InputAdornment,
} from "@mui/material";
import axios from "../features/axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment";
import { useSnackbar } from "notistack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { TransitionProps } from '@mui/material/transitions';
import Translate from "./Translate";
import { formatDate } from "../features/translations/formatDate";


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

const PasswordTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    paddingRight: "48px",
  },
  "& .MuiOutlinedInput-root": {
    paddingRight: "48px",
  },
}));
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 8, 
    boxShadow: theme.shadows[5], 
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.02)', 
    },
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8, 
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8, 
  textTransform: 'none', 
  padding: '10px 20px', 
  fontWeight: 500, 
}));

const Transition = React.forwardRef(function Transition(props: TransitionProps & {
  children: React.ReactElement,
}, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const AdminDashboard = () => {
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
  const [openCreateDepartment, setOpenCreateDepartment] = useState(false);
  const [newDepartmentData, setNewDepartmentData] = useState({
    nomdepart: "",
  });
  const [openUpdateDepartment, setOpenUpdateDepartment] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [openCreateEmployee, setOpenCreateEmployee] = useState(false);
  const [newEmployeeData, setNewEmployeeData] = useState({
    name: "",
    telephone: "",
    email: "",
    age: "",
    department: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");  

  useEffect(() => {
    const fetchAvailableDepartments = async () => {
      try {
        const departmentsResponse = await axios.get("/departments");
        const allDepartments = departmentsResponse.data;
        const usersResponse = await axios.get("/users");
        const users = usersResponse.data;
        const departmentsWithChef = new Set(users.map((user) => user.numdep));

        const filteredDepartments = allDepartments.filter(
          (dep) => !departmentsWithChef.has(dep.id),
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCreateUser = async () => {
    try {
      const response = await axios.post("/register", nouvelUtilisateur);
      setRegisteredResponse(response.data);
      enqueueSnackbar(response.data.message, { variant: "success" });
      setOpenModal(false);
      setError(null);
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      enqueueSnackbar("Erreur lors de la création de l'utilisateur", { variant: "error" });

      if (error.response) {
        console.error("Réponse du serveur:", error.response.data);
        enqueueSnackbar(error.response.data.error || "L'enregistrement a échoué.", { variant: "error" }); 
        setError(error.response.data.error || "L'enregistrement a échoué.");
      } else if (error.request) {
        console.error("Erreur de la requête:", error.request); 
        enqueueSnackbar("Erreur réseau. Veuillez réessayer plus tard.", { variant: "error" }); 
        setError("Erreur réseau. Veuillez réessayer plus tard."); 
      } else {
        console.error("Autre erreur:", error.message); 
        enqueueSnackbar("Une erreur inattendue s'est produite.", { variant: "error" });
        setError("Une erreur inattendue s'est produite."); 
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
        enqueueSnackbar("Verification successful!", { variant: "success" });
        setVerificationMessage("Your email has been verified successfully!");
        setOpenVerificationModal(false);
        const usersResponse = await axios.get("/users");
        setUsers(usersResponse.data);
        setVerificationCode("");
      } else {
        console.log(
          "Verification failed: No data in response or invalid response.",
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
    setNouvelUtilisateur({
      ...user,
      username: user.name, 
      password: "",
    });
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
      const response = await axios.put(`/users/${selectedUser.id}`, nouvelUtilisateur);
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
      enqueueSnackbar(response.data.message || "Utilisateur mis à jour avec succès", { variant: "success" }); 
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error); 
      setError(error.response?.data?.error || "Erreur lors de la mise à jour de l'utilisateur"); 
      enqueueSnackbar(error.response?.data?.error || "Erreur lors de la mise à jour de l'utilisateur", { variant: "error" }); 
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
        nouvelUtilisateur,
      );
      const reservationsResponse = await axios.get("/reservations");
      setReservations(reservationsResponse.data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la réservation:", error);
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
        nouvelUtilisateur,
      );
      const employeesResponse = await axios.get("/chef/employees");
      setEmployees(employeesResponse.data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'employé:", error);
    }
  };

  
  const handleDeleteUser = async (userId) => {
    setItemToDelete({ id: userId, type: "user" }); 
    setOpenDeleteConfirmation(true);
  };

  const handleDeleteReservation = async (reservationId) => {
    setItemToDelete({ id: reservationId, type: "reservation" }); 
    setOpenDeleteConfirmation(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    setItemToDelete({ id: employeeId, type: "employee" }); 
    setOpenDeleteConfirmation(true);
  };
  

  const confirmDelete = async () => {
    try {
      if (itemToDelete.type === "user") {
        await axios.delete(`/users/${itemToDelete.id}`);
        setUsers(users.filter((user) => user.id !== itemToDelete.id));
        enqueueSnackbar("User deleted successfully", { variant: "success" });
      } else if (itemToDelete.type === "reservation") {
        await axios.delete(`/reservations/${itemToDelete.id}`);
        setReservations(reservations.filter((res) => res.id !== itemToDelete.id));
        enqueueSnackbar("Reservation deleted successfully", { variant: "success" });
      } else if (itemToDelete.type === "employee") {
        await axios.delete(`/chef/employees/${itemToDelete.id}`);
        setEmployees(employees.filter((emp) => emp.id !== itemToDelete.id));
        enqueueSnackbar("Employee deleted successfully", { variant: "success" });
      } else if (itemToDelete.type === "department") {
        await axios.delete(`/departments/${itemToDelete.id}`);
        setDepartments(departments.filter((dep) => dep.id !== itemToDelete.id));
        enqueueSnackbar("Department deleted successfully", { variant: "success" });
      }

      setOpenDeleteConfirmation(false);
      setItemToDelete(null);
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
      enqueueSnackbar(`Error deleting ${itemToDelete.type}`, { variant: "error" });
    }
  };

  const handleCloseDeleteConfirmation = () => {
    setOpenDeleteConfirmation(false);
    setItemToDelete(null);
  };

  const handleCreateDepartment = async () => {
    try {
      const response = await axios.post("/departments", newDepartmentData);
      enqueueSnackbar("Department created successfully", { variant: "success" });
      setOpenCreateDepartment(false);
      setNewDepartmentData({ nomdepart: "" }); // Clear form
      const departmentsResponse = await axios.get("/departments");
      setDepartments(departmentsResponse.data);
    } catch (error) {
      console.error("Error creating department:", error);
      enqueueSnackbar(error.response?.data?.error || "Error creating department", { variant: "error" });
    }
  };


  const handleOpenUpdateDepartment = (department) => {
    setSelectedDepartment(department);
    setNewDepartmentData({ ...department });
    setOpenUpdateDepartment(true);
  };

  const handleUpdateDepartment = async () => {
    try {
      await axios.put(`/departments/${selectedDepartment.id}`, newDepartmentData);
      enqueueSnackbar("Department updated successfully", { variant: "success" });
      setOpenUpdateDepartment(false);
      setSelectedDepartment(null);
      setNewDepartmentData({ nomdepart: "" });
      const departmentsResponse = await axios.get("/departments");
      setDepartments(departmentsResponse.data);

    } catch (error) {
      console.error("Error updating department:", error);
      enqueueSnackbar(error.response?.data?.error || "Error updating department", { variant: "error" });
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    setItemToDelete({ id: departmentId, type: "department" });
    setOpenDeleteConfirmation(true);
  };

  
  return (
    <div style={{ margin: "50px" }}>
      <Typography variant="h3" align="center" gutterBottom>
        <Translate textKey="adminDashboardTitle" /> 
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h5"><Translate textKey="userManagement" /></Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleOpenModal}
                sx={{ mt: 2, borderRadius: 8 }}
              >
                <Translate textKey="createUser" />
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
                    <Translate textKey="createUser" />
                  </Typography>

                  {error && <Typography color="error">{error}</Typography>}
                  {verificationMessage && (
                    <Typography color="success">
                      {verificationMessage}
                    </Typography>
                  )}

                  <TextField
                    fullWidth
                    label={<Translate textKey="name" />}
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
                    label={<Translate textKey="email" />}
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
                    label={<Translate textKey="password" />}
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
                    <InputLabel id="department-label"><Translate textKey="department" /></InputLabel>
                    <Select
                      labelId="department-label"
                      value={nouvelUtilisateur.numdep}
                      onChange={(e) =>
                        setNouvelUtilisateur({
                          ...nouvelUtilisateur,
                          numdep: e.target.value,
                        })
                      }
                      label={<Translate textKey="department" />}
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
                      <Translate textKey="save" />
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
                    label={<Translate textKey="email" />}
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
                  <PasswordTextField
                    fullWidth
                    label="Mot de passe"
                    type={showPassword ? "text" : "password"}
                    value={nouvelUtilisateur.password}
                    onChange={(e) =>
                      setNouvelUtilisateur({
                        ...nouvelUtilisateur,
                        password: e.target.value,
                      })
                    }
                    InputProps={{
                      endIcon: (
                        <InputAdornment position="end">
                          <IconButton onClick={togglePasswordVisibility}>
                            {showPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="department-label"><Translate textKey="department" /></InputLabel>
                    <Select
                      labelId="department-label"
                      value={nouvelUtilisateur.numdep}
                      onChange={(e) =>
                        setNouvelUtilisateur({
                          ...nouvelUtilisateur,
                          numdep: e.target.value,
                        })
                      }
                      label={<Translate textKey="department" />}
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
                              <Translate textKey="email" />: {user.email}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              <Translate textKey="role" />: {user.role}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              <Translate textKey="department" />:
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
                     <Translate textKey="noUsersAvailable" />
                  </Typography>
                )}
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h5"><Translate textKey="departmentManagement" /></Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => setOpenCreateDepartment(true)}
                sx={{ mt: 2, borderRadius: 8 }}
              >
                <Translate textKey="createDepartment" />
              </Button>

              <StyledDialog open={openCreateDepartment} onClose={() => setOpenCreateDepartment(false)} TransitionComponent={Transition}>
                <DialogTitle sx={{ fontWeight: 600, padding: '20px 24px 10px' }}>Créer un département</DialogTitle> 
                <DialogContent sx={{ padding: '20px 24px' }}> 
                  <StyledTextField
                    fullWidth
                    label="Nom du département"
                    value={newDepartmentData.nomdepart}
                    onChange={(e) => setNewDepartmentData({ ...newDepartmentData, nomdepart: e.target.value })}
                    margin="normal"
                    variant="outlined"
                  />
                </DialogContent>
                <DialogActions sx={{ padding: '10px 24px 20px' }}> 
                  <StyledButton onClick={() => setOpenCreateDepartment(false)} color="grey"> 
                    Annuler
                  </StyledButton>
                  <StyledButton onClick={handleCreateDepartment} color="primary" variant="contained"> 
                    Créer
                  </StyledButton>
                </DialogActions>
              </StyledDialog>

              <StyledDialog open={openUpdateDepartment} onClose={() => setOpenUpdateDepartment(false)} TransitionComponent={Transition}>
                <DialogTitle sx={{ fontWeight: 600, padding: '20px 24px 10px' }}>Modifier le département</DialogTitle>
                <DialogContent sx={{ padding: '20px 24px' }}>
                  <StyledTextField
                    fullWidth
                    label="Nom du département"
                    value={newDepartmentData.nomdepart}
                    onChange={(e) => setNewDepartmentData({ ...newDepartmentData, nomdepart: e.target.value })}
                    margin="normal"
                    variant="outlined"
                  />
                </DialogContent>
                <DialogActions sx={{ padding: '10px 24px 20px' }}>
                <StyledButton onClick={() => setOpenUpdateDepartment(false)} color="grey">
                    Annuler
                  </StyledButton>
                  <StyledButton onClick={handleUpdateDepartment} color="primary" variant="contained">
                    Mettre à jour
                  </StyledButton>
                </DialogActions>
              </StyledDialog>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                {departments.map((department) => (
                  <Grid item key={department.id} xs={12}>
                    <StyledListItem elevation={1}>
                      <Box flexGrow={1}>
                        <Typography variant="body1" fontWeight="bold">
                          {department.nomdepart}
                        </Typography>
                      </Box>
                      <div>
                        <IconButton onClick={() => handleOpenUpdateDepartment(department)} aria-label="edit" sx={{ color: "primary" }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteDepartment(department.id)} aria-label="delete" sx={{ color: "error" }}>
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </StyledListItem>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>

        

        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                <Translate textKey="reservationManagement" />
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCreateReservation}
                sx={{ mt: 2, borderRadius: 8 }}
              >
                <Translate textKey="createReservation" />
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
                            <Translate textKey="date" />: {formatDate(reservation.date)} <br />
                            <Translate textKey="time" />: {reservation.time}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <Translate textKey="department" />: {reservation.department}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <Translate textKey="citizenName" />: {reservation.citizen} <br/>
                            <Translate textKey="phone" />:{reservation.phone}
                          </Typography>
                          <Typography
                            variant="body2"
                            label={<Translate textKey={reservation.status === "En attente" ? "pending" : "confirmed"} />}
                            color={
                              reservation.status === "En attente"
                                ? "orange"
                                : "green"
                            }
                          >
                            <Translate textKey="status" />: {reservation.status}
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
                    <Translate textKey="noReservationsAvailable" />
                  </Typography>
                )}
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>

    <Grid item xs={12} sm={6} md={4}>
      <StyledCard>
        <CardContent>
          <Typography variant="h5">
            <Translate textKey="employeeManagement" />
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleCreateEmployee}
            sx={{ mt: 2, borderRadius: 8 }}
          >
            <Translate textKey="createEmployee" />
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
                        <Translate textKey="email" />: {employee.email}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <Translate textKey="phone" />: {employee.telephone}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <Translate textKey="age" />: {employee.age}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <Translate textKey="department" />: {employee.department}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <Translate textKey="role" />: {employee.role}
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
                <Translate textKey="noEmployeesAvailable" />
              </Typography>
            )}
          </Grid>
        </CardContent>
      </StyledCard>
    </Grid>
    </Grid>

    {/* Verification Modal (with translations) */}
    <Modal open={openVerificationModal} onClose={handleCloseVerificationModal}>
    <Box sx={{ /* ... modal styles */ }}>
      <Typography id="verification-modal-title" variant="h6" component="h2" gutterBottom>
        <Translate textKey="verifyEmail" /> {/* Translated */}
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      {verificationMessage && <Typography color="success">{verificationMessage}</Typography>}
      <TextField
        fullWidth
        label={<Translate textKey="verificationCode" />} // Translated
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
        <Translate textKey="verify" /> {/* Translated */}
      </Button>
    </Box>
    </Modal>

    {/* Delete Confirmation Dialog (with translations) */}
    <StyledDialog
    open={openDeleteConfirmation}
    onClose={handleCloseDeleteConfirmation}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
    TransitionComponent={Transition}
    >
    <DialogTitle id="alert-dialog-title">
      <Translate textKey="deleteConfirmation" values={{ itemType: itemToDelete?.type }} /> {/* Translated with interpolation */}
    </DialogTitle>
    <DialogContent>
      <Typography id="alert-dialog-description">
        <Translate textKey="deleteWarning" /> {/* Translated */}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseDeleteConfirmation}>
        <Translate textKey="cancel" /> {/* Translated */}
      </Button>
      <Button onClick={confirmDelete} color="error">
        <Translate textKey="delete" /> {/* Translated */}
      </Button>
    </DialogActions>
    </StyledDialog>
    </div>
  )
};
