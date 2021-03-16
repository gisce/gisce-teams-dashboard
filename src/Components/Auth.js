import React, { useContext, createContext, useState } from "react";
import Cookies from 'universal-cookie';
import axios from "axios";

const cookies = new Cookies();


const Auth = {
  isAuthenticated: cookies.get('token') ? true : false,
  token: cookies.get('token'),
  async signin(username, password) {
    let token = Auth.token;
    try {
      if (!Auth.token) {
        const result = await axios.get('http://10.246.0.198:8067/token', {
          auth: { username, password }
        })
        console.log("Login successful", result.data.token);
        let token = result.data.token;
        console.log('Storing token cookie', token);
        cookies.set('token', token, { maxAge: 3600 * 24 });
      }
      Auth.isAuthenticated = true;
      Auth.token = token;
    } catch (exc) {
      Auth.signout();
    }
  },
  signout() {
    Auth.isAuthenticated = false;
    Auth.token = null;
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
    return Auth.signout()
  };

  return {
    token,
    signin,
    signout
  };
}
