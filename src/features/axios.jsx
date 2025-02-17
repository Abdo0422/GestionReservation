import axios from "axios";

const instance = axios.create({
  baseURL: "https://gestionreservation.onrender.com/api",
});

export default instance;
