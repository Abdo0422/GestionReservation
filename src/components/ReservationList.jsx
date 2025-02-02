import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Box, Card, CardContent, Chip } from '@mui/material';
import axios from 'axios';
import { DateTime } from 'luxon'; // Date formatting library
import Calendar from 'react-calendar'; // Calendar component
import 'react-calendar/dist/Calendar.css'; // Calendar styles

function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allReservations, setAllReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/reservations');
        setAllReservations(response.data);
        setReservations(response.data);
      } catch (error) {
        alert('Erreur lors de la récupération des réservations.');
      }
    };

    fetchReservations();
  }, []);

  const filteredReservations = reservations.filter((reservation) => {
    const reservationDate = DateTime.fromISO(reservation.date);
    return reservationDate.hasSame(DateTime.fromJSDate(selectedDate), 'day');
  });

  const isReservedDate = (date) => {
    const selectedDate = DateTime.fromJSDate(date);
    return reservations.some((reservation) =>
      DateTime.fromISO(reservation.date).hasSame(selectedDate, 'day')
    );
  };

  return (
    <Container sx={{ padding: '40px', fontFamily: 'Poppins, sans-serif' }}>
      <Typography variant="h5" sx={{ marginTop: '40px', marginBottom: '20px', fontWeight: 'bold' }}>
        Liste des Réservations
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '30px',
        }}
      >
        <Box sx={{ width: '70%' }}>
          {filteredReservations.length === 0 ? (
            <Typography variant="h6" color="textSecondary" align="center">
              Aucune réservation pour cette date.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {filteredReservations.map((reservation, index) => (
                <Card key={index} sx={{ boxShadow: 3, borderRadius: 2, padding: '10px' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {reservation.space} - {reservation.resource}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ marginBottom: '10px' }}>
                      {`Le ${DateTime.fromISO(reservation.date).toLocaleString(DateTime.DATE_FULL)} à ${DateTime.fromISO(reservation.time).toLocaleString(DateTime.TIME_SIMPLE)}`}
                    </Typography>
                    <Chip label="Réservé" color="primary" />
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            width: '28%',
            position: 'fixed',
            right: '0',
            top: '10%',
            zIndex: 1,
            padding: '20px',
            backgroundColor: '#fff',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '15px' }}>
            Calendrier
          </Typography>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={({ date, view }) =>
              view === 'month' && isReservedDate(date) ? 'reserved-tile' : null
            }
          />
        </Box>
      </Box>

      <Typography variant="h5" sx={{ marginTop: '80px', marginBottom: '20px', fontWeight: 'bold' }}>
        Toutes mes réservations
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {allReservations.map((reservation, index) => (
          <Card key={index} sx={{ boxShadow: 3, borderRadius: 2, padding: '10px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {reservation.space} - {reservation.resource}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ marginBottom: '10px' }}>
                {`Le ${DateTime.fromISO(reservation.date).toLocaleString(DateTime.DATE_FULL)} à ${DateTime.fromISO(reservation.time).toLocaleString(DateTime.TIME_SIMPLE)}`}
              </Typography>
              <Chip label="Réservé" color="primary" />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
}

export default ReservationList;
