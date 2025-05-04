const Grade = require("../models/Grade");
const Book = require("../models/Book")

const { deleteBook } = require('../Controllers/bookController');

// create
const creatNewGrade = async (req, res) => {
    const { name, image } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }
    const duplicate = await Grade.findOne({ name }).lean();
    if (duplicate) {
        return res.status(409).json({ message: "Duplicate grade name" });
    }
    
    const grade = await Grade.create({ name, image });
    if (!grade) {
        return res.status(500).json({ message: "Failed to create grade" });
    }
    res.status(201).json(grade);
};

// read
const getAllGrade = async (req, res) => {
    try {
        const grades = await Grade.find().lean(); // שליפת הכיתות
        if (!grades?.length) {
            return res.status(204).json({ message: 'No grades found' });
        }

        // מיון לפי סדר ה-enum
        const enumOrder = ['first grade', 'second grade', 'third grade', 'fourth grade', 'fifth grade', 'sixth grade', 'seventh grade', 'eighth grade'];
        grades.sort((a, b) => {
            return enumOrder.indexOf(a.name) - enumOrder.indexOf(b.name);
        });

        res.json(grades);
    } catch (error) {
        console.error("Error fetching grades:", error.message);
        res.status(500).json({ message: "Failed to fetch grades", error: error.message });
    }
};

// read by id
// const getGradeById = async (req, res) => {
//     const { id } = req.params;
//     const grade = await Grade.findById(id).lean();
//     if (!grade) {
//         return res.status(400).json({ message: `Grade with ID ${id} not found` });
//     }
//     res.json(grade);
// };

// update
const updateGrade = async (req, res) => {
    const { _id, name, image } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }
    console.log(_id, name, image);
    const grade = await Grade.findById(_id);
    console.log(grade);
    if (!grade) {
        return res.status(400).json({ message: `Grade with ID ${_id} not found` });
    }

    const duplicate = await Grade.findOne({ name }).lean();
    if (duplicate && duplicate._id.toString() !== _id) {
        return res.status(409).json({ message: "Duplicate grade name" });
    }

    grade.name = name;
    grade.image = image;

    const updatedGrade = await grade.save();
    if (!updatedGrade) {
        return res.status(500).json({ message: "Failed to update grade" });
    }

    const grades = await Grade.find().lean();
    res.json(grades);
};


// delete

const deleteGrade = async (req, res) => {
    const { id } = req.params;
    const grade = await Grade.findById(id);
    if (!grade) {
        return res.status(400).json({ message: `Grade with ID ${id} not found` });
    }
    const books = await Book.find({ grades: id }).exec();
    if (books.length > 0) {
        await Promise.all(books.map(async (book) => {
            if (book.grades.length <= 1) {
                const dummyRes = {
                    status: () => dummyRes,
                    json: () => {},
                };
                await deleteBook({ params: { id: book._id } }, dummyRes);
            } else {
                book.grades = book.grades.filter(bookGrade => bookGrade._id.toString() !== grade._id.toString());
                await book.save(); 
            }
        }));
    }    

    const result = await Grade.deleteOne({ _id: id });
    if (!result.deletedCount) {
        return res.status(500).json({ message: "Failed to delete grade" });
    }
    // החזרת הרשימה החדשה של הכיתת
    const grades = await Grade.find().lean();
    if (!grades?.length<0) {
        return res.status(204).json({ message: 'No grades found' });
    }
    res.json(grades);
};
module.exports = { creatNewGrade, getAllGrade, updateGrade, deleteGrade };//,getGradeById
