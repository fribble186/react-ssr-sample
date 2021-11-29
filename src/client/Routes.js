import React from 'react';
import Home from './components/Home';
import UserList from './components/UserList';

const RouteList = [
    {
        exact: true,
        path: '/',
        element: <Home/>,
    },
    {
        path: '/list',
        element: <UserList/>,
    }
];

export default RouteList;
