# 探索 SSR
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

### 首先从最简单的 ssr 开始
启动一个 express 应用，返回 html 字符串让浏览器解析，这个就是最原始最简单的 ssr 应用。

``` js
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

### 加上路由的 react ssr，同构

### 有状态管理的 react ssr

### 把数据请求放到 server 端，实现真正的 server side render

