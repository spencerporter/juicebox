const express = require("express");

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const usersRouter = express.Router();

const {getAllUsers, getUserByUsername, createUser} = require("../db")

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

usersRouter.post('/login', async (request, response, next) => {
    const { username , password } = request.body;
    
    if(!username || !password) {
        next({
            name: 'MissingCredentialsError', 
            message: "Please supply both a username and a password"
        })
    }

    try {
        const user = await getUserByUsername(username);

        if(user && user.password === password){
            const token = jwt.sign(user, JWT_SECRET);
            response.send({message: "you're logged in!", token: token});
        } else {
            next({
                name: 'IncorrectCredentialsError', 
                message: 'Username of Password is incorrect'
            });
        }
    } catch (error) {
        console.error("Error logging in user", error);
        next(error);
    }
});

usersRouter.post('/register', async (request, response, next) => {
    const {username, password, name, location} = request.body;

    try {
        const _user = await getUserByUsername(username);

        if(_user){
            next({
                name: 'UserExistsError', 
                message: 'A user by that username already exists'
            })
        }

        const user = await createUser({
            username,
            password,
            name,
            location
        })

        const token = jwt.sign({
            id: user.id,
            username
        }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        });

        response.send({
            message: "thank you for signing up for our website", 
            token
        })
    } catch ({ name, message }) {
        next({name, message});
    }
});
module.exports = usersRouter;