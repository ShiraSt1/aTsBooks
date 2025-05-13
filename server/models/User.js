const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true
    },
    password:
    {
        type: String,
        required: true,
    },
    email:
    {
        type: String,
        required: true,
        lowercase: true,
        trime: true,
        unique: true
    },
    phone: {
        type: String,
        maxLength: 10
    },
    roles: {
        type: String,
        enum: ["User", "Admin"],
        defult: "User"
    },
    confirm: {
        type: Boolean,
        defult: false
    }
}, {
timestamps:true
})

module.exports = mongoose.model("User", userSchema)