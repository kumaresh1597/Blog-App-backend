const FollowSchema = require('../Schemas/FollowSchema');
const UserSchema = require('../Schemas/UserSchema');
const {LIMIT} = require('../PrivateConstants');


const followUser = ({followerUserId,followingUserId})=>{
    return new Promise(async (resolve,reject)=>{
        try{

            const followExist = await FollowSchema.findOne({followerUserId,followingUserId});

            if(followExist) reject("Already following the user");

            const followObj = new FollowSchema({
                followerUserId,
                followingUserId,
                creationDateTime : Date.now()
            })

            const followDb = await followObj.save();

            resolve(followDb);

        } catch(err){
            reject(err);
        }
    })
}

const getFollowingList = ({userId,SKIP})=>{
    return new Promise(async (resolve,reject)=>{
        try{

            const followingUserList = await FollowSchema.aggregate([
                {
                    $match : {followerUserId : userId}
                },
                {
                    $sort : {creationDateTime : -1}
                },
                {
                    $facet : {
                        data : [{$skip : SKIP},{$limit : LIMIT}]
                    }
                }
            ]);

            const followingUserIds = followingUserList[0].data.map(
                (obj) => obj.followingUserId
              );

              const followingList = await UserSchema.aggregate([
                {
                    $match : {_id : {$in : followingUserIds}}
                }
              ]);

              resolve(followingList.reverse());

        } catch(err){
            reject(err);
        }
    })
}

const getFollowerList = ({userId,SKIP})=>{
    return new Promise(async (resolve,reject)=>{
        try{

            const followerUserList = await FollowSchema.aggregate([
                {
                    $match : {followingUserId : userId}
                },
                {
                    $sort : {creationDateTime : -1}
                },
                {
                    $facet : {
                        data : [{$skip : SKIP},{$limit : LIMIT}]
                    }
                }
            ]);

            const followerUserIds = followerUserList[0].data.map(
                (obj) => obj.followerUserId
              );

              console.log(followerUserIds);

              const followerList = await UserSchema.aggregate([
                {
                    $match : {_id : {$in : followerUserIds}}
                }
              ]);

              resolve(followerList.reverse());

        } catch(err){
            reject(err);
        }
    })
}

const unfollowUser = ({followerUserId,followingUserId})=>{
    return new Promise(async(resolve,reject)=>{
        try{
            const followDb = await FollowSchema.findOneAndDelete({followerUserId,followingUserId});
            resolve(followDb);

        } catch(err){
            reject(err);
        }
    })
}


module.exports = {followUser,getFollowingList,getFollowerList,unfollowUser};

