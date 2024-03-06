const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FollowSchema = new Schema({
    followerUserId :{
        type :  Schema.Types.ObjectId,
        required : true,
        ref : "User"
    },
    followingUserId : {
        type :  Schema.Types.ObjectId,
        required : true,
        ref : "User"
    },
    creationDateTime:{
        type :  Date,
        required : true
    }
})

module.exports = mongoose.model("Follow",FollowSchema);