import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://didactic-space-xylophone-pvgvj7wvj45fxxx-5000.app.github.dev/api',
});

export default instance;
