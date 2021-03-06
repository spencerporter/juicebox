require('dotenv').config();

const {PORT = 3000} = process.env;
const express = require("express");
const server = express();

//Logging Function
const morgan = require("morgan");
server.use(morgan('dev'));

server.use(express.json());

const apiRouter = require("./api");
server.use("/api", apiRouter);

const { client } = require('./db');
client.connect();

// Listening Function
server.listen(PORT, () => {
    console.log("Web Server Started on PORT ", PORT);
})