import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import moment from "moment";
import ApiClient from "../Services/ApiClient";
import { InProgress } from "grommet-icons";
import { graphColors } from "./Dashboard";
import { useParams } from "react-router-dom";
import { Box, Heading, Card, CardHeader, CardBody, CardFooter, Text, Button, Spinner } from "grommet";
import { LinkPrevious, Update, Calendar } from "grommet-icons";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const STATES_COLORS = {
  draft: "status-unknown",
  open: "status-ok",
  pending: "status-warning",
  cancelled: "status-critical",
  done: "status-disabled"
}

const UsersResume = ({ stage, tasks }) => {
  console.log(tasks);
  const users = _.groupBy(tasks, t => {
    const user = t.user_id ?? { name: "undefined", email: null };
    return user.name
  });
  return (
    <Box direction="column" align="start" fill="horizontal">
      <Heading size="4" color={graphColors[stage]}>{stage} planned Hours</Heading>
      <Box fill="horizontal" direction="row" gap="medium">
        {_.entries(users).map(item => {
          if (item[0] === "undefined") {
            return null;
          }
          const total_planned_hours = item[1].reduce((a, b) => a + b.planned_hours, 0)
          const total_effective_hours = item[1].reduce((a, b) => a + b.effective_hours, 0)
          return (
            <Box align="center">
              <LeterAvatar user={item[1][0].user_id} />
              <Text>P: {total_planned_hours} h</Text>
              <Text>E: {total_effective_hours} h</Text>
            </Box>
          )
        }
        )}
      </Box>
    </Box>
  )
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
  let partner = "";

  if (task.partner_id) {
    partner = task.partner_id.name;
  } else if (task.project_id) {
    partner = task.project_id.partner_id ? task.project_id.partner_id.name : "";
  }
  return (
    <Draggable draggableId={`task-${task.id}`} index={index}>
      {(provided) =>
        <Card fill="horizontal" ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          <CardHeader align="center" direction="column" flex={false} justify="between" gap="xsmall" pad="small" fill="horizontal">
            {task.date_deadline &&
              <Box align="center" justify="center" direction="row" gap="xsmall">
                <Calendar size="small" />
                <Text size="xsmall" textAlign="center">
                  Limit: {task.date_deadline.split(' ')[0]} ({moment(task.date_deadline, "YYYY-MM-DD HH:mm:SS").fromNow()})
                </Text>
              </Box>
            }
            <Heading level="4">
              {task.name}
            </Heading>
            <Button size="small" as="a" label="View in ERP" target="_blank" href={`http://10.246.0.198:8000/form/view?model=project.task&id=${task.id}`} />
            <Text size="xsmall">{partner}</Text>
          </CardHeader>
          <CardBody>
          <Text size="xsmall" textAlign="center">
                  Created {task.date_start.split(' ')[0]} ({moment(task.date_start, "YYYY-MM-DD HH:mm:SS").fromNow()})
                </Text>
          </CardBody>
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

const Column = ({ id, name, tasks = [], loading = false }) => {
  const columnId = `column-${id}`;
  return (
    <Box key={name} align="center" justify="start" fill="vertical" direction="column" border={{ "color": graphColors[name] }} style={{ minWidth: 300 }}>
      <Box align="center" justify="start" direction="column" gap="small" pad="medium" background={{ "color": graphColors[name] }} fill="horizontal">
        <Heading level="2">
          {name}
        </Heading>
        <Box direction="row" fill="horizontal" gap="medium" align="center" justify="center">
          <Text>{tasks.length} tasks</Text>
          <Text>{Math.round(tasks.reduce((p, c) => p + c.effective_hours, 0) * 100) / 100} / {Math.round(tasks.reduce((p, c) => p + c.planned_hours, 0) * 100) / 100} h</Text>
        </Box>
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
  const [tasks, setTasks] = useState({});
  const [loadingTasks, setLoadingTasks] = useState({});
  const history = useHistory();
  const { id } = useParams()

  const onDragEnd = async (result) => {
    const { draggableId, source, destination } = result;
    const taskId = parseInt(draggableId.split('-')[1]);
    const stageSourceId = parseInt(source.droppableId.split('-')[1]);
    const stageDestId = parseInt(destination.droppableId.split('-')[1]);
    if (stageDestId === stageSourceId) {
      return;
    }
    const newTasks = { ...tasks };
    newTasks[stageDestId].splice(destination.index, 0, { ...tasks[stageSourceId][source.index] })
    newTasks[stageSourceId].splice(source.index, 1);
    setTasks(newTasks);
    await ApiClient.patch(`/ProjectTask/${taskId}`, { stage_id: stageDestId });
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await ApiClient.get("/ProjectTaskStage");
        setColumns(_.mapKeys(result.data.items, "id"));
        for (let stage of result.data.items) {
          const t = {};
          t[stage.id] = true;
          setLoadingTasks((v) => {
            return { ...v, ...t }
          });
        }
      }
      catch (exc) {
        console.log(exc);
      }
      finally {
        setLoading(false);
      }
    }
    setColumns([]);
    fetchData();
  }, [id, loading])

  useEffect(() => {
    async function fetchTasks(stageId) {
      const result = await ApiClient.get(`/ProjectTask?filter=[('stage_id','=',${stageId}),('team_id','=',${id})]&schema=name,user_id.name,date_start,state,effective_hours,planned_hours,date_deadline,partner_id.name,project_id.name,project_id.partner_id.name&order=date_deadline asc`);
      return result.data.items;
    }

    async function fetch() {
      Object.keys(columns).map(async col => {
        const stageTasks = await fetchTasks(col);
        const t = {}
        t[col] = stageTasks;
        setTasks(tasks => {
          return { ...tasks, ...t }
        });
        const t2 = {};
        t2[col] = false;
        setLoadingTasks((v) => {
          return { ...v, ...t2 }
        });
      });
    }
    fetch();
  }, [columns, id]);

  const columnsRender = Object.values(columns).map((col, index) => {
    return (<Column key={col.id} id={col.id} name={col.name} tasks={tasks.hasOwnProperty(col.id) ? tasks[col.id] : []} loading={loadingTasks[col.id]} />);
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
        {_.keys(columns).length > 0 &&
          <Box fill="horizontal" direction="row" justify="center">
            <UsersResume stage={columns[2].name} tasks={tasks[2]} />
            <UsersResume stage={columns[4].name} tasks={tasks[4]} />
            <UsersResume stage={columns[5].name} tasks={tasks[5]} />
          </Box>
        }
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
