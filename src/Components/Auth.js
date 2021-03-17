import React, { useContext, createContext, useState } from "react";
import Cookies from 'universal-cookie';
import ApiClient from "../Services/ApiClient";

const cookies = new Cookies();


export const Auth = {
  isAuthenticated: cookies.get('token') ? true : false,
  token: cookies.get('token'),
  async signin(username, password) {
    try {
      if (!Auth.token) {
        const result = await ApiClient.get('/token', {
          auth: { username, password }
        });
        console.log("Login successful", result.data.token);
        let token = result.data.token;
        console.log('Storing token cookie', token);
        cookies.set('token', token, { maxAge: 3600 });
        Auth.isAuthenticated = true;
        Auth.token = token;
      }
    } catch (exc) {
      Auth.signout();
    }
  },
  signout() {
    console.log('Signing out...');
    Auth.isAuthenticated = false;
    Auth.token = null;
    cookies.remove('token');
  }
};


const authContext = createContext();


export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  );
}


export function useAuth() {
  return useContext(authContext);
}


function useProvideAuth() {
  const [token, setToken] = useState(cookies.get('token'));

  const signin = async (username, password) => {
    await Auth.signin(username, password);
    setToken(Auth.token);
  };

  const signout = () => {
    Auth.signout();
    setToken(Auth.token);
  };

  return {
    token,
    signin,
    signout
  };
}
