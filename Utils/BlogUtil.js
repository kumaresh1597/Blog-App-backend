
const validateBlogData = ({title,content})=>{
    return new Promise((resolve, reject)=>{
       if(!title){
           return reject('title is required');
       }
       if(!content){
           return reject('content is required');
       }

       if (typeof title !== "string") return reject("Title is not a text");
       if (typeof content !== "string") return reject("Body is not a text");

       resolve();
       
   })
} 

module.exports = {validateBlogData};