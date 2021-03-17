import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import MD5 from "crypto-js/md5";
import ApiClient from "../Services/ApiClient";
import { InProgress, Up } from "grommet-icons";
import { graphColors } from "./Dashboard";
import { useParams } from "react-router-dom";
import { Box, Heading, Card, CardHeader, CardFooter, Text, Avatar, Button, Spinner } from "grommet";
import { LinkPrevious, Update } from "grommet-icons";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
  const text = user.name.split(" ").filter(word => word.length > 1).slice(0, 3).map(word => word[0].toUpperCase()).join("");
  return (
    <Box title={user.name} align="center" justify="center" border={{ color: userColor }} background={{ "color": userColor, "opacity": "weak" }} round="full" pad="small" width="xxsmall" height="xxsmall">
      <Text textAlign="center" color={userColor}>
        {text}
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

const Task = ({ task, index }) => {
  return (
    <Draggable draggableId={`task-${task.id}`} index={index}>
      {(provided) =>
        <Card fill="horizontal" ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
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
                <LeterAvatar user={task.user_id} />
              }
            </Box>
          </CardFooter>
        </Card>
      }
    </Draggable>
  );
}

const Column = ({ id, name }) => {
  const columnId = `column-${id}`;
  const params = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log("Rendering column", id, name);
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await ApiClient.get(`/ProjectTask?filter=[('stage_id','=',${id}),('team_id','=',${params.id})]&schema=name,user_id.name,state`);
        setTasks(_.mapKeys(result.data.items, "id"));
      }
      catch (exc) {
        console.log(exc);
      }
      finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [])
  return (
    <Box key={name} align="center" justify="start" fill="vertical" direction="column" border={{ "color": graphColors[name] }} style={{minWidth: 300}}>
      <Box align="center" justify="start" direction="column" pad="medium" background={{ "color": graphColors[name] }} fill="horizontal">
        <Heading level="2">
          {name}
        </Heading>
        {loading && <Box animation="rotateRight">
          <Update />
        </Box>
        }
      </Box>
      <Droppable droppableId={columnId}>
        {(provided) =>
          <Box align="center" justify="center" direction="column" gap="medium" pad="small" fill="horizontal" ref={provided.innerRef} {...provided.droppableProps}>
            {Object.values(tasks).map((task, index) => <Task key={task.id} task={task} index={index} />)}
            {provided.placeholder}
          </Box>
        }
      </Droppable>
    </Box>
  );
}


const Board = ({ props }) => {
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState({});
  const history = useHistory();
  const { id } = useParams()

  const onDragEnd = (result) => {
    const {draggableId, source, destination} = result;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await ApiClient.get("/ProjectTaskStage");
        setColumns(Object.assign(_.mapKeys(result.data.items, "id")));
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

  const columnsRender = Object.values(columns).map((col, index) => {
    console.log('Render columns');
    return (<Column key={col.id} id={col.id} name={col.name} />);
  });

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
      {!loading && <>
        <DragDropContext onDragEnd={onDragEnd}>
          <Box fill="vertical" overflow="auto" flex="grow" direction="row" pad="large" gap="medium">
            {columnsRender}
          </Box>
        </DragDropContext>
      </>}
    </Box>
  )
}

export default Board;
