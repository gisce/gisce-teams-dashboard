import React, { useContext, createContext, useState } from "react";
import axios from "axios";


const Auth = {
  isAuthenticated: false,
  token: null,
  async signin(username, password) {
    try {
      const result = await axios.get('http://10.246.0.198:8067/token', {
        auth: { username, password }
      })
      console.log("Login successful", result.data.token);
      Auth.isAuthenticated = true;
      Auth.token = result.data.token;
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
  const [token, setToken] = useState(null);

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
