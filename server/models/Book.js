const { kMaxLength } = require("buffer")
const mongoose = require("mongoose")

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: [20, 'Name cannot exceed 100 characters'] // הגבלת אורך ל-100 תווים
    },
    grades: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grade' // שם המודל של הכיתות
    }],
    image: {
        type: String,
        required: true
    },
    valid:{
        type: Boolean,
        default: true, 
        required: true 
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Book", bookSchema)