const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');

const postsRouter = require('./routes/posts.js');
const commentsRouter = require('./routes/comments.js');
const signupRouter = require('./routes/signup.js');
const loginRouter = require('./routes/login.js');

const connect = require('./schemas/index.js');
connect();

const dotenv = require('dotenv');
dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use('/posts', [postsRouter, commentsRouter]);
app.use('/', [signupRouter, loginRouter]);

app.get("/", (req, res) => {
    res.send('Node.js 주특기 Lv.2 과제입니다.');
});

app.listen(process.env.PORT_NUMBER, () => {
    console.log('Node.js 주특기 Lv.2 과제가 오픈되었습니다.');
});