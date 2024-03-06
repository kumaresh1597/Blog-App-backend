const express = require('express');
const FollowRouter = express.Router();

const {verifyUserId} = require('../Models/UserModel');
const {followUser,getFollowingList,getFollowerList,unfollowUser} = require('../Models/FollowModel');

FollowRouter.post('/follow-user', async (req,res)=>{

    const followerUserId = req.session.user.userId;
    const {followingUserId} = req.body;

    if(followerUserId.equals(followingUserId)){
        return res.send({
            status: 400,
            message:"Cannot process the request",
          });
    }

    try {
        // Verify the user ID.
        await verifyUserId({ userId : followerUserId });
      } catch (err) {
        return res.send({
          status: 400,
          message:"Follower User id not found",
          error: err
        });
      }

    try {
        // Verify the user ID.
        await verifyUserId({ userId : followingUserId });
      } catch (err) {
        return res.send({
          status: 400,
          message : "Following User id not found",
          error: err
        });
      }

      try{

        const followDb = await followUser({followerUserId,followingUserId});

        return res.send({
            status: 200,
            message : "Follow successfull",
            data : followDb
        })

      } catch(err){
        return res.send({
            status : 500,
            message : "Internal server error",
            error : err
        })
      }   
})

FollowRouter.get('/get-following-list', async (req,res)=>{

    const userId = req.session.user.userId;
    const SKIP = req.query.skip || 0;

    try {
        // Verify the user ID.
        await verifyUserId({ userId});
      } catch (err) {
        return res.send({
          status: 400,
          message:"Follower User id not found",
          error: err
        });
      }

      try{

        const followingList = await getFollowingList({userId,SKIP});

        if(followingList.length == 0){
            return res.send({
                status : 200,
                message : "0 following",
            })
        }

        return res.send({
            status : 200,
            message : "Read successfull",
            data : followingList
        })

      } catch(err){
        return res.send({
            status : 500,
            message : "Internal server error",
            error : err
        })
      }
})

FollowRouter.get('/get-follower-list', async (req,res)=>{

    const userId = req.session.user.userId;
    const SKIP = req.query.skip || 0;

    try {
        // Verify the user ID.
        await verifyUserId({ userId});
      } catch (err) {
        return res.send({
          status: 400,
          message:"Follower User id not found",
          error: err
        });
      }

      try{

        const followerList = await getFollowerList({userId,SKIP});

        if(followerList.length == 0){
            return res.send({
                status : 200,
                message : "No followers",
            })
        }

        return res.send({
            status : 200,
            message : "Read successfull",
            data : followerList
        })

      } catch(err){
        return res.send({
            status : 500,
            message : "Internal server error",
            error : err
        })
      }

})

FollowRouter.post('/unfollow-user', async (req,res)=>{

    const followerUserId = req.session.user.userId;
    const {followingUserId} = req.body;

    if(followerUserId.equals(followingUserId)){
        return res.send({
            status: 400,
            message:"Cannot process the request",
          });
    }

    try {
        // Verify the user ID.
        await verifyUserId({ userId : followerUserId });
      } catch (err) {
        return res.send({
          status: 400,
          message:"Follower User id not found",
          error: err
        });
      }

    try {
        // Verify the user ID.
        await verifyUserId({ userId : followingUserId });
      } catch (err) {
        return res.send({
          status: 400,
          message : "Following User id not found",
          error: err
        });
      }

      try{

        const followDb = await unfollowUser({followerUserId,followingUserId});
        return res.send({
            status : 200,
            message : "Unfollow successfull",
            data : followDb
        })

      } catch(err){
        return res.send({
            status : 500,
            message : "Internal server error",
            error : err
        })
      }

})


module.exports = FollowRouter;