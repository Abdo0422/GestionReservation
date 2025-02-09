import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import axios from '../features/axios';

const ReservationForm = () => {
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/reservations', { description, date, time, department });
      window.location.href = '/';
    } catch (error) {
      setError(error.response.data.error);
    }
  };

  return (
    <div>
      <h1>Make a Reservation</h1>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Description"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <TextField
          label="Time"
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
        />
        <TextField
          label="Department"
          type="text"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
        />
        <Button type="submit" sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}>Make Reservation</Button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default ReservationForm;
