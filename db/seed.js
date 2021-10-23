
const {
    client,
    getAllUsers, 
    createUser, 
    updateUser,
    createPost, 
    updatePost,
    getAllPosts,
    getPostByUserID,
    getUserByID,
    createTags, 
    addTagsToPost, 
    getPostsByTagName
  } = require('./index');

async function dropTables() {
    try {
        console.log("Starting to drop tables...");

        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
        `);

        console.log("Finished dropping tables!");
    } catch (error) {
        console.error("Error dropping tables!");
        throw error;
    }
}
  
async function createTables() {
    try {
        console.log("Starting to build tables...");

        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL,
                name VARCHAR(255) NOT NULL, 
                location VARCHAR(255) NOT NULL, 
                active BOOLEAN DEFAULT true
            );
            CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id),
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true 
            );
            CREATE TABLE tags (
                id SERIAL PRIMARY KEY, 
                name VARCHAR(255) UNIQUE NOT NULL
            );
            CREATE TABLE post_tags (
                "postId" INTEGER REFERENCES posts(id), 
                "tagId" INTEGER REFERENCES tags(id), 
                UNIQUE("postId", "tagId")
            );
        `);

        console.log("Finished building tables!");
    } catch (error) {
        console.error("Error building tables!");
        throw error;
    }
}
  
async function rebuildDB() {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await craeteInitialUsers();
        await createInitialPosts();
    } catch (error) {
        throw error;
    }
}

async function craeteInitialUsers(){
    try {
        console.log("Starting to create users...");

        const albert = await createUser({ username: 'albert', password: 'bertie99', name: "Al Bert", location: "Syndey, Austrailia" });
        const sandra = await createUser({ username: 'sandra', password: '2sandy4me', name: "Just Sandra", location: "Ain't Tellin" });
        const glamgal = await createUser({ username: 'glamgal', password: 'soglam', name: "Joshua", location: "Upper East Side" });

        console.log("Finished creating users!");
    } catch(error) {
        console.error("Error creating users!");
        throw error;
    }
}

async function createInitialPosts(){
    try {
        const [albert, sandra, glamgal] = await getAllUsers();
        console.log("Starting to create posts...");

        const postAlbert = await createPost({authorId: albert.id, 
                                            title: "Albert Post", 
                                            content: "lorem 40", 
                                            tags: ["#happy", "#youcandoanhthing"]})

        const postSandra = await createPost({authorId: sandra.id, 
            title: "Sandra Post", 
            content: "lorem 50",
            tags: ["#happy", "#worst-day-ever"]})

        const postGlamgal = await createPost({authorId: glamgal.id, 
            title: "GlamGal Post", 
            content: "lorem 60",
            tags: ["#happy", "#youcandoanhthing", "#canmandoeverything"]})

        console.log("Finished creating posts!");

    } catch (error) {
        console.error("Error Creating Posts")
        throw error;
    }
}

// async function createInitialTags(){
//     try {
//         console.log("Starting to create tags...");

//         const [happy, sad, inspo, catman] = await createTags([
//           '#happy', 
//           '#worst-day-ever', 
//           '#youcandoanything',
//           '#catmandoeverything'
//         ]);
    
//         const [postOne, postTwo, postThree] = await getAllPosts();
    
//         await addTagsToPost(postOne.id, [happy, inspo]);
//         await addTagsToPost(postTwo.id, [sad, inspo]);
//         await addTagsToPost(postThree.id, [happy, catman, inspo]);
    
//         console.log("Finished creating tags!");
//     } catch (error) {
//         console.error("Error creating tags");
//         throw error;
//     }
// }
  
async function testDB() {
    try {
        console.log("Starting to test database...");

        const users = await getAllUsers();
        console.log("getAllUsers:", users);

        console.log("Calling updateUser on users[0]")
        const updateUserResult = await updateUser(users[0].id, {
          name: "Newname Sogood",
          location: "Lesterville, KY"
        });

        console.log("Result:", updateUserResult);

        const posts = await getAllPosts();
        console.log("getAllPosts:", posts)

        console.log("Calling updatePost on posts[0]")
        const updatePostResult = await updatePost(posts[0].id, {
          title: "NEWWWW TITLE",
          content: "Better Content"
        });

        console.log("Result:", updatePostResult);

        console.log("Getting all of Alberts Posts");
        const albertsPosts = await getPostByUserID(users[0].id);
        console.log("Albert's Posts: ", albertsPosts);

        console.log("Getting full user for Albert (id: 1)");
        const albertUser = await getUserByID(users[0].id)
        console.log("Albert's full user", albertUser)

        console.log("Calling updatePost on posts[1], only updating tags");
        const updatePostTagsResult = await updatePost(posts[1].id, {
          tags: ["#youcandoanything", "#redfish", "#bluefish"]
        });
        console.log("Result:", updatePostTagsResult);

        console.log("Calling getPostsByTagName with #happy");
        const postsWithHappy = await getPostsByTagName("#happy");
        console.log("Result:", postsWithHappy);

        console.log("Finished database tests!");
    } catch (error) {
        console.error("Error testing database!");
        throw error;
    }
}
  
  
  rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());