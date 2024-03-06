const cron = require('node-cron');
const BlogSchema = require('./Schemas/BlogSchema');

const cleanBin = ()=>{
    cron.schedule("* * 0 * * *",async ()=>{
        try{

            const deletedBlogs = await BlogSchema.find({isDeleted : true});

            const deletedBlogsId = [];
            if(deletedBlogs.length > 0){
                deletedBlogs.map((blog)=>{
                    const diff = (Date.now() - blog.deletedDateTime)/1000*60*60*24;
                    if(diff > 30){
                        deletedBlogsId.push(blog._id);
                    }
                });
            } else {

            console.log("No blogs to delete");
            }

            if(deletedBlogsId.length > 0){
                const deleteDb = await BlogSchema.findOneAndDelete({_id : {$in : deletedBlogsId}});
                console.log(deleteDb);
            }

        }catch(err){
            console.log(err);
        }
    })
}

module.exports = {cleanBin};