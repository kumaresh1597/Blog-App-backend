const UserSchema = require('../Schemas/UserSchema');
const bcrypt = require('bcrypt');
const ObjectId = require("mongodb").ObjectId;

const registerUser = ({name,username,email,password})=>{
    return new Promise(async (resolve, reject)=>{

        const hashPassword = await bcrypt.hash(password,parseInt(process.env.SALT));

        const userObj = new UserSchema({
            name : name,
            username : username,
            email : email,
            password : hashPassword
        })

        try{
            const userDb = await userObj.save();
            resolve(userDb);
        } catch(err){
            reject(err);
        }
    })
}

const usernameOrEmailAlreadyExists = ({email,username})=>{
    return new Promise(async (resolve,reject)=>{
        try{

            const userExists = await UserSchema.findOne({
                $or : [{email},{username}]
            })

            if(userExists && userExists.email === email) reject("Email already exists");
            if(userExists && userExists.username === username) reject("Username already exists");

            resolve();

        } catch(err){
            reject(err);
        }
    })
}

const findUserWithLoginId = (loginId)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            
            const userDb = await UserSchema.findOne({
                $or : [{email : loginId},{username:loginId}]
            }).select("+password");

            if (!userDb) reject("User does not exist, please register first");

            resolve(userDb);

        } catch(err){
            reject(err);
        }
    })
}

const verifyUserId = ({userId})=>{
    return new Promise(async (resolve,reject)=>{

        if (!ObjectId.isValid(userId)) reject("Invalid userId");

        try{

            const userDb = await UserSchema.findOne({_id: userId});

            if(!userDb){
                reject("User does not exist");
            }

            resolve(userDb);

        } catch(err){
            reject(err);
        }

    })
}

module.exports = {registerUser,usernameOrEmailAlreadyExists,findUserWithLoginId,verifyUserId};