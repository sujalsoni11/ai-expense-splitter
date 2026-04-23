import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-expense-splitter-g0ff.onrender.com",
  withCredentials: true,
});

export default API;