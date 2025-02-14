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

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  fontWeight: 'bold',  
}));


const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
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
  const [openUpdateEmployee, setOpenUpdateEmployee] = useState(false);
  const [newEmployeeData, setNewEmployeeData] = useState({
    name: "",
    telephone: "",
    email: "",
    age: "",
    department: "",
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null); 
  const [openCreateReservation, setOpenCreateReservation] = useState(false);
  const [openUpdateReservation, setOpenUpdateReservation] = useState(false);
  const [newReservationData, setNewReservationData] = useState({
    description: '',
    date: '',
    time: '',
    department: '',
    citizen: '',
    phone: '',
    status: 'En attente',  
  });
  const [selectedReservation, setSelectedReservation] = useState(null); 
  const [showPassword, setShowPassword] = useState(false);
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
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setOpenModal(false);
      setError(null);
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      setSnackbarMessage("Erreur lors de la création de l'utilisateur");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      if (error.response) {
        console.error("Réponse du serveur:", error.response.data);
        setSnackbarMessage(error.response.data.error || "L'enregistrement a échoué.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setError(error.response.data.error || "L'enregistrement a échoué.");
      } else if (error.request) {
        console.error("Erreur de la requête:", error.request); 
        setSnackbarMessage("Erreur réseau. Veuillez réessayer plus tard.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setError("Erreur réseau. Veuillez réessayer plus tard."); 
      } else {
        console.error("Autre erreur:", error.message); 
        setSnackbarMessage("Une erreur inattendue s'est produite.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
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
        setSnackbarMessage("Verification successful!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
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
      console.log("User updated successfully:", usersResponse.data);
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
      setSnackbarMessage(response.data.message || "Utilisateur mis à jour avec succès");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error); 
      setError(error.response?.data?.error || "Erreur lors de la mise à jour de l'utilisateur"); 
      setSnackbarMessage(error.response?.data?.error || "Erreur lors de la mise à jour de l'utilisateur");
      setSnackbarSeverity("edrror");
      setSnackbarOpen(true);
    }
  };

  const handleCreateReservation = async () => {
    try {
      await axios.post("/reservations", newReservationData);
      const reservationsResponse = await axios.get("/reservations");
      setReservations(reservationsResponse.data);
      handleCloseCreateReservation();
      setNewReservationData({  
        description: '',
        date: '',
        time: '',
        department: '',
        citizen: '',
        phone: '',
        status: 'En attente',
      });
      setSnackbarMessage(<Translate textKey="reservationCreated" />);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error creating reservation:", error);
      setSnackbarMessage(<Translate textKey="error" vales={{message: error.response?.data?.error}} />);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleUpdateReservation = async () => {
    try {
      await axios.put(`/reservations/${selectedReservation.id}`, newReservationData);
      const reservationsResponse = await axios.get("/reservations");
      setReservations(reservationsResponse.data);
      handleCloseUpdateReservation();
      setSelectedReservation(null);
      setNewReservationData({ 
        description: '',
        date: '',
        time: '',
        department: '',
        citizen: '',
        phone: '',
        status: 'En attente',
      });
      setSnackbarMessage(<Translate textKey="reservationCreated" />);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

    } catch (error) {
      console.error("Error updating reservation:", error);
      setSnackbarMessage(<Translate textKey="reservationError" />);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleOpenUpdateReservation = (reservation) => {
    setSelectedReservation(reservation);
    setNewReservationData({ ...reservation }); 
    setOpenUpdateReservation(true);
  };

  const handleCloseCreateReservation = () => setOpenCreateReservation(false);
  const handleCloseUpdateReservation = () => setOpenUpdateReservation(false);

  const handleCreateEmployee = async () => {
    try {
      await axios.post("/chef/employees", newEmployeeData);  
      const employeesResponse = await axios.get("/chef/employees");
      setEmployees(employeesResponse.data);
      setOpenCreateEmployee(false);
      setSelectedEmployee(null);
      setNewEmployeeData({ 
        name: "",
        telephone: "",
        email: "",
        age: "",
        department: "",
      });
      setSnackbarMessage(<Translate textKey="employeeCreated" />);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erreur lors de la création de l'employé:", error);
      setSnackbarMessage(<Translate textKey="anErrorOccurred"/>);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleUpdateEmployee = async () => {
    try {
      await axios.put(
        `/chef/employees/${selectedUser.id}`,  
        newEmployeeData,                 
      );
      const employeesResponse = await axios.get("/chef/employees");
      setEmployees(employeesResponse.data);
      setSnackbarMessage(<Translate textKey="employeeCreated" />);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'employé:", error);
      setSnackbarMessage(<Translate textKey="anErrorOccurred" />);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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

  const handleOpenUpdateEmployee = (employee) => {
    setSelectedEmployee(employee);
    setNewEmployeeData({ ...employee }); 
    setOpenUpdateEmployee(true);        
  };

  const handleCloseUpdateEmployee = () => {   
    setOpenUpdateEmployee(false);
    setSelectedEmployee(null);         
    setNewEmployeeData({               
      name: "",
      telephone: "",
      email: "",
      age: "",
      department: "",
    });
  };

  

  const confirmDelete = async () => {
    try {
      if (itemToDelete.type === "user") {
        await axios.delete(`/users/${itemToDelete.id}`);
        setUsers(users.filter((user) => user.id !== itemToDelete.id));
        setSnackbarMessage("User deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else if (itemToDelete.type === "reservation") {
        await axios.delete(`/reservations/${itemToDelete.id}`);
        setReservations(reservations.filter((res) => res.id !== itemToDelete.id));
        setSnackbarMessage("Reservation deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else if (itemToDelete.type === "employee") {
        await axios.delete(`/chef/employees/${itemToDelete.id}`);
        setEmployees(employees.filter((emp) => emp.id !== itemToDelete.id));
        setSnackbarMessage("Employee deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else if (itemToDelete.type === "department") {
        await axios.delete(`/departments/${itemToDelete.id}`);
        setDepartments(departments.filter((dep) => dep.id !== itemToDelete.id));
        setSnackbarMessage("Department deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }

      setOpenDeleteConfirmation(false);
      setItemToDelete(null);
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
      setSnackbarMessage(`Error deleting ${itemToDelete.type}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseDeleteConfirmation = () => {
    setOpenDeleteConfirmation(false);
    setItemToDelete(null);
  };

  const handleCreateDepartment = async () => {
    try {
      const response = await axios.post("/departments", newDepartmentData);
      setSnackbarMessage("Department created successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setOpenCreateDepartment(false);
      setNewDepartmentData({ nomdepart: "" }); 
      const departmentsResponse = await axios.get("/departments");
      setDepartments(departmentsResponse.data);
    } catch (error) {
      console.error("Error creating department:", error);
      setSnackbarMessage(<Translate textKey="error" values={{message:error.response?.data?.error || "Error creating department"}}/>);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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
      setSnackbarMessage("Department updated successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setOpenCreateDepartment(false);
      setOpenUpdateDepartment(false);
      setSelectedDepartment(null);
      setNewDepartmentData({ nomdepart: "" });
      const departmentsResponse = await axios.get("/departments");
      setDepartments(departmentsResponse.data);

    } catch (error) {
      console.error("Error updating department:", error);
      setSnackbarMessage(<Translate textKey="error" values={{message:error.response?.data?.error || "Error updating department"}}/>);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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

              {/* Add Dialog for user creation */}
              <StyledDialog open={openModal} onClose={handleCloseModal}>
                <StyledDialogTitle>
                  <Translate textKey="createUser" />
                </StyledDialogTitle>
                <StyledDialogContent>
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
                  <PasswordTextField
                      fullWidth
                      label={<Translate textKey="password" />}
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
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                    {error && <Typography color="error">{error}</Typography>}
                    {verificationMessage && (
                      <Typography color="success">
                        {verificationMessage}
                      </Typography>
                    )}
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
                </StyledDialogContent>
                <DialogActions>
                      <Button onClick={handleCloseModal}><Translate textKey="cancel" /></Button>
                      {!verificationMessage ? (
                        <Button
                          variant="contained"
                          color="primary"
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
                            onClick={handleVerifyCode}
                            disabled={isVerifying}
                          >
                            <Translate textKey="verify" />
                          </Button>
                        </div>
                      )}
                    </DialogActions>
              </StyledDialog>

              {/* Update User Dialog */}
              <StyledDialog open={openUpdateModal} onClose={handleCloseUpdateModal}>
                <StyledDialogTitle>
                  <Translate textKey="updateUser" />
                </StyledDialogTitle>
                <StyledDialogContent>
                  {error && <Typography color="error">{error}</Typography>}
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
                  <PasswordTextField
                      fullWidth
                      label={<Translate textKey="password" />}
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
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                </StyledDialogContent>
                <DialogActions>
                  <Button onClick={handleCloseUpdateModal}><Translate textKey="cancel" /></Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateUser}
                  >
                    <Translate textKey="edit" />
                  </Button>
                </DialogActions>
              </StyledDialog>

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
              <Typography variant="h5" gutterBottom>
                <Translate textKey="reservationManagement" />
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => setOpenCreateReservation(true)}
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
                            onClick={() =>  handleOpenUpdateReservation(reservation)}
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

          {/* Create Reservation Dialog */}
          <StyledDialog open={openCreateReservation} onClose={handleCloseCreateReservation} onClose={() => setOpenCreateReservation(false)} TransitionComponent={Transition} maxWidth="sm" fullWidth>
            <StyledDialogTitle> <Translate textKey="createReservation" /></StyledDialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label={<Translate textKey="description" />}
                value={newReservationData.description}
                onChange={(e) => setNewReservationData({ ...newReservationData, description: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label={<Translate textKey="date" />}
                type="date"
                value={newReservationData.date}
                onChange={(e) => setNewReservationData({ ...newReservationData, date: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }} 
              />
              <TextField
                fullWidth
                label={<Translate textKey="time" />}
                type="time"
                value={newReservationData.time}
                onChange={(e) => setNewReservationData({ ...newReservationData, time: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}  
              />
              <FormControl fullWidth margin="normal">
                <InputLabel><Translate textKey="department" /></InputLabel>
                <Select
                  value={newReservationData.department}
                  onChange={(e) => setNewReservationData({ ...newReservationData, department: e.target.value })}
                  label={<Translate textKey="department" />}
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
                label={<Translate textKey="citizenName" />}
                value={newReservationData.citizen}
                onChange={(e) => setNewReservationData({ ...newReservationData, citizen: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label={<Translate textKey="phone" />}
                value={newReservationData.phone}
                onChange={(e) => setNewReservationData({ ...newReservationData, phone: e.target.value })}
                margin="normal"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCreateReservation}><Translate textKey="cancel" /></Button>
              <Button onClick={handleCreateReservation} variant="contained" color="primary">
                <Translate textKey="create" />
              </Button>
            </DialogActions>
          </StyledDialog>

          {/* Update Reservation Dialog */}
          <StyledDialog open={openUpdateReservation} onClose={handleCloseUpdateReservation} maxWidth="sm" fullWidth>
            <StyledDialogTitle><Translate textKey="updateReservation" /></StyledDialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label=<Translate textKey="description" />
                value={newReservationData.description}
                onChange={(e) => setNewReservationData({ ...newReservationData, description: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label={<Translate textKey="date" />}
                type="date"
                value={newReservationData.date}
                onChange={(e) => setNewReservationData({ ...newReservationData, date: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label={<Translate textKey="time" />}
                type="time"
                value={newReservationData.time}
                onChange={(e) => setNewReservationData({ ...newReservationData, time: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}  
              />
              <FormControl fullWidth margin="normal">
                <InputLabel><Translate textKey="department" /></InputLabel>
                <Select
                  value={newReservationData.department}
                  onChange={(e) => setNewReservationData({ ...newReservationData, department: e.target.value })}
                  label={<Translate textKey="department" />}
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
                label={<Translate textKey="citizenName" />}
                value={newReservationData.citizen}
                onChange={(e) => setNewReservationData({ ...newReservationData, citizen: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label={<Translate textKey="phone" />}
                value={newReservationData.phone}
                onChange={(e) => setNewReservationData({ ...newReservationData, phone: e.target.value })}
                margin="normal"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseUpdateReservation}><Translate textKey="cancel" /></Button>
              <Button onClick={handleUpdateReservation} variant="contained" color="primary">
                <Translate textKey="edit" />
              </Button>
            </DialogActions>
          </StyledDialog>
          
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
                <StyledDialogTitle sx={{ fontWeight: 600, padding: '20px 24px 10px' }}><Translate textKey="createDepartment" /></StyledDialogTitle> 
                <DialogContent sx={{ padding: '20px 24px' }}> 
                  <StyledTextField
                    fullWidth
                    label={<Translate textKey="departmentName" />}
                    value={newDepartmentData.nomdepart}
                    onChange={(e) => setNewDepartmentData({ ...newDepartmentData, nomdepart: e.target.value })}
                    margin="normal"
                    variant="outlined"
                  />
                </DialogContent>
                <DialogActions sx={{ padding: '10px 24px 20px' }}> 
                  <StyledButton onClick={() => setOpenCreateDepartment(false)} color="grey"> 
                    <Translate textKey="cancel" />
                  </StyledButton>
                  <StyledButton onClick={handleCreateDepartment} color="primary" variant="contained"> 
                    <Translate textKey="create" />
                  </StyledButton>
                </DialogActions>
              </StyledDialog>

              <StyledDialog open={openUpdateDepartment} onClose={() => setOpenUpdateDepartment(false)} TransitionComponent={Transition}>
                <StyledDialogTitle sx={{ fontWeight: 600, padding: '20px 24px 10px' }}><Translate textKey="updateDepartment" /></StyledDialogTitle>
                <DialogContent sx={{ padding: '20px 24px' }}>
                  <StyledTextField
                    fullWidth
                    label={<Translate textKey="departmentName" />}
                    value={newDepartmentData.nomdepart}
                    onChange={(e) => setNewDepartmentData({ ...newDepartmentData, nomdepart: e.target.value })}
                    margin="normal"
                    variant="outlined"
                  />
                </DialogContent>
                <DialogActions sx={{ padding: '10px 24px 20px' }}>
                <StyledButton onClick={() => setOpenUpdateDepartment(false)} color="grey">
                  <Translate textKey="cancel" />
                  </StyledButton>
                  <StyledButton onClick={handleUpdateDepartment} color="primary" variant="contained">
                    <Translate textKey="edit" />
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
          <Typography variant="h5">
            <Translate textKey="employeeManagement" />
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => setOpenCreateEmployee(true)}
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
                        onClick={() => handleOpenUpdateEmployee(employee)}
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

      {/* Create Employee Dialog */}
      <StyledDialog open={openCreateEmployee} onClose={() => setOpenCreateEmployee(false)} maxWidth="sm" fullWidth>
        <StyledDialogTitle><Translate textKey="createEmployee" /></StyledDialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={<Translate textKey="name" />}
            value={newEmployeeData.name}
            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={<Translate textKey="phone" />}
            value={newEmployeeData.telephone}
            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, telephone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={<Translate textKey="email" />}
            value={newEmployeeData.email}
            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={<Translate textKey="age" />}
            type="number" 
            value={newEmployeeData.age}
            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, age: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel><Translate textKey="department" /></InputLabel>
            <Select
              value={newEmployeeData.department}
              onChange={(e) => setNewEmployeeData({ ...newEmployeeData, department: e.target.value })}
              label={<Translate textKey="department" />}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.nomdepart}>
                  {dept.nomdepart}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateEmployee(false)}><Translate textKey="cancel" /></Button>
          <Button onClick={handleCreateEmployee} variant="contained" color="primary">
            <Translate textKey="create" />
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* Update Employee Dialog */}
        <StyledDialog open={openUpdateEmployee} onClose={handleCloseUpdateEmployee} maxWidth="sm" fullWidth> 
        <StyledDialogTitle><Translate textKey="updateEmployee" /></StyledDialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={<Translate textKey="name" />}
            value={newEmployeeData.name} 
            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={<Translate textKey="phone" />}
            value={newEmployeeData.telephone}
            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, telephone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={<Translate textKey="email" />}
            value={newEmployeeData.email}
            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={<Translate textKey="age" />}
            type="number"
            value={newEmployeeData.age}
            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, age: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel><Translate textKey="department" /></InputLabel>
            <Select
              value={newEmployeeData.department}
              onChange={(e) => setNewEmployeeData({ ...newEmployeeData, department: e.target.value })}
              label={<Translate textKey="department" />}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.nomdepart}>
                  {dept.nomdepart}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdateEmployee}><Translate textKey="cancel" /></Button>
          <Button onClick={handleUpdateEmployee} variant="contained" color="primary">
            <Translate textKey="edit" />
          </Button>
        </DialogActions>
      </StyledDialog>

      
    
    {/* Verification Modal*/}
    <Modal open={openVerificationModal} onClose={handleCloseVerificationModal}>
    <Box sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        width: 400,
      }}>
      <Typography id="verification-modal-title" variant="h6" component="h2" gutterBottom>
        <Translate textKey="verifyEmail" />  
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      {verificationMessage && <Typography color="success">{verificationMessage}</Typography>}
      <TextField
        fullWidth
        label={<Translate textKey="verificationCode" />} 
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
        <Translate textKey="verify" />  
      </Button>
    </Box>
    </Modal>

    {/* Delete Confirmation Dialog */}
    <StyledDialog
    open={openDeleteConfirmation}
    onClose={handleCloseDeleteConfirmation}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
    TransitionComponent={Transition}
    >
    <StyledDialogTitle id="alert-dialog-title">
      <Translate textKey="deleteConfirmation" values={{ itemType: itemToDelete?.type }} />  
    </StyledDialogTitle>
    <DialogContent>
      <Typography id="alert-dialog-description">
        <Translate textKey="deleteWarning" />  
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseDeleteConfirmation}>
        <Translate textKey="cancel" />  
      </Button>
      <Button onClick={confirmDelete} color="error">
        <Translate textKey="delete" />  
      </Button>
    </DialogActions>
    </StyledDialog>

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
    </div>
  )
};
