const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        required: true
    },
    path: {
        type: String,
        lowercase: true,
        required: true
     },
    size: {
        type: Number,  // שדה גודל כמספר (בייטים)
        required: true
    },
    title: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Title"
    }
}, { timestamps: true });  // הוספת תאריכים של יצירה ועדכון של הקובץ

module.exports = mongoose.model("File", fileSchema);
