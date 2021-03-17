import React from "react";
import { Header, Box, Text, Button } from "grommet";
import { Logout } from "grommet-icons";
import { useAuth } from "./Auth";
import { useHistory } from "react-router-dom";


const AppHeader = () => {

  const auth = useAuth();
  const history = useHistory();

  if (!auth.token) {
    return null;
  }

  return (
    <Header align="center" direction="row" flex={false} justify="between" gap="medium" fill="horizontal" pad="small" background="brand">
      <Box align="center" justify="center" direction="row" gap="small">
        <Box align="center" justify="center" direction="row" gap="xsmall">
          <Text weight="bold" color="text-strong">
            GISCE-TI
          </Text>
          <Text color="text-strong">
            Teams
          </Text>
        </Box>
      </Box>
      <Box align="center" justify="center" direction="row">
        <Button icon={<Logout />} onClick={() => history.push('/logout')}/>
      </Box>
    </Header>
  )
}

export default AppHeader;
