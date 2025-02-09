import React, { useState, useEffect } from 'react';
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
  InputLabel
} from '@mui/material';
import axios from '../features/axios';

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'chef',
    numdep: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reservationsResponse = await axios.get('/reservations');
        setReservations(reservationsResponse.data);
        const employeesResponse = await axios.get('/chef/employees');
        setEmployees(employeesResponse.data);
        const usersResponse = await axios.get('/users');
        setUsers(usersResponse.data);
        const departmentsResponse = await axios.get('/departments');
        setDepartments(departmentsResponse.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleCreateUser = async () => {
    try {
      await axios.post('/register', newUser);
      const usersResponse = await axios.get('/users');
      setUsers(usersResponse.data);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'chef',
        numdep: '',
      });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(`/users/${newUser.id}`, newUser);
      const usersResponse = await axios.get('/users');
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleCreateReservation = async () => {
    try {
      await axios.post('/reservations', newUser);
      const reservationsResponse = await axios.get('/reservations');
      setReservations(reservationsResponse.data);
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  };

  const handleUpdateReservation = async () => {
    try {
      await axios.put(`/reservations/${newUser.id}`, newUser);
      const reservationsResponse = await axios.get('/reservations');
      setReservations(reservationsResponse.data);
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    try {
      await axios.delete(`/reservations/${reservationId}`);
      setReservations(reservations.filter((res) => res.id !== reservationId));
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  };

  const handleCreateEmployee = async () => {
    try {
      await axios.post('/chef/employees', newUser);
      const employeesResponse = await axios.get('/chef/employees');
      setEmployees(employeesResponse.data);
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  const handleUpdateEmployee = async () => {
    try {
      await axios.put(`/chef/employees/${newUser.id}`, newUser);
      const employeesResponse = await axios.get('/chef/employees');
      setEmployees(employeesResponse.data);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await axios.delete(`/chef/employees/${employeeId}`);
      setEmployees(employees.filter((emp) => emp.id !== employeeId));
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  return (
    <div style={{margin: '50px'}}>
      <Typography variant="h3" align="center" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">User Management</Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCreateUser}
                sx={{ mt: 2 }}
              >
                Create User
              </Button>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <Grid item key={user.id} xs={12}>
                      <Card sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 2 }}>
                        <Typography variant="body1">{user.name}</Typography>
                        <div>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setNewUser(user)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteUser(user.id)}
                            sx={{ ml: 1 }}
                          >
                            Delete
                          </Button>
                        </div>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Typography variant="body2" align="center">No users available</Typography>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Reservation Management</Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCreateReservation}
                sx={{ mt: 2 }}
              >
                Create Reservation
              </Button>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {reservations && reservations.length > 0 ? (
                  reservations.map((reservation) => (
                    <Grid item key={reservation.id} xs={12}>
                      <Card sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 2 }}>
                        <Typography variant="body1">{reservation.description}</Typography>
                        <div>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setNewUser(reservation)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteReservation(reservation.id)}
                            sx={{ ml: 1 }}
                          >
                            Delete
                          </Button>
                        </div>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Typography variant="body2" align="center">No reservations available</Typography>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Employee Management</Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCreateEmployee}
                sx={{ mt: 2 }}
              >
                Create Employee
              </Button>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {employees && employees.length > 0 ? (
                  employees.map((employee) => (
                    <Grid item key={employee.id} xs={12}>
                      <Card sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 2 }}>
                        <Typography variant="body1">{employee.name}</Typography>
                        <div>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setNewUser(employee)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteEmployee(employee.id)}
                            sx={{ ml: 1 }}
                          >
                            Delete
                          </Button>
                        </div>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Typography variant="body2" align="center">No employees available</Typography>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default AdminDashboard;
