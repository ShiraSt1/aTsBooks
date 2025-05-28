const { kMaxLength } = require("buffer")
const mongoose = require("mongoose");

const titleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Book', 'Exams', 'Exercises', 'Disk','Videos', 'Other'], 
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Book"
    }
}, {
    timestamps: true
});

titleSchema.index({ name: 1, book: 1 }, { unique: true }); // מניעת כפילויות על בסיס שם וספר

module.exports = mongoose.model("Title", titleSchema);
