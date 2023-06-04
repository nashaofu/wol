import axios from 'axios';

const fetcher = axios.create({
  baseURL: '/api',
  timeout: 20000,
});

fetcher.interceptors.response.use(
  (data) => data.data,
  (err) => Promise.reject(err),
);

export default fetcher;
