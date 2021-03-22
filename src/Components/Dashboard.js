import React, { useState, useEffect } from "react";
import ApiClient from "../Services/ApiClient";
import _ from "lodash";
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
  "undefined": "accent-4",
  "Archive": "graph-4"
}


const TeamCard = ({ id, name, members }) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const fetch = async () => {
      const result = await ApiClient.get(`/ProjectTask?filter=[('team_id','=',${id}),('stage_id.name','!=','Archive')]&schema=stage_id.name&limit=1000`);
      setTasks(result.data.items);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const groupedTasks = _.groupBy(tasks, t => {
    const stage = t.stage_id ?? { name: "undefined" };
    return stage.name;
  })
  const meterValues = _.entries(groupedTasks).map(i => { return { label: i[0], value: i[1].length, color: graphColors[i[0]] } });

  return (
    <Card>
      <CardHeader align="center" direction="row" flex={false} justify="center" gap="medium" pad="small" fill="horizontal">
        <Heading textAlign="center" size="small" level="2">
          {name}
        </Heading>
      </CardHeader>
      <CardBody pad="small" justify="start" direction="column" align="center">
      {loading && <Box animation="rotateRight" pad="medium">
          <Update size="xlarge" color="brand"/>
        </Box>
}
{!loading && <>
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
        </>
}
      </CardBody>
      <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad="small">
        <Box align="center" justify="center" direction="column" gap="small">
          <Button label="Go to board" icon={<Columns />} primary onClick={() => history.push(`/team/${id}`)} />
          <Box direction="row" fill="horizontal" gap="small" justify="center">
            <Group />
            <Text>{members.length} members</Text>
          </Box>
        </Box>
      </CardFooter>
    </Card>
  )
}


const Dashboard = ({ props }) => {
  const [teams, setTeams] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await ApiClient.get("/ProjectTeam?schema=name,member_ids");
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

  }, [loading])

  const teamCards = teams.map(team => <TeamCard key={team.id} id={team.id} name={team.name} members={team.member_ids} />);
  return (
    <Box fill="vertical" overflow="auto" align="center" flex="grow" pad="medium">
      <Box align="end" justify="center" fill="horizontal" pad="medium">
        <Button label="Update" icon={<Update />} primary disabled={loading} onClick={() => {
          setTeams([]);
          setLoading(true);
        }} />
      </Box>
      {loading && <Spinner size="large" />}
      <Grid fill="horizontal" columns="small" gap="large" pad="medium">
        {teamCards}
      </Grid>
    </Box>
  )
}

export default Dashboard;
