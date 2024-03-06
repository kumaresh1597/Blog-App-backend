const express = require('express');
const AuthRouter = express.Router();
const bcrypt = require('bcrypt');

const { validateUserRegisterationData } = require("../Utils/AuthUtil");
const {isAuth} = require('../Middleware/AuthMiddileware');
const {registerUser,usernameOrEmailAlreadyExists,findUserWithLoginId} = require('../Models/UserModel');

AuthRouter.post('/register', async (req, res) => {
    const { name, username, email, password } = req.body;

    try{

        await validateUserRegisterationData({name,email,password,username});

    } catch(err){
        return res.send({
            status : 400,
            message : "User data error",
            error : err
        })
    }
    

    try{

        await usernameOrEmailAlreadyExists({email,username});

        const userDb = await registerUser({name,email,password,username});

        return res.send({
            status : 201,
            message : "User created succesfully",
            data : userDb
        })

    } catch(err){
        return res.send({
            status: 500,
            message: "Database error",
            error: err
        })
    }
})

AuthRouter.post('/login', async (req,res)=>{
    const {loginId,password} = req.body;

    if(!loginId || !password){
        return res.send({
            status : 400,
            message : "Missing credentials"
        })
    }

    try{

        const userDb = await findUserWithLoginId(loginId);

        const match = await bcrypt.compare(password,userDb.password);

        if(!match){
            return res.send({
                status : 400,
                message : "Incorrect password, please enter correct password"
            })
        }
       
        req.session.isAuth = true;
        req.session.user = {
            userId : userDb._id,
            username : userDb.username,
            email : userDb.email
        };

        return res.send({
            status : 200,
            message : "User logged in successfully",
            data : userDb
        })

    } catch(err){
        return res.send({
            status : 500,
            message : "Database error",
            error : err
        })
    }
})

AuthRouter.post('/logout',isAuth,async (req,res)=>{

    req.session.destroy((err)=>{
        if(err){
            res.send({
                status : 500,
                message : "Internal server error, logout unsuccessfull",
                error : err
            })
        }

        return res.send({
            status : 200,
            message : "Logout successfull",
        })
    })
})


module.exports = AuthRouter;
