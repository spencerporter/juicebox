const express = require("express");

const usersRouter = express.Router();

const {getAllUsers} = require("../db")

usersRouter.use((request, response, next) => {
    console.log("A request is being made to /users");

    next();
})

usersRouter.get('/', async (request, response, next) => {
    const users = await getAllUsers();
    
    response.send({
        users
    })
});
module.exports = usersRouter;