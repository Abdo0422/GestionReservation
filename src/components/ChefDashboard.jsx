import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
} from '@mui/material';
import axios from '../features/axios';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
dayjs.locale('fr');

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
  },
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
  const [popupMessage, setPopupMessage] = useState('');
  const [employeeToUpdate, setEmployeeToUpdate] = useState(null);
  const [openCreateEmployee, setOpenCreateEmployee] = useState(false);
  const [newEmployeeData, setNewEmployeeData] = useState({
    name: '',
    telephone: '',
    email: '',
    age: '',
    department: '',
    role: 'employee',
  });

  const decodeText = (text) => decodeURIComponent(escape(text));

  useEffect(() => {
    const fetchDepartmentName = async () => {
      try {
        if (user && user.numdep) {
          const response = await axios.get('/departments');
          const departments = response.data;
          const foundDepartment = departments.find((dept) => dept.id === user.numdep);
          if (foundDepartment) {
            setDepartmentName(decodeText(foundDepartment.nomdepart));
          } else {
            setErrorDepartment('Département non trouvé.');
          }
        } else {
          setErrorDepartment("Information de l'utilisateur manquante.");
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du département:', error);
        setErrorDepartment('Erreur lors de la récupération du département.');
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
          const response = await axios.get('/chef/reservations', {
            params: { department: departmentName },
          });
          setReservations(response.data);
        } catch (error) {
          console.error('Erreur lors de la récupération des réservations:', error);
          setErrorReservations('Erreur lors de la récupération des réservations.');
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
        const response = await axios.get('/chef/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des employés:', error);
        setErrorEmployees('Erreur lors de la récupération des employés.');
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleToggleStatus = async (reservationId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'En Attente' ? 'Confirmé' : 'En Attente';

      const response = await axios.put(`/chef/reservation/${reservationId}/status`, {
        status: newStatus,
      });

      // Update the status of the reservation in the state
      const updatedReservations = reservations.map((reservation) =>
        reservation.id === reservationId ? { ...reservation, status: newStatus } : reservation
      );
      setReservations(updatedReservations);

      setPopupMessage(`Statut de réservation changé en ${newStatus}.`);
      setOpenPopup(true);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      setPopupMessage('Erreur lors du changement de statut.');
      setOpenPopup(true);
    }
  };

  const handleAssignEmployee = async (reservationId, employeeId) => {
    try {
      const response = await axios.put(`/chef/reservation/${reservationId}/assign-employee`, {
        employee_id: employeeId,
      });
      const updatedReservations = reservations.map((reservation) =>
        reservation.id === reservationId
          ? {
              ...reservation,
              employee_assigned: response.data.employee_assigned,
              status: 'Confirmé',
            }
          : reservation
      );
      setReservations(updatedReservations);
      await axios.put(`/chef/reservation/${reservationId}/status`, { status: 'Confirmé' });

      setPopupMessage('Employé assigné avec succès et statut de réservation mis à jour.');
      setOpenPopup(true);
    } catch (error) {
      console.error("Erreur lors de l'assignation de l'employé:", error);
      setPopupMessage("Erreur lors de l'assignation de l'employé.");
      setOpenPopup(true);
    }
  };

  const handleCreateEmployee = async () => {
    try {
      const response = await axios.post('/chef/employees', newEmployeeData);
      setEmployees([...employees, response.data]);
      setPopupMessage('Employé créé avec succès.');
      setOpenPopup(true);
      setOpenCreateEmployee(false); // Close the modal
    } catch (error) {
      console.error("Erreur lors de la création de l'employé:", error);
      setPopupMessage("Erreur lors de la création de l'employé.");
      setOpenPopup(true);
    }
  };

  const handleUpdateEmployee = async () => {
    try {
      const response = await axios.put(`/chef/employees/${employeeToUpdate.id}`, employeeToUpdate);
      setEmployees(employees.map((emp) => (emp.id === employeeToUpdate.id ? response.data : emp)));
      setEmployeeToUpdate(null);
      setPopupMessage('Employé mis à jour avec succès.');
      setOpenPopup(true);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'employé:", error);
      setPopupMessage("Erreur lors de la mise à jour de l'employé.");
      setOpenPopup(true);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await axios.delete(`/chef/employees/${employeeId}`);
      setEmployees(employees.filter((emp) => emp.id !== employeeId));
      setPopupMessage('Employé supprimé avec succès.');
      setOpenPopup(true);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'employé:", error);
      setPopupMessage("Erreur lors de la suppression de l'employé.");
      setOpenPopup(true);
    }
  };

  const formatDate = (dateString) => dayjs(dateString).format('D MMM YYYY');
  const formatTime = (timeString) => dayjs(timeString, 'HH:mm:ss').format('HH:mm');

  if (loadingReservations || loadingEmployees) {
    return <Typography variant="h6">Chargement...</Typography>;
  }

  if (errorReservations || errorEmployees) {
    return (
      <Typography variant="h6" color="error">
        {errorReservations || errorEmployees}
      </Typography>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 'bold', textAlign: 'center' }}
      >
        Bonjour {user.name}, Chef du département {departmentName}
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3 }}>
        Réservations
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={3}>
        {reservations.map((reservation) => (
          <Grid item key={reservation.id} xs={12} sm={6} md={4} lg={3}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
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

                {/* Make the status clickable */}
                {reservation.status && (
                  <Chip
                    label={reservation.status}
                    color={reservation.status === 'Confirmé' ? 'success' : 'warning'}
                    sx={{ mt: 2, cursor: 'pointer' }}
                    onClick={() => handleToggleStatus(reservation.id, reservation.status)}
                  />
                )}

                {reservation.status !== 'Confirmé' && (
                  <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Assigner Employé</InputLabel>
                      <Select
                        label="Assigner Employé"
                        onChange={(e) => handleAssignEmployee(reservation.id, e.target.value)}
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
                  </Box>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        Liste des employés
      </Typography>
      <Button variant="contained" color="primary" onClick={() => setOpenCreateEmployee(true)}>
        Créer un nouvel employé
      </Button>

      <Grid container spacing={3}>
        {employees.map((employee) => (
          <Grid item key={employee.id} xs={12} sm={6} md={4} lg={3}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {employee.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rôle: {employee.role}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button color="primary" onClick={() => setEmployeeToUpdate(employee)}>
                    Modifier
                  </Button>
                  <Button color="error" onClick={() => handleDeleteEmployee(employee.id)}>
                    Supprimer
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {/* Create Employee Modal */}
      <Dialog open={openCreateEmployee} onClose={() => setOpenCreateEmployee(false)}>
        <DialogTitle>Créer un nouvel employé</DialogTitle>
        <DialogContent>
          <TextField
            label="Nom"
            fullWidth
            value={newEmployeeData.name}
            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Téléphone"
            fullWidth
            value={newEmployeeData.telephone}
            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, telephone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            fullWidth
            value={newEmployeeData.email}
            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Âge"
            fullWidth
            value={newEmployeeData.age}
            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, age: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Département</InputLabel>
            <TextField
              label="Département"
              value={departmentName}
              onChange={(e) =>
                setNewEmployeeData({ ...newEmployeeData, department: e.target.value })
              }
              sx={{ mb: 2 }}
              disabled
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateEmployee(false)}>Annuler</Button>
          <Button onClick={handleCreateEmployee}>Créer</Button>
        </DialogActions>
      </Dialog>

      {/* Success/Failure Popup */}
      <Dialog open={openPopup} onClose={() => setOpenPopup(false)}>
        <DialogTitle>Notification</DialogTitle>
        <DialogContent>
          <Typography>{popupMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPopup(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChefDashboard;
