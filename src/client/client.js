import React from "react";
import ReactDOM from "react-dom";
import RouteList from "./Routes";
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { Provider } from 'react-redux';
import store from './store';

const App = () => {
    let routes = useRoutes(RouteList);
    return routes;
  };

ReactDOM.hydrate(
    <Provider store={store}>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </Provider>, 
    document.getElementById("root")
);
