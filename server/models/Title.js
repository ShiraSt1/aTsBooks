const { kMaxLength } = require("buffer")
const mongoose = require("mongoose");

const titleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        // enum: ['Book', 'Exams', 'Exercises', 'Disk','Videos', 'Other'], 
        enum: ['Books', 'Exams', 'Flash Cards', 'CD','Videos', 'Others'], 
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Book"
    }
}, {
    timestamps: true
});

titleSchema.index({ name: 1, book: 1 }, { unique: true }); 

module.exports = mongoose.model("Title", titleSchema);
