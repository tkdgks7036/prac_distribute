const express = require('express');
const app = express();
const port = 3000;

const postsRouter = require('./routes/posts.js');
const commentsRouter = require('./routes/comments.js');
const connect = require('./schemas');
connect();

app.use(express.json());
app.use('/posts', [postsRouter, commentsRouter]);

app.get("/", (req, res) => {
    res.send('Node.js 주특기 Lv.1 과제입니다.');
});

app.listen(port, () => {
    console.log('Node.js 주특기 Lv.1 과제가 오픈되었습니다.');
})