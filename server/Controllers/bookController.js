const Book = require("../models/Book")
const Grade = require("../models/Grade")
const Title = require("../models/Title")
const { deleteTitle } = require('./titleController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const s3 = require('../utils/s3Client');
const BUCKET = process.env.S3_BUCKET_NAME;
const upload = multer({ storage: multer.memoryStorage() });
const NodeCache = require('node-cache');
const myCache = new NodeCache({ stdTTL: 600 });

const createNewBook = async (req, res) => {
    const { name, grades } = req.body;

    if (!name) {
        return res.status(400).send("name is required");
    }

    if (!req.file) {
        return res.status(400).send("image is required");
    }

    const existBook = await Book.findOne({ name }).populate("grades");
    if (existBook) {
        return res.status(402).send("invalid name");
    }

    let image = null;
    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);
    try {
        const key = `bookImages/${Date.now()}_${req.file.originalname}`;
        await s3.upload({
            Bucket: BUCKET,
            Key: key,
            Body: fileStream,
            ContentType: req.file.mimetype
        }).promise();
        await fs.promises.unlink(filePath);

        image = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    } catch (err) {
        console.error("S3 upload error:", err.message);
        return res.status(500).send("Failed to upload image");
    }

    let gradesArr = grades;
    let gradeDocs = [];
    if (typeof gradesArr === "string" && gradesArr !== "[]") {
        try {
            gradesArr = JSON.parse(gradesArr);
            if (!Array.isArray(gradesArr)) {
                return res.status(400).send("grades must be an array");
            }
            gradeDocs = await Promise.all(
                gradesArr.map(grade => Grade.findOne({ name: grade }))
            );
        } catch (error) {
            console.error("Failed to parse gradesArr:", error);
            return res.status(400).send("Invalid grades format");
        }
    }

    const validGrades = gradeDocs.filter(doc => doc);
    const gradeIds = validGrades.map(doc => doc._id);

    const book = await Book.create({ name, grades: gradeIds, image });
    if (!book) {
        return res.status(400).send("invalid book");
    }

    try {
        const titles = ['Books', 'Exams', 'Flash Cards', 'CD', 'Videos', 'Others']
        await Promise.all(
            titles.map(title => Title.create({ name: title, book: book._id }))
        );
        res.json(book);
    } catch (error) {
        console.error('Error creating titles:', error);
        return res.status(500).json({ message: 'Failed to create titles', error: error.message });
    }
};

const getAllBooks = async (req, res) => {
    
    const books_cache = myCache.get('all_books'); 
    if (books_cache) {
        return res.json(books_cache); 
    }
    try {
        const books = await Book.find().lean().populate("grades")
        const plainBooks = books.map(book => book.toObject());
        myCache.set('all_books', plainBooks);
        res.json(books)
    }
    catch {
        return res.status(400).json({ message: 'there is a problem loading the books' })
    }

}

const getBookById = async (req, res) => {
    const { id } = req.params
    const book = await Book.findById(id).lean().populate("grades")
    if (!book) {
        return res.status(400).json({ message: 'No book found' })
    }
    res.json(book)
}

const getBooksForGrade = async (req, res) => {

    const { Id } = req.params
    const books_cache = myCache.get(`books_by_grade_${Id}`); // נסה לשלוף מהמטמון
    if (books_cache) {
        return res.json(books_cache); // אם יש במטמון – שלח אותו מיד
    }

    try {
        const books = await Book.find({ grades: Id }).lean().populate("grades")
        if (Array.isArray(books) && books.length === 0) {
            return res.status(204).json({ message: 'No books found for this grade' })
        }
        const plainBooks = books.map(book => book.toObject());

        myCache.set(`books_by_grade_${Id}`, plainBooks);
        res.json(books)
    }
    catch {
        return res.status(400).json({ message: 'there is a problem loading the books' })
    }
}

const updateBook = async (req, res) => {
    try {
        const { _id, name, grades } = req.body;
        const newImage = req.file || null;
        const book = await Book.findById(_id).populate("grades").exec();
        if (!book) {
            return res.status(400).json({ message: 'Book not found' });
        }
        let gradesArray = [];

        if (grades && typeof grades === "object") {
            gradesArray = Array.isArray(grades) ? grades : Object.values(grades);
        }

        if (!Array.isArray(gradesArray)) {
            return res.status(400).send("Grades must be an array or an object convertible to an array");
        }
        const gradeDocs = await Promise.all(
            gradesArray.map(name => Grade.findOne({ name }))
        );

        const validGrades = gradeDocs.filter(doc => doc);
        const gradeIds = validGrades.map(doc => doc._id);

        if (newImage && book.image) {
            await s3.deleteObject({
                Bucket: BUCKET,
                Key: book.image.split('/').pop(),
            }).promise();
        }

        book.name = name;
        book.grades = gradeIds;
        if (newImage) {
            const filePath = newImage.path;
            const fileStream = fs.createReadStream(filePath);
            const newKey = Date.now() + "-" + newImage.originalname;
            await s3.putObject({
                Bucket: BUCKET,
                Key: newKey,
                Body: fileStream,
                ContentType: newImage.mimetype,
            }).promise();
            await fs.promises.unlink(filePath);

            book.image = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`;
        }

        const updatedBook = await book.save();

        return res.json(updatedBook);

    } catch (error) {
        console.error("Error updating book:", error.message);
        res.status(500).json({ message: "Failed to update book", error: error.message });
    }
};

const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id).exec();
        if (!book) {
            return res.status(400).json({ message: 'book not found' });
        }

        if (book.image) {
            if (book.image) {
                const key = book.image.split('/').pop();
                await s3.deleteObject({
                    Bucket: BUCKET,
                    Key: key,
                }).promise();
            }

        }

        const titles = await Title.find({ book: id }).exec();
        if (Array.isArray(titles)) {
            for (let title of titles) {
                await deleteTitle(title._id); // שים לב - אין שימוש ב-res
            }
        }

        await Book.deleteOne({ _id: id });
        res.status(200).json();
    } catch (error) {
        console.error("Error deleting book:", error.message);
        res.status(500).json({ message: "Failed to delete book", error: error.message });
    }
};

module.exports = { createNewBook, getAllBooks, getBookById, updateBook, deleteBook, getBooksForGrade }