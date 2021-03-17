import React, { useEffect } from "react";
import { useAuth } from "./Auth";
import { Redirect } from "react-router-dom";


const Logout = (props) => {
  const auth = useAuth();

  useEffect(() => {
    auth.signout();
  });

  return <Redirect to="/login" />;
}

export default Logout;
