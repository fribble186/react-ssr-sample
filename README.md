# 一篇文章彻底搞清 react ssr
## 渲染这件事可以放哪里

### 什么是渲染
字面意思其实就是把元素画出来的过程。

画出来的结果就是一“张” html 文件。

现在的前端不再只是一张 html，如果你打开一个用 react 页面的源代码，你会发现 body 中只有一句

`<div id="root"></div>`

很明显就这一句是不可能显示那么多内容，网页中的内容都是 react 挂载到这个 dom 节点中，在这个节点中进行动态的增删 html 元素节点才能显示出来的。而这个过程就是渲染。

那在哪里做渲染，他们之间的区别又有哪些呢？

### 有三种不同的渲染时机：

1. 客户端渲染(Client-Side-Render)
2. 服务端渲染(Server-Side-Render)
3. 预渲染(Pre-Render) 或 SSG(Static-Site-Generation) 

客户端渲染

| 渲染时机 | 白屏时间 | SEO 友好 | 可不可以显示动态内容 | 需要服务器支持 | 部署难度 |
| ------- | -------- | --------| ------------------ | ------------- | -------- |
| CSR     |    长    |  不友好  |        可以        |     不需要     |   简单   |
| SSR     |    短    |  友好    |        可以        |      需要     |    难    |
| PR      |    短    |  友好    |       不可以       |     不需要     |   中等   |

## 自己实现server side render
参考文章

https://medium.com/%E6%89%8B%E5%AF%AB%E7%AD%86%E8%A8%98/server-side-rendering-ssr-in-reactjs-part1-d2a11890abfc

https://medium.com/%E6%89%8B%E5%AF%AB%E7%AD%86%E8%A8%98/server-side-rendering-ssr-in-reactjs-part2-179ed654457e

https://medium.com/%E6%89%8B%E5%AF%AB%E7%AD%86%E8%A8%98/server-side-rendering-ssr-in-reactjs-part3-7f2097963754

https://medium.com/%E6%89%8B%E5%AF%AB%E7%AD%86%E8%A8%98/server-side-rendering-ssr-in-reactjs-part4-38649606d384

https://zhuanlan.zhihu.com/p/157214413 (比较老的实现，可以不看)


这里把 webpack 和 babel 配置都略了，具体可以看[源码](https://github.com/fribble186/react-ssr-sample)

前面的链接中的代码涉及 router 的地方还是 router v5 的实现，本篇使用了 router v6 重新实现了一遍

其它代码几乎是一样的，强烈看一遍前面的

### 首先从最简单的 ssr 开始
启动一个 express 应用，返回 html 字符串让浏览器解析，这个就是最原始最简单的 ssr 应用。

``` js
// server.js
import express from "express";

const app = express();
app.get('/', (req, res) => {
    res.send(`<html>
        <head></head>
        <body>
            <div id="root">server side render</div>
        </body>
    </html>`)
});

app.listen(3001, () => console.log("listen on 3001"));
```

### 最简单的 react ssr
新建一个 react 应用，通过 react 官方提供的 `renderToString` 方法将 react 组件进行渲染
``` js
// client/component/Home.js
import React from 'react';

const Home = () => {
    return (
        <div>
            <div>Home</div>
            <button onClick={() => console.log("on click")}>click me</button>
        </div>
    );
};

export default Home;
```
``` js
// server.js
import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Home from './client/component/Home.js'

const app = express();

app.get('/', (req, res) => {
    const content = renderToString(<Home/>);
    res.send(`<html>
        <head></head>
        <body>
            <div id="root">${content}</div>
        </body>
    </html>`);
});

app.listen(3001, () => console.log("listen on 3001"));
```

显示都 ok，但发现一个大问题，button 点击了但没反应！！！

原因在于 react 的事件绑定需要 document 对象，但在 node 环境下没有 document 和 window 对象，那事件绑定怎么办呢？

这时候就需要`同构`，`renderToString` 出来的 react 组件只有 dom 节点，这时候就需要使用 `hydrate` 进行`注水`操作

将 react client 项目打包的 js，在 server 返回的 html 代码进行引用，流程变成：

浏览器请求 HTML => server 返回 HTML => 浏览器解析 html，显示 dom => 浏览器请求 js => 浏览器执行 js，react 进行注水操作，将事件绑定到已有的 dom 节点

``` js
// client.js
import React from 'react';
import ReactDOM from 'react-dom';
import Home from './component/Home.js'

React.hydrate(<Home/>, document.getElementById("root"));
```
``` js
// server.js
...
// 设置静态资源文件夹
app.use(express.static("public"));
app.get('/', (req, res) => {
        const content = renderToString(<Home/>);
    res.send(`<html>
        <head></head>
        <body>
            <div id="root">${content}</div>
            <script src="bundle.js"></script>
        </body>
    </html>`);
})
...
```
server 和 client 重新构建一下，发现事件已经绑定上去了。

### 加上路由的 react ssr，同构
上面已经实现了最基本的 react ssr，但是这还不够，因为一般 react 应用都是有路由的

如果只实现了一个路由的 ssr，其它路由 path 通过 nginx 代理，使用体验就很割裂。

而且 ssr 一般都是为了首屏加载优化，之后的路由应该还是走 spa 那一套，即`同构`，那如何让 node 获得当前 path 的 component 并 `renderToString` 呢？

说起路由，path 能想到只有 `react-router-dom` 但 `BroserRouter` 使用了 HTML5 的 history API 这是 node 环境没有的，所以这时候就需要 `StaticRouter`了。

注意 react router v6 的一些变化，没有 `Switch` 组件了，变成了 `Routes` 组件；`StaticRouter` 不是从 `react-router-dom` 导入了，而要从 `react-dom/server` 导入

```js
// client/component/UserList.js
import React from 'react';
import { Link } from 'react-router-dom';
const UserList = () => {
    return (
        <div>
            <div>this is list</div>
            <Link to="/">go to Home</Link>
        </div>
    );
}

export default UserList; 
```

```js
// client/component/Home.js
...
return (
     <div>
         <div>Homepage</div>
         <Link to="/list">go to list</Link>
         <button onClick={() => console.log('click')}>click me</button>
     </div>
);
...
```

```js
// client/Routes.js
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
```

```js
// client/client.js
// 这里用 useRoutes 来替代 react-router-config 来渲染静态路由 list
// 这里要用静态路由主要为之后 load data 做准备，这一步也可以用 Routes Route 直接组成路由
import React from "react";
import ReactDOM from "react-dom";
import RouteList from "./Routes";
import { BrowserRouter, useRoutes } from 'react-router-dom'

const App = () => {
    let routes = useRoutes(RouteList);
    return routes;
  };

ReactDOM.hydrate(
     <BrowserRouter>
         <App/>
     </BrowserRouter>
    document.getElementById("root")
);
```

```js
// server.js
...
import {useRoutes} from 'react-router-dom';
import RouteList from "./client/Routes";
import { StaticRouter as Router } from "react-router-dom/server";
...
app.get('/', (req, res) => {
    const App = () => {
        let routes = useRoutes(RouteList);
        return routes;
    };
    const content = renderToString(
        <Router location={req.path}><App/></Router>
    );

    res.send(`<html>
                <head></head>
                <body>
                    <div id="root">${content}</div>
                    <script src="bundle.js"></script>
                </body>
            </html>`);
})
...
```

### 有状态管理的 react ssr
一个完整的应用大多离不开状态管理，而且首页也经常会有网络请求的发生，如何在 ssr 中进行状态管理并进行网络请求，最后把数据渲染成 dom

```js
// client/store/users/users.actions.js
import axios from 'axios';

export const FETCH_USERS = 'FETCH_USERS'

export const fetchUsers = () => async (dispatch) => {
    const res = await axios.get('https://reqres.in/api/users?page=2');
    dispatch({
        type: FETCH_USERS,
        payload: res.data.data,
    });
}
```

```js
// client/store/users/users.reducer.js
import { FETCH_USERS } from './users.actions.js';

const defaultState = {
    users: []
};

const reducer = (state = defaultState, action) => {
    switch(action.type) {
        case FETCH_USERS:
            return {
                ...state,
                users: action.payload
            }
        default:
            return state;
    }
};

export default reducer;
```

```js
// client/store/index.js
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from './users/users.reducer';

const store = createStore(reducer, applyMiddleware(reducer));

export default store;
```

```js
// client/components/UserList.js
...
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers } from './store/users/users.actions.js';

const UserList = () => {
    const users = useSelector((state) => state.users);
    const dispatch = useDispatch();
    useEffect(() => dispatch(fetchUsers()), []);
    return (
        <div>
            <div>UserList</div>
            <Link to="/">go to Home</Link>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.first_name}</li>
                ))}
            </ul>
        </div>
    );
};
...
```

```js
// client/client.js
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
```

```js
// server.js
...
 const content = renderToString(
   <Provider store={store}>
     <Router location={req.path}><App/></Router>
   </Provider>
 );
...
```

请求页面，发现已经将网络请求的数据渲染到页面上了。

但是！

打开查看网页源代码你会发现，`<li>` 标签都没有！

也就是说网络请求数据渲染页面这个操作是在 client 端也就是浏览器中做的，那显然这不是我们想要的，这样对 SEO 并不友好

而出现这样的情况的原因在于，`renderToString` 时 react 大部分功能都不执行（需要 window 和 document 对象）

在用类的情况下，SSR 模式下，服务端只执行 3 个生命周期函数：`constructor`, `getDerivedStateFromProps`, `render`

那我们如何返回带有网络请求结果的 DOM 呢，这就需要 nextjs 和 umijs 提供的 `getInitialProps` 类似功能的方法了

### 把数据请求放到 server 端，实现真正的 server side render
其实想渲染网络请求结果的 DOM，只要先去网络请求，把结果塞到 store 里就好了，而 userlist 里的 users 是从 redux store 里拿的

也就是说在 renderToString 之前，调用 reducer 就好了，那怎么做呢？

在 userlist 函数对象上加上 getInitialData 属性，这个属性里面是一个触发 reducer 的函数

然后 server 在渲染之前，还会根据当前 path 去提前调用 getInitialData 属性

这样就能在 renderToString 之前，提前调用了 reducer
```js
// client/component/UserList.js
...
UserList.getInitialData = (store) => {
    return store.dispatch(fetchUsers());
}
...
```

```js
// server.js
...
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
...
```

## 最后
至此，一个比较完整的 react ssr 应用就建成了，其实原理都很简单，没我一开始想象中那样复杂，一步一步来还是挺好理解的。
