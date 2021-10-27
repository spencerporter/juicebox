const express = require("express");

const postsRouter = express.Router();

const {getAllPosts} = require("../db")

postsRouter.use((request, response, next) => {
    console.log("A request is being made to /postsRouter");

    next();
})

postsRouter.get('/', async (request, response, next) => {
    const posts = await getAllPosts();
    
    response.send({
        posts
    })
});
module.exports = postsRouter;