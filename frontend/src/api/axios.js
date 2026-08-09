import axios from 'axios';

let rawBaseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Remove trailing slash if present
if (rawBaseURL.endsWith('/')) {
  rawBaseURL = rawBaseURL.slice(0, -1);
}

// Ensure the base URL ends with /api
const baseURL = rawBaseURL.endsWith('/api') ? rawBaseURL : `${rawBaseURL}/api`;

const API = axios.create({
  baseURL
});

// Automatically attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;