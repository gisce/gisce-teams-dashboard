import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import _ from "underscore";
import MD5 from "crypto-js/md5";
import { useAuth } from "./Auth";
import { InProgress } from "grommet-icons";
import { graphColors } from "./Dashboard";
import { useParams } from "react-router-dom";
import { Box, Heading, Card, CardHeader, CardFooter, Text, Avatar, Button, Spinner } from "grommet";
import { LinkPrevious, Update } from "grommet-icons";

const STATES_COLORS = {
  draft: "status-unknown",
  open: "status-ok",
  pending: "status-warning",
  cancelled: "status-critical",
  done: "status-disabled"
}


const Gravatar = ({ email }) => {
  return (<Avatar title={email} align="center" flex={false} justify="center" overflow="hidden" round="full" src={`https://www.gravatar.com/avatar/${MD5(email).toString()}?d=identicon`}
  />)
}

const LeterAvatar = ({ user }) => {
  const color = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (let i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  }
  const userColor = color(user.name);
  return (
    <Box align="center" justify="center" border={{ "color": userColor, "style": "solid", "size": "medium", "side": "all" }} gap="xxsmall" pad="xsmall" round="full" background={{ "opacity": "weak", "color": userColor }}>
      <Text color={userColor} size="large" weight="bold" textAlign="center" margin={{ "top": "small", "bottom": "small", "left": "xsmall", "right": "xsmall" }}>
        {user.name.split(" ").filter(word => word.length > 1).slice(0, 3).map(word => word[0].toUpperCase()).join("")}
      </Text>
    </Box>
  )
}

const StateLabel = ({ state }) => (
  <Box align="center" justify="center" border={{ "color": STATES_COLORS[state], "style": "solid", "size": "small" }} round="medium" gap="xxsmall" pad="xsmall">
    <Text color={STATES_COLORS[state]} size="xsmall">
      {state}
    </Text>
  </Box>
);

const Task = ({ task }) => {
  return (
    <Card draggable fill="horizontal">
      <CardHeader align="center" direction="row" flex={false} justify="between" gap="medium" pad="small">
        <Heading level="4">
          {task.name}
        </Heading>
      </CardHeader>
      <CardFooter align="center" direction="row" flex={false} justify="between" gap="small" pad="small">
        <Box align="center" justify="center" fill="horizontal" direction="column" gap="xsmall">
          <StateLabel state={task.state} />
          <Box direction="row" gap="small" align="center">
            <InProgress size="small" />
            <Text size="small">{task.effective_hours || '0'}{task.planned_hours && `/${task.planned_hours}`} h</Text>
          </Box>
        </Box>
        <Box align="end" justify="center" fill="horizontal">
          {task.user_id &&
            <Gravatar email={task.user_id.address_id.email} />
          }
        </Box>
      </CardFooter>
    </Card>
  );
}

const Column = ({ id, name, tasks }) => {
  return (
    <Box key={name} align="center" justify="start" fill="vertical" direction="column" border={{ "color": graphColors[name] }}>
      <Box align="center" justify="start" direction="column" pad="medium" background={{"color": graphColors[name] }} fill="horizontal">
        <Heading>
          {name}
        </Heading>
      </Box>
      <Box align="center" justify="center" direction="column" gap="medium" pad="small" fill="horizontal">
        {tasks.map(task => <Task task={task} />)}
      </Box>
    </Box>
  );
}


const Board = ({ props }) => {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState({});
  const auth = useAuth();
  const history = useHistory();
  const { id } = useParams()

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await axios.get(`http://10.246.0.198:8067/ProjectTeam/${id}?schema=name,task_ids.stage_id.name,task_ids.name,task_ids.user_id.address_id.email,task_ids.effective_hours,task_ids.planned_hours,task_ids.user_id.name,task_ids.partner_id.name,task_ids.state`, {
          headers: {
            Authorization: `token ${auth.token}`
          }
        });
        setProject(result.data)
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

  const groupedTasks = _.groupBy(project.task_ids, t => {
    const stage = t.stage_id ?? { name: "undefined" };
    return stage.name;
  });


  const UsersResume = ({ stage }) => {
    const users = _.groupBy(groupedTasks[stage], t => {
      const user = t.user_id ?? { name: "undefined", email: null };
      return user.name
    });
    return (
      <Box direction="column" align="start" fill="horizontal">
        <Heading color={graphColors[stage]}>{stage} planned Hours</Heading>
        <Box fill="horizontal" direction="row" gap="medium">
          {_.pairs(users).map(item => {
            if (item[0] === "undefined") {
              return null;
            }
            const total_planned_hours = Math.round(item[1].reduce((a, b) => a + b.planned_hours, 0) * 100) / 100
            const total_effective_hours = Math.round(item[1].reduce((a, b) => a + b.effective_hours, 0) * 100) / 100
            return (
              <Box align="center">
                <Gravatar email={item[1][0].user_id.address_id.email} />
                {item[1][0].user_id.name}
                <Text title="Planned hours">P: {total_planned_hours} h</Text>
                <Text title="Effective hours">E: {total_effective_hours} h</Text>
              </Box>
            )
          }
          )}
        </Box>
      </Box>
    )
  }

  const columns = _.pairs(groupedTasks).map(item => <Column name={item[0]} tasks={item[1]} />);
  console.log(columns);

  return (
    <Box fill="vertical" overflow="auto" align="center" flex="grow" pad="medium">
      <Box direction="row" fill="horizontal">
        <Box align="start" pad="medium" fill="horizontal">
          <Button label="Go to teams" primary icon={<LinkPrevious />} onClick={() => history.push('/dashboard')} />
        </Box>
        <Box align="end" pad="medium">
          <Button label="Update" icon={<Update />} primary disabled={loading} onClick={() => setLoading(true)} />
        </Box>
      </Box>
      {loading && <Spinner size="large" />}
      <Box direction="row" fill="horizontal">
        <UsersResume stage="Current IT" />
        <UsersResume stage="Doing" />
      </Box>
      <Box fill="vertical" overflow="auto" align="top" flex="grow" direction="row" pad="large" gap="medium">
        {columns}
      </Box>
    </Box>
  )
}

export default Board;
