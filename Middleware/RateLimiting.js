const AccessSchema = require('../Schemas/AccessSchema');

const rateLimiting = async (req,res,next)=>{

    const sessionId = req.session.id;

    try{

        const accessDb = await AccessSchema.findOne({sessionId: sessionId});

        if(!accessDb){

            const accessObj = new AccessSchema({
                sessionId: sessionId,
                time : Date.now()
            })

            await accessObj.save();
            next();
            return;
        }

        if((Date.now() - accessDb.time) < 1000){
            return res.send({
                status : 429,
                message : "You have been rate limited, Too may request, Try after some time"
            })
        }

        await AccessSchema.findOneAndUpdate({sessionId: sessionId},{time : Date.now()});
        next();

    } catch(err){
        return res.send({
            status : 500,
            message : "Internal server error",
            error : err
        })
    }
}

module.exports = {rateLimiting};