import './App.css';
import { Grommet } from "grommet";
import LoginForm from "./Components/Login";
import Logout from "./Components/Logout";
import Dashboard from "./Components/Dashboard";
import Board from "./Components/Board";
import { ProvideAuth } from "./Components/Auth";
import PrivateRoute from "./Components/Route";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <ProvideAuth>
      <Router>
        <Grommet>
          <Switch>
            <Route path="/login">
              <LoginForm />
            </Route>
            <PrivateRoute path="/" exact>
              <Dashboard />
            </PrivateRoute>
            <PrivateRoute path="/dashboard">
              <Dashboard />
            </PrivateRoute>
            <PrivateRoute path="/team/:id">
              <Board/>
            </PrivateRoute>
            <PrivateRoute path="/logout">
              <Logout/>
            </PrivateRoute>
          </Switch>
        </Grommet>
      </Router>
    </ProvideAuth>
  );
}

export default App;
