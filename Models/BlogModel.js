const BlogSchema = require('../Schemas/BlogSchema');
const {LIMIT} = require('../PrivateConstants');
const ObjectId = require("mongodb").ObjectId;

const createBlog = ({title,content,userId,creationTime})=>{
    return new Promise(async (resolve,reject)=>{

        const blogObj = new BlogSchema({
            title : title,
            content : content,
            author : userId,
            creationTime : creationTime
        })

        try{

            const blogDb = await blogObj.save();
            resolve(blogDb);

        } catch(err){
            reject(err);
        }
    })
}

const getAllBlogs = ({followingUserIds,SKIP})=>{
    return new Promise(async (resolve,reject)=>{

        try{

            const allBlogs = await BlogSchema.aggregate([
                {
                    $match : {author : {$in : followingUserIds},isDeleted : {$ne : true}}
                },
                {
                    $sort : {creationTime : -1}
                },
                {
                    $facet : {
                        data : [{$skip:SKIP},{$limit : LIMIT}]
                    }
                }
            ]);

            resolve(allBlogs[0].data);

        } catch(err){
            reject(err);
        }
    })
}

const getMyBlogs = ({SKIP,userId})=>{
    return new Promise (async(resolve,reject)=>{
        try{

            const myBlogs = await BlogSchema.aggregate([
                {
                    $match : {author : userId, isDeleted : {$ne : true}}
                },
                {
                    $sort : {creationTime : -1}
                },
                {
                    $facet : {
                        data : [{$skip:SKIP},{$limit : LIMIT}]
                    }
                }
            ]);

            resolve(myBlogs[0].data);

        } catch(err){
            reject(err);
        }
    })
}

const getBlogWithId = ({blogId})=>{

    return new Promise(async(resolve,reject)=>{
        try{
            if (!ObjectId.isValid(blogId)) reject("Invalid blogId format");
            const blogDb = await BlogSchema.findOne({_id:blogId});

            if(!blogDb) reject("Blog not found");

            resolve(blogDb);

        } catch(err){
            reject(err);
        }
    })
}

const updateBlog = ({title,content,blogId})=>{
    return new Promise(async(resolve,reject)=>{
        try{
            const prevBlog = await BlogSchema.findOneAndUpdate({_id:blogId},{title:title, content:content});
            resolve(prevBlog);
        } catch(err){
            reject(err);
        }
    })
}

const deleteBlog = ({blogId})=>{
    return new Promise(async(resolve,reject)=>{
        try{
            const prevBlog = await BlogSchema.findOneAndUpdate({_id:blogId},{isDeleted : true, deletedDateTime : Date.now()});
            resolve(prevBlog);
        }catch(err){
            reject(err);
        }
    })
}

module.exports = {createBlog,getAllBlogs,getMyBlogs,getBlogWithId,updateBlog,deleteBlog};