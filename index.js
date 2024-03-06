const express = require('express');
require('dotenv').config();

const session = require('express-session');
const mongodbSession = require('connect-mongodb-session')(session);

const app = express();
const PORT = process.env.PORT || 8000;
const clc = require("cli-color");
const db = require('./db');
const AuthRouter = require('./Controllers/AuthController');
const BlogRouter = require('./Controllers/BlogController');
const FollowRouter = require('./Controllers/FollowController');
const {isAuth} = require('./Middleware/AuthMiddileware');
const {cleanBin} = require('./cron');
//middlewares
app.use(express.json());
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  store: new mongodbSession({
      uri: process.env.MONGO_URI,
      collection:'sessions'
  })
}));

app.use('/auth',AuthRouter);
app.use('/blog',isAuth,BlogRouter);
app.use('/follow',isAuth,FollowRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(clc.yellowBright(`Server is running`));
    console.log(clc.yellowBright.underline.bold(`http://localhost:${PORT}/`));
    cleanBin();
});