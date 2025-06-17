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

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = path.join(__dirname, '../uploads/bookImages');
//         if (!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath);
//         }
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         const ext = path.extname(file.originalname);
//         const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
//         cb(null, uniqueName);
//     }
// });
// const upload = multer({ storage });

// const createNewBook = async (req, res) => {
//     const { name, grades } = req.body
//     // const image = req.file ? 'uploads/bookImages/' + req.file.filename : null;
//     let image = null;
//     if (req.file) {
//         const key = `bookImages/${Date.now()}_${req.file.originalname}`;
//         await s3.putObject({
//             Bucket: BUCKET,
//             Key: key,
//             Body: req.file.buffer,
//             ContentType: req.file.mimetype
//         }).promise();

//         image = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
//     }
//     let gradesArr = [];
//     gradesArr = grades
//     if (!name) {
//         return res.status(400).send("name is required")
//     }
//     if (!req.file) {
//         return res.status(400).send("image is required")
//     }
//     const existBook = await Book.findOne({ name: name }).populate("grades");
//     if (existBook) {
//         return res.status(402).send("invalid name")
//     }

//     let gradeDocs = []

//     if (typeof gradesArr === "string" && gradesArr != "[]") {
//         try {
//             gradesArr = JSON.parse(gradesArr);
//             if (!Array.isArray(gradesArr)) {
//                 return res.status(400).send("grades must be an array");
//             }
//             gradeDocs = await Promise.all(
//                 gradesArr.map(grade => Grade.findOne({ name: grade }))
//             );
//         } catch (error) {
//             console.error("Failed to parse gradesArr:", error);
//             return res.status(400).send("Invalid grades format");
//         }
//     }

//     // סינון רק כיתות שנמצאו בפועל
//     const validGrades = gradeDocs.filter(doc => doc);
//     const gradeIds = validGrades.map(doc => doc._id);

//     const book = await Book.create({ name, grades: gradeIds, image });
//     if (!book) {
//         return res.status(400).send("invalid book")
//     }
//     try {
//         const titles = ['Book', 'Exams', 'Exercises', 'Disk', 'Videos', 'Other'];

//         const titleDocs = await Promise.all(
//             titles.map(name => Title.create({ name, book: book._id }))
//         );

//         res.json(book);
//     } catch (error) {
//         console.error('Error creating titles:', error);
//         return res.status(500).json({ message: 'Failed to create titles', error: error.message });
//     }
// }

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

    // העלאת תמונה ל-S3
    let image = null;
    try {
        const key = `bookImages/${Date.now()}_${req.file.originalname}`;
        await s3.putObject({
            Bucket: BUCKET,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }).promise();
        image = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (err) {
        console.error("S3 upload error:", err.message);
        return res.status(500).send("Failed to upload image");
    }

    // עיבוד כיתות
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
        const titles = ['Book', 'Exams', 'Exercises', 'Disk', 'Videos', 'Other'];
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
    try {
        const books = await Book.find().lean().populate("grades")
        res.json(books)
    }
    catch {
        return res.status(400).json({ message: 'there is a bloblem louding the books' })
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
    // חפש את כל הספרים שהכיתה עם ה-ID הזה נמצאת במערך grades
    try {
        const books = await Book.find({ grades: Id }).lean().populate("grades")
        if (Array.isArray(books) && books.length === 0) {
            return res.status(204).json({ message: 'No books found for this grade' })
        }
        res.json(books)
    }
    catch {
        return res.status(400).json({ message: 'there is a bloblem louding the books' })
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
        // Update grades
        let gradesArray = [];
        console.log("Grades input:", grades);
        
        if (grades && typeof grades === "object") {
            gradesArray = Array.isArray(grades) ? grades : Object.values(grades);
        }

        // Ensure gradesArray is an array
        if (!Array.isArray(gradesArray)) {
            return res.status(400).send("Grades must be an array or an object convertible to an array");
        }
        const gradeDocs = await Promise.all(
            gradesArray.map(name => Grade.findOne({ name }))
        );

        const validGrades = gradeDocs.filter(doc => doc);
        const gradeIds = validGrades.map(doc => doc._id);

        // מחיקת התמונה הקודמת אם יש תמונה חדשה
        if (newImage && book.image) {
            await s3.deleteObject({
                Bucket: BUCKET,
                Key: book.image.split('/').pop(),
            }).promise();
        }

        book.name = name;
        book.grades = gradeIds;
        if (newImage) {
            const newKey = Date.now() + "-" + newImage.originalname;
            await s3.putObject({
                Bucket: BUCKET,
                Key: newKey,
                Body: newImage.buffer,
                ContentType: newImage.mimetype,
            }).promise();

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
            // const imagePath = path.join(__dirname, '../', book.image);
            // fs.unlink(imagePath, (err) => {
            //     if (err) {
            //         console.error(`Failed to delete image file: ${imagePath}`, err);
            //     }
            // });
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