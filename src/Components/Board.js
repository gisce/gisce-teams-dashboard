import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import moment from "moment";
import ApiClient from "../Services/ApiClient";
import { useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Button,
  Spinner,
  Layer
} from "grommet";
import { Close, LinkPrevious, Update, InProgress} from "grommet-icons";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ColorContext } from '../Contexts/ColorContext';


const STATES_COLORS = {
  draft: "status-unknown",
  open: "status-ok",
  pending: "status-warning",
  cancelled: "status-critical",
  done: "status-disabled"
}

const UsersResume = ({ stage, tasks }) => {
  const graphColors = useContext(ColorContext);
  const users = _.groupBy(tasks, t => {
    const user = t.user_id ?? { name: "undefined", email: null };
    return user.name
  });
  return (
    <Box direction="column" align="start" fill="horizontal">
      <Heading level="3" color={graphColors[stage]}>{stage} planned Hours</Heading>
      <Box fill="horizontal" direction="row" gap="small">
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
  const [isModalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const taskDateDeadline = task.date_deadline
    ? task.date_deadline.split(' ')[0] + ` (${moment(task.date_deadline, "YYYY-MM-DD HH:mm:SS").fromNow()})`
    : 'No Deadline';

  const partner = task.partner_id ? task.partner_id.name : (task.project_id ? (task.project_id.partner_id ? task.project_id.partner_id.name : '') : '');

  return (
    <>
      <Draggable draggableId={`task-${task.id}`} index={index}>
        {(provided) => (
          <Card
            fill="horizontal"
            pad="xsmall"
            gap="xxsmall"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <CardHeader
              align="left"
              direction="column"
              flex={false}
              fill="horizontal"
              gap="xxsmall"
              pad="xsmall"
            >
              <Box align="center" justify="between" direction="row">
                <Box align="left" size="small">
                  <strong>{task.id}</strong>
                </Box>
                <Box align="center" justify="between" direction="row" gap="small">
                  <Button size="small" label="Details" onClick={handleOpenModal}/>
                  <Button size="small" as="a" label="Go to ERP" target="_blank" href={`http://10.246.0.198:80/form/view?model=project.task&id=${task.id}`}/>
                </Box>
              </Box>
              <Heading level="4" gap="xxsmall" pad="xsmall">
                {task.name}
              </Heading>
            </CardHeader>
            <CardBody gap="xsmall" pad="xsmall">
              <Box align="center" justify="between" direction="row">
                <Box align="left" size="small">
                  {task.date_deadline && (
                    <Text size="small">
                      Limit: {taskDateDeadline}
                    </Text>
                  )}
                </Box>
                <Box align="right" size="small">
                  {task.user_id && <LeterAvatar user={task.user_id} />}
                </Box>
              </Box>
            </CardBody>
            <CardFooter gap="xsmall" pad="xsmall">
              <StateLabel state={task.state} />
              <Box align="center" justify="between" direction="row">
                <Text size="small" align="center">{partner}</Text>
              </Box>
                <InProgress size="small" align="right"/>
            </CardFooter>
          </Card>
        )}
      </Draggable>

      {isModalVisible && (
        <Layer
          onEsc={handleCloseModal}
          onClickOutside={handleCloseModal}
          margin="medium"
          position="center"
          modal
        >
          <Box pad="medium" width="medium" gap="small">
            <Box direction="row" justify="between" align="center">
              <Heading level="3">Task Details</Heading>
              <Button icon={<Close />} onClick={handleCloseModal} />
            </Box>
            <Text size="medium"><strong>Id:</strong> {task.id}</Text>
            <Text size="medium"><strong>Name:</strong> {task.name}</Text>
            <Text size="medium"><strong>Deadline:</strong> {taskDateDeadline}</Text>
            <Text size="medium"><strong>Partner:</strong> {partner}</Text>
            <Text size="medium"><strong>Status:</strong> {task.state}</Text>
            <Text size="medium"><strong>Created:</strong> {task.date_start.split(' ')[0]}</Text>
            <Text size="medium"><strong>Effective Hours:</strong> {task.effective_hours || '0'}</Text>
            <Text size="medium"><strong>Planned Hours:</strong>
                    {task.effective_hours || '0'}{task.planned_hours && `/${task.planned_hours}`} h
                  </Text>
          </Box>
        </Layer>
      )}
    </>
  );
};

const Column = ({ id, name, tasks = [], loading = false }) => {
  const graphColors = useContext(ColorContext);
  const columnColor = graphColors[name] || 'lightgray';// Fallback to a default color if name is not in graphColors
  const columnId = `column-${id}`;
  return (
    <Box
      key={name}
      align="center"
      justify="start"
      fill="vertical"
      direction="column"
      border={{ color: columnColor }}
      style={{ minWidth: 350 , minHeight: '100%', maxHeight: 'calc(100vh - 400px)'}}
    >
      <Box
        align="center"
        justify="start"
        direction="column"
        gap="xxsmall"
        pad="small"
        background={{ color: columnColor }}
        fill="horizontal"
        style={{ minHeight: '150px' }}
      >
        <Heading level="3">{name}</Heading>
        <Box direction="row" fill="horizontal" gap="small" align="center" justify="center">
          <Text>{tasks.length} tasks</Text>
          <Text>
            {Math.round(tasks.reduce((p, c) => p + c.effective_hours, 0) * 100) / 100} /{' '}
            {Math.round(tasks.reduce((p, c) => p + c.planned_hours, 0) * 100) / 100} h
          </Text>
        </Box>
        {loading && (
          <Box animation="rotateRight">
            <Update />
          </Box>
        )}
      </Box>
      <Droppable droppableId={columnId}>
        {(provided) => (
          <Box
            align="center"
            justify="center"
            direction="column"
            gap="small"
            pad="small"
            fill="horizontal"
            style={
              { overflowY: "scroll",
                display: "inline",
                height: "100%",
                scrollbarWidth: "none"}
            }
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {Object.values(tasks).map((task, index) => (
              <Task key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Box>
  );
};


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
        setTasks(tasks => ({ ...tasks, ...t }));

        const t2 = {};
        t2[col] = false;
        setLoadingTasks(v => ({ ...v, ...t2 }));
      });
    }

    fetch();
  }, [columns, id]);

  // Filtra las columnas que tienen el campo `in_summary` en `true`
  const inSummaryColumns = _.filter(columns, column => column.in_summary);
  const columnsRender = Object.values(columns) // Convert the columns object to an array
    .sort((a, b) => a.sequence - b.sequence) // Sort the array by sequence
    .map((col, index) => {
        return (
            <Column
                key={col.id}
                id={col.id}
                name={col.name}
                tasks={tasks.hasOwnProperty(col.id) ? tasks[col.id] : []}
                loading={loadingTasks[col.id]}
            />
        );
    });


  return (
    <Box fill="vertical" overflow="auto" align="center" flex="grow" pad="medium">
      <Box direction="row" fill="horizontal" gap="xxsmall" pad="xxsmall">
        <Box align="start" gap="xxsmall" pad="xxsmall" fill="horizontal">
          <Button
            label="Go to teams"
            primary
            icon={<LinkPrevious />}
            onClick={() => history.push('/dashboard')}
            size="large"
          />
        </Box>
        <Box align="end" gap="xxsmall" pad="xxsmall">
          <Button
            label="Update"
            icon={<Update />}
            primary
            disabled={loading}
            onClick={() => setLoading(true)}
            size="large"
          />
        </Box>
      </Box>
      {loading && <Spinner size="medium" />}
      {!loading && (
        <>
          {_.keys(inSummaryColumns).length > 0 &&
            <Box fill="horizontal" direction="row" justify="center" gap="xxsmall" pad="xxsmall">
              {Object.values(inSummaryColumns).map(col => (
                <UsersResume
                  key={col.id}
                  stage={col.name}
                  tasks={tasks[col.id]}
                />
              ))}
            </Box>
          }
          <DragDropContext onDragEnd={onDragEnd}>
            <Box
                fill="vertical"
                overflow="auto"
                flex="grow"
                direction="row"
                pad="medium"
                gap="medium"
            >
              {columnsRender}
            </Box>
          </DragDropContext>
        </>
      )}
    </Box>
  )
}

export default Board;
