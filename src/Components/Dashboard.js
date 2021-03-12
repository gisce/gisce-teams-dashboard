import React, { useState, useEffect } from "react";
import axios from "axios";
import _ from "underscore";
import { useAuth } from "./Auth";
import { Grommet, Group, Update, Columns } from "grommet-icons";
import { useHistory } from "react-router-dom";
import {
  Box, Grid, Card, CardHeader, Heading, CardBody, Meter,
  Paragraph, CardFooter, Text, Spinner, Button
} from "grommet";


export const graphColors = {
  "Backlog": "graph-0",
  "Catch-and-fire": "status-critical",
  "Current IT": "graph-1",
  "Doing": "graph-2",
  "Done": "graph-3",
  "undefined": "accent-4"
}

const Dashboard = ({ props }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const history = useHistory();

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await axios.get("http://10.246.0.198:8067/ProjectTeam?schema=name,task_ids.stage_id.name,member_ids", {
          headers: {
            Authorization: `token ${auth.token}`
          }
        });
        setTeams(result.data.items);
      }
      catch (exc) {
        console.log(exc);
      }
      finally {
        setLoading(false);
      }
    }
    fetchData();

  }, [loading, auth.token])

  const teamCards = teams.map(team => {
    const groupedTasks = _.groupBy(team.task_ids, t => {
      const stage = t.stage_id ?? { name: "undefined" };
      return stage.name;
    })
    const meterValues = _.pairs(groupedTasks).map(i => { console.log(i); return { label: i[0], value: i[1].length, color: graphColors[i[0]] } });
    return (<Card key={team.id}>
      <CardHeader align="center" direction="row" flex={false} justify="center" gap="medium" pad="small" fill="horizontal">
        <Heading textAlign="center" size="small" level="2">
          {team.name}
        </Heading>
      </CardHeader>
      <CardBody pad="small" justify="start" direction="column" align="center">
        <Meter values={meterValues} type="circle" size="small" thickness="medium" round />
        <Box align="start" justify="center" gap="small" pad="xsmall">
          {meterValues.map(v => (
            <Box align="center" justify="center" direction="row" pad="xsmall" gap="small">
              <Grommet color={graphColors[v.label]} size="medium" />
              <Paragraph fill={false} margin="none">
                {`${v.label}: ${v.value}`}
              </Paragraph>
            </Box>
          )
          )}
        </Box>
      </CardBody>
      <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad="small">
        <Box align="center" justify="center" direction="column" gap="small">
          <Button label="Go to board" icon={<Columns />} primary onClick={() => history.push(`/team/${team.id}`)} />
          <Box direction="row" fill="horizontal" gap="small" justify="center">
            <Group />
            <Text>{team.member_ids.length} members</Text>
          </Box>
        </Box>
      </CardFooter>
    </Card>)
  })
  return (
    <Box fill="vertical" overflow="auto" align="center" flex="grow" pad="medium">
      <Box align="end" justify="center" fill="horizontal" pad="medium">
        <Button label="Update" icon={<Update />} primary disabled={loading} onClick={() => setLoading(true)} />
      </Box>
      {loading && <Spinner size="large" />}
      <Grid fill="horizontal" columns="small" gap="large" pad="medium">
        {teamCards}
      </Grid>
    </Box>
  )
}

export default Dashboard;
