import express from "express";
import React from "react";
import {useRoutes} from 'react-router-dom';
import { renderToString } from "react-dom/server";
import RouteList from "./client/Routes";
import { StaticRouter as Router } from "react-router-dom/server";
import { Provider } from "react-redux";
import store from "./client/store";

const app = express();
app.use(express.static("public"));

app.get("*", (req, res) => {
  const promises = RouteList.map(route => {
      if (route.path === req.path && route.element.type.getInitialData) {
          
          return route.element.type.getInitialData(store)
      }
  }).filter(Boolean);
  const App = () => {
    let routes = useRoutes(RouteList);
    return routes;
  };
  Promise.all(promises).then(() => {
    const content = renderToString(
      <Provider store={store}>
        <Router location={req.path}><App/></Router>
      </Provider>
    );

    res.send(`<html>
                <head></head>
                <body>
                    <div id="root">${content}</div>
                    <script src="bundle.js"></script>
                </body>
            </html>`);
  });
});

app.listen(3001, () => console.log("listen on 3001"));
