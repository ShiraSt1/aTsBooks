const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_uri)
    }
    catch (err) {
        console.error("error connection to db" + err)
    }
}
module.exports = connectDB