import axios from "axios";
import { Auth } from "../Components/Auth";

const ApiClient = axios.create({
  baseURL: process.env.REACT_APP_API_ENDPOINT
});

ApiClient.interceptors.request.use((request) => {
  if (Auth.token) {
    console.log('Intercepting request... setting token to', Auth.token);
    request.headers['Authorization'] = `token ${Auth.token}`;
  }
  return request;
});

ApiClient.interceptors.response.use((response) => {
  return response;
});

export default ApiClient;
