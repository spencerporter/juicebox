const express = require("express");

const postsRouter = express.Router();

const { getAllPosts, createPost, getPostByID, updatePost } = require("../db");
const { requireUser } = require("./utils");

postsRouter.use((request, response, next) => {
    console.log("A request is being made to /postsRouter");

    next();
})

postsRouter.get('/', async (request, response, next) => {
    const allPosts = await getAllPosts();
    
    const posts = allPosts.filter((post) => {
        return post.active || (req.user && post.author.id === req.user.id);
    });

    response.send({
        posts
    })
});

postsRouter.post('/', requireUser, async (request, response, next) => {
    const {title, content, tags = ""} = request.body;

    const tagArr = tags.trim().split(/\s+/);
    const postData = {};

    if(tagArr.length){
        postData.tags = tagArr;
    }
    try{
        postData.authorId = request.user.id;
        postData.title = title;
        postData.content = content;
    
        console.log(postData);

        const post = await createPost(postData);
        response.send(post);
    }catch ({name, message}){
        next({name, message})
    }
})

postsRouter.patch('/:postId', requireUser, async (request, response, next) => {
    const { postId } = request.params;
    const { title, content, tags } = request.body;

    const updateFields = {};

    if(tags && tags.length > 0) {
        updateFields.tags = tags.trim().split(/\s+/)
    }

    if(title) {
        updateFields.title = title;
    }

    if(content){
        updateFields.content = content;
    }

    try {
        const originalPost = await getPostByID(postId);

        if (originalPost.author.id === request.user.id) {
            const updatedPost = await updatePost(postId, updateFields);
            response.send({post : updatedPost});
        } else {
            next({
                name: "UnauthorizedUserError", 
                message: "You cannot update a post that you are not the author of"
            }); 
        }
    } catch ({name, message}){
        next({name, message})
    }
});

postsRouter.delete('/:postId', requireUser, async (request, response, next) => {
    const { postId } = request.params;
    
    try{
        const post = await getPostByID(postId)

        if(post && post.author.id === request.user.id){
            const updatedPost = await updatePost(postId , {active: false});

            response.send({ post : updatedPost})
        } else {
            next( post ? {
                    name: "UnauthoriedUserError",
                    message: "You cannot delete posts that you are not the author of"
                } : {
                    name: "PostNotFound",
                    message: `Unable to locate a post with Id: ${postId}`
                }
            );
        }
    } catch ({name, message}) {
        next({name, message});
    }
})

module.exports = postsRouter;