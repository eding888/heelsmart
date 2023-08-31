import React, { useEffect, useState } from 'react';
import '../index.css';
import { Progress, Skeleton, useMediaQuery, Image, Flex, Button, Heading, Box, Modal, useDisclosure, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Tabs, TabList, Tab, TabPanel, TabPanels } from '@chakra-ui/react';
import NavBar2 from '../components/NavBar2';
import { AddIcon, HamburgerIcon } from '@chakra-ui/icons';
import SignupButton from '../components/SignupButton';
import { checkToken } from '../utils/checkToken';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import NewTask from '../components/NewTask';
import ViewTask from '../components/ViewTask';
import StartableTask from '../components/StartableTask';
import { newSession, getTasks, getCurrentUser } from '../utils/routing';
import { TaskInterface } from '../../../../back/src/models/task';
import io from 'socket.io-client';
function Dashboard () {
  const [isNotLoaded, setIsNotLoaded] = useState(true);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [screenCutoff] = useMediaQuery('(min-width: 600px)');
  const [allTasks, setAllTasks] = useState<TaskInterface[][]>([[], [], [], [], [], [], []]);
  const [loaded, setLoaded] = useState(false);
  const date = new Date();
  const today = date.getDay();
  const navigate = useNavigate();

  const sortTasks = async () => {
    const tasks: TaskInterface[] = await getTasks();
    console.log(tasks);
    if (typeof tasks === 'string') {
      return false;
    }
    const taskEachDay: TaskInterface[][] = [[], [], [], [], [], [], []];
    tasks.forEach(task => {
      const days: number[] = task.daysOfWeek;
      days.forEach(day => {
        taskEachDay[day].push(task);
      });
    });
    setAllTasks(taskEachDay);
    setLoaded(true);
  };

  useEffect(() => {
    console.log('hi');
    const checkSession = async () => {
      const res = await newSession();
      if (res !== 'OK') {
        window.localStorage.setItem('logged', 'false');
        navigate('/');
      }
    };

    const fetch = async () => {
      await checkSession();
      await sortTasks();
    };
    fetch();

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }

    setWeekDates(dates);
  }, []);
  useEffect(() => {
    const getCurrentUserId = async () => {
      const res = await getCurrentUser();
      return res.id;
    };
    const socket = io('http://localhost:8081');
    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('subscribeToUser', window.localStorage.getItem('loggedUser'));
    });

    socket.on('taskChange', () => {
      sortTasks();
    });

    socket.on('userChange', () => {
      sortTasks();
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  const handleLoad = () => {
    setIsNotLoaded(false);
  };
  const formatDate = (date: Date) => {
    if (!date) {
      return 'a';
    }
    return `${date.getMonth()}/${date.getDate()}`;
  };
  const renderViewTasks = (day: number) => {
    return allTasks[day].map(task => {
      return (
        <ViewTask task={task}/>
      );
    });
  };
  const renderStartableTasks = (day: number) => {
    return allTasks[day].map(task => {
      return (
        <StartableTask task={task}/>
      );
    });
  };
  console.log(allTasks);
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <NavBar2/>
      <Flex justifyContent='center' alignItems='center' gap = {screenCutoff ? '50px' : '0px'} direction = {screenCutoff ? 'row' : 'column'} mb='3'>
        <Flex justifyContent='center' gap='30px' mb = '5'>
          <Button colorScheme = 'purple' onClick={onOpen}><AddIcon mr ='3'></AddIcon>New Task</Button>
          <Button onClick={onOpen}><HamburgerIcon mr ='3'></HamburgerIcon>View Friends</Button>
        </Flex>
        <Flex justifyContent='center' alignItems='center' direction='column' gap='30px' mb = '5'>
          <Heading fontSize = 'xl' mb ='-3'>Today's Progress:</Heading>
          <Progress w='300px' colorScheme='teal' borderRadius='lg' value={30}></Progress>
      </Flex>
      </Flex>
      <NewTask isOpen={isOpen} onClose= {onClose}></NewTask>
      <Tabs isFitted variant='enclosed' defaultIndex={today}>
        <TabList mb='1em'>
          <Tab fontSize={screenCutoff ? 'm' : 'xs'} fontWeight={today === 0 ? 'bold' : 'normal'}>{screenCutoff ? 'Sunday' : 'Sun'} {formatDate(weekDates[0])}</Tab>
          <Tab fontSize={screenCutoff ? 'm' : 'xs'} fontWeight={today === 2 ? 'bold' : 'normal'}>{screenCutoff ? 'Tuesday' : 'Tue'} {formatDate(weekDates[2])}</Tab>
          <Tab fontSize={screenCutoff ? 'm' : 'xs'} fontWeight={today === 1 ? 'bold' : 'normal'}>{screenCutoff ? 'Monday' : 'Mon'} {formatDate(weekDates[1])}</Tab>
          <Tab fontSize={screenCutoff ? 'm' : 'xs'} fontWeight={today === 3 ? 'bold' : 'normal'}>{screenCutoff ? 'Wednesday' : 'Wed'} {formatDate(weekDates[3])}</Tab>
          <Tab fontSize={screenCutoff ? 'm' : 'xs'} fontWeight={today === 4 ? 'bold' : 'normal'}>{screenCutoff ? 'Thursday' : 'Thu'} {formatDate(weekDates[4])}</Tab>
          <Tab fontSize={screenCutoff ? 'm' : 'xs'} fontWeight={today === 5 ? 'bold' : 'normal'}>{screenCutoff ? 'Friday' : 'Fri'} {formatDate(weekDates[5])}</Tab>
          <Tab fontSize={screenCutoff ? 'm' : 'xs'} fontWeight={today === 6 ? 'bold' : 'normal'}>{screenCutoff ? 'Saturday' : 'Sat'} {formatDate(weekDates[6])}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Skeleton isLoaded={loaded}>
              <Flex gap='30px' flexWrap='wrap' justifyContent='center' w='100%'>
                { today === 0 ? renderStartableTasks(0) : renderViewTasks(0) }
              </Flex>
            </Skeleton>
          </TabPanel>
          <TabPanel>
          <Skeleton isLoaded={loaded}>
              <Flex gap='30px' flexWrap='wrap' justifyContent='center' w='100%'>
                { today === 1 ? renderStartableTasks(1) : renderViewTasks(1) }
              </Flex>
            </Skeleton>
          </TabPanel>
          <TabPanel>
            <Skeleton isLoaded={loaded}>
              <Flex gap='30px' flexWrap='wrap' justifyContent='center' w='100%'>
                { today === 2 ? renderStartableTasks(2) : renderViewTasks(2) }
              </Flex>
            </Skeleton>
          </TabPanel>
          <TabPanel>
            <Skeleton isLoaded={loaded}>
              <Flex gap='30px' flexWrap='wrap' justifyContent='center' w='100%'>
                { today === 3 ? renderStartableTasks(3) : renderViewTasks(3) }
              </Flex>
            </Skeleton>
          </TabPanel>
          <TabPanel>
            <Skeleton isLoaded={loaded}>
              <Flex gap='30px' flexWrap='wrap' justifyContent='center' w='100%'>
                { today === 4 ? renderStartableTasks(4) : renderViewTasks(4) }
              </Flex>
            </Skeleton>
          </TabPanel>
          <TabPanel>
            <Skeleton isLoaded={loaded}>
              <Flex gap='30px' flexWrap='wrap' justifyContent='center' w='100%'>
                { today === 5 ? renderStartableTasks(5) : renderViewTasks(5) }
              </Flex>
            </Skeleton>
          </TabPanel>
          <TabPanel>
            <Skeleton isLoaded={loaded}>
              <Flex gap='30px' flexWrap='wrap' justifyContent='center' w='100%'>
                { today === 6 ? renderStartableTasks(6) : renderViewTasks(6) }
              </Flex>
            </Skeleton>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}

export default Dashboard;
