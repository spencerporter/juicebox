const express = require("express");

const tagsRouter = express.Router();

const {getAllTags, getPostsByTagName} = require("../db")

tagsRouter.use((request, response, next) => {
    console.log("A request is being made to /tagsRouter");

    next();
})

tagsRouter.get('/', async (request, response, next) => {
    const tags = await getAllTags();
    
    response.send({
        tags
    })
});

tagsRouter.get('/:tagName/posts', async (request, response, next) => {
    const {tagName} = request.params;

    console.log("Tag Request: ", tagName)
    try {
        const allPosts = await getPostsByTagName(tagName);

        const posts = allPosts.filter((post) => {
            return post.active || (req.user && post.author.id === req.user.id);
        });

        response.send({posts: posts});
    }catch({name, message}){
        next({name, message});
    }
});
module.exports = tagsRouter;