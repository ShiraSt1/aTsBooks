const Title = require("../models/Title")
const File = require("../models/File")
const { deleteFileFunction } = require('./fileController');

const createNewTitle = async (req, res) => {
    const { name, book } = req.body;

    if (!book || !name) {
        return res.status(400).json({ message: 'Book and name are required' });
    }

    const existTitle = await Title.findOne({ name, book }).exec();
    if (existTitle) {
        return res.status(409).json({ message: 'Title already exists for this book' });
    }

    const title = await Title.create({ name, book });
    if (!title) {
        return res.status(500).json({ message: 'Failed to create title' });
    }

    res.status(201).json({ message: 'Title created successfully', title });
};

const getTitleById = async (req, res) => {
    const { id } = req.params
    const title = await Title.findById(id).populate('book').lean()
    if (!title) {
        return res.status(404).json({ message: 'No title found' })
    }
    res.status(200).json(title);
}

const getTitlesByBook = async (req, res) => {
    const { id } = req.params;  // ה-ID של הספר שנשלח בכתובת
    try {
        if (!id) {
            return res.status(400).json({ message: 'Book ID is required' });
        }
        const titles = await Title.find({ book: id }).populate('book').exec();
        if (!titles?.length) {
            return res.status(400).json({ message: 'No titles found for this book' });
        }
        res.json(titles);  // מחזירים את הכותרות
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const deleteTitle = async (titleId) => {
    const title = await Title.findById(titleId).exec();
    if (!title) throw new Error("Title not found");
  
    const files = await File.find({ title: title._id }).exec();
    if (files?.length > 0) {
      for (let file of files) {
        await deleteFileFunction(file._id); // גם פה, תשנה את deleteFile שיחזיר Promise
      }
    }
  
    const result = await Title.deleteOne({ _id: titleId });
    if (result.deletedCount === 0) throw new Error("Failed to delete title");
  };
  
module.exports = { createNewTitle, getTitlesByBook, getTitleById, deleteTitle }
