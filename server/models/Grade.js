const mongoose=require("mongoose")


const gradeSchema = new mongoose.Schema({

  
    name:
    {
    type:String,
    enum:['first grade','second grade','third grade','fourth grade','fifth grade','sixth grade','seventh grade','eighth grade'],
    required:true 
    },
    
image: {
        type:String,
        // default:
    }


},{})


module.exports=mongoose.model("Grade",gradeSchema)