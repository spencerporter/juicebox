const express = require("express");

const tagsRouter = express.Router();

const {getAllTags} = require("../db")

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
module.exports = tagsRouter;