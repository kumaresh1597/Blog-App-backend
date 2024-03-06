const express = require('express');
const BlogRouter = express.Router();

const {validateBlogData} = require('../Utils/BlogUtil');
const {verifyUserId} = require('../Models/UserModel');
const {createBlog,getAllBlogs,getMyBlogs,getBlogWithId,updateBlog,deleteBlog} = require('../Models/BlogModel');
const {rateLimiting} = require('../Middleware/RateLimiting');
const {getFollowingList} = require('../Models/FollowModel');

BlogRouter.post('/create-blog',rateLimiting, async (req, res)=>{

  const { title, content } = req.body;
  const userId = req.session.user.userId;
  const creationTime = Date.now();

    try {
        // Validate the blog data.
        await validateBlogData({ title, content });

    } catch (err) {
        return res.send({
        status: 400,
        message: "Blog data error",
        error: err
        });
    }

    try {
        // Verify the user ID.
        await verifyUserId({ userId });

    } catch (err) {
        return res.send({
        status: 400,
        error: err
        });
    }

    try {
        // Create the blog.
        const blogDb = await createBlog({
        title,
        content,
        userId,
        creationTime
        });

        return res.send({
        status: 201,
        message: "Blog created successfully",
        data: blogDb
        });

    } catch (err) {
        return res.send({
        status: 500,
        message: "Internal server error",
        error: err
        });
    }

})

BlogRouter.get('/get-blogs',async (req,res)=>{
    const SKIP = parseInt(req.query.skip) || 0;
    const userId = req.session.user.userId;

    try{

        const followingList = await getFollowingList({userId,SKIP:0});
        const followingUserIds = followingList.map((user)=>{
            return user._id;
        })

        const allBlogs = await getAllBlogs({followingUserIds,SKIP});

        if (allBlogs.length === 0) {
            return res.send({
              status: 400,
              message: "No more Blogs",
            });
          }

        return res.send({
            status : 200,
            message: "Read successfull",
            data : allBlogs
        })

    } catch(err){
        return res.send({
            status: 500,
            message: "Internal server error",
            error : err
        })
    }
})

BlogRouter.get('/get-myblogs',async(req,res)=>{
    const SKIP = parseInt(req.query.skip) || 0;
    const userId = req.session.user.userId;

    try{

        const myBlogs = await getMyBlogs({SKIP,userId});

        if (myBlogs.length === 0) {
            return res.send({
              status: 400,
              message: "No more Blogs",
            });
          }

        return res.send({
            status : 200,
            message: "Read successfull",
            data : myBlogs
        })

    } catch(err){
        return res.send({
            status: 500,
            message: "Internal server error",
            error : err
        })
    }
})

BlogRouter.post('/edit-blog',rateLimiting,async (req,res)=>{

    const { title, content } = req.body.data;
    const blogId = req.body.blogId;
    const userId = req.session.user.userId;


    try{

        await validateBlogData({title,content});

    } catch(err){
        return res.send({
            status : 400,
            message : "Blog data error",
            error : err
        })
    }

    try{

        const userDb = await verifyUserId({userId});

    } catch(err){
        return res.send({
            status : 400,
            error : err
        })
    }

    try{

        const blogDb = await getBlogWithId({blogId});
        
        if(!(userId.equals(blogDb.author))){
            return res.send({
                status: 403,
                message : 'User not authoirized to edit this blog',
            })
        }

        const timeDiff = (Date.now() - blogDb.creationTime) / (1000*60);

        if(timeDiff > 30){
            return res.send({
                status: 403,
                message : 'User not allowed to edit this blog after 30 mins',
            })
        }

        const prevBlog = await updateBlog({title,content,blogId});

        return res.send({
            status : 200,
            message : "Blog updated successfully",
            data : prevBlog
        })

    } catch(err){
        return res.send({
            status:500,
            message: "Internal server error",
            erroe: err
        })

    }
})

BlogRouter.post('/delete-blog',rateLimiting,async(req,res)=>{
    const {blogId} = req.body;
    const userId = req.session.user.userId;

    if(!blogId) {
        return res.send({
            status : 400,
            message : "Id not found"
        })
    }

    try{

        const userDb = await verifyUserId({userId});

    } catch(err){
        return res.send({
            status : 400,
            error : err
        })
    }

    try{

        const blogDb = await getBlogWithId({blogId});
        
        if(!(userId.equals(blogDb.author))){
            return res.send({
                status: 403,
                message : 'User not authoirized to delete this blog',
            })
        }

        const prevBlog = await deleteBlog({blogId});

        return res.send({
            status : 200,
            message : "Blog deleted successfully",
            data : prevBlog
        })

    }catch(err){
        return res.send({
            status : 500,
            message : "Internal server error",
            error : err
        })
    }
})


module.exports = BlogRouter;