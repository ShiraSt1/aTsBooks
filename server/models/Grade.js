const mongoose=require("mongoose")

const gradeSchema = new mongoose.Schema({
    name:
    {
    type:String,
    enum:['first grade','second grade','third grade','fourth grade','fifth grade','sixth grade','seventh grade','eighth grade','ninth grade','tenth grade','eleventh grade','twelfth grade'],
    required:true 
    },
    image: {
        type:String,
    }
},{})

module.exports=mongoose.model("Grade",gradeSchema)