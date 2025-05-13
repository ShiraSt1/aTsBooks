import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import axios from 'axios';
import BookCreate from "./BookCreat";
import BookUpdate from './BookUpdate';
import { useSelector } from "react-redux";
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../Styles/Grades.css';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function BooksDataView() {
    const [books, setBooks] = useState([]);
    const [layout, setLayout] = useState('grid');
    const [selectedBook, setSelectedBook] = useState({});
    const [flagGradeId, setFlagGradeId] = useState(false);
    const [gradeName, setGradeName] = useState('');
    const [visibleCreatBook, setVisibleCreatBook] = useState(false);
    const [visible, setVisible] = useState(false);
    const { gradeId } = useParams(); // Get gradeId from URL
    const { token } = useSelector((state) => state.token);
    const { user } = useSelector((state) => state.token);
    const navigate = useNavigate();

    useEffect(() => {
        if (gradeId) {
            getGradeName(gradeId);
            getBooksByGrade(gradeId); // Fetch books for the specific grade
        } else {
            getBooks();
            setGradeName(''); // Fetch all books if no gradeId is provided
        }
    }, [gradeId, flagGradeId]);

    const getGradeName = async (Id) => {
        try {
            const res = await axios.get(`http://localhost:7000/api/grade/${Id}`); // נתיב לשרת לקבלת שם כיתה
            if (res.status === 200) {
                setGradeName(res.data.name); // עדכון שם הכיתה ב-state
            }
        } catch (e) {
            console.error('Error fetching grade name:', e);
            setGradeName(''); // במידה ויש שגיאה, איפוס שם הכיתה
        }
    };

    const getBooks = async () => {
        try {
            const res = await axios.get('http://localhost:7000/api/book');
            if (res.status === 200) {
                setBooks(res.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const getBooksByGrade = async (Id) => {
        try {
            const res = await axios.get(`http://localhost:7000/api/book/grade/${Id}`
            );
            if (res.status === 200) {
                setBooks(res.data);
            }
        } catch (e) {
            if (e.status === 400) {
                alert("there are no book for this grade")
            }
        }
    };

    const [loading, setLoading] = useState(false);

    const deleteBook = async (bookId) => {
        setLoading(true)
        try {
            const res = await axios.delete(`http://localhost:7000/api/book/${bookId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFlagGradeId(!flagGradeId)
        } catch (err) {
            console.error('Error deleting book:', err);
        }finally {
            setLoading(false);
          }
    };

    const updateBook = async (name, selectedItem, image, book) => {
        setLoading(true)

        const updatebook = {
            ...book,
            name: name ? name : book.name,
            grades: selectedItem,
            image: image ? image : book.image,
        };
        try {
            const res = await axios.put('http://localhost:7000/api/book', updatebook, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (res.status === 200) {
                setFlagGradeId(!flagGradeId)
            }
        } catch (e) {

            console.error(e);
        }finally {
            setLoading(false);
          }
    };

    const createBook = async (name, selectedItem, image) => {
        setLoading(true)
        if (!image)
            alert("confirm the image")
        const formData = new FormData();
        formData.append('name', name);
        formData.append('grades', JSON.stringify(selectedItem));
        formData.append('image', image); // הוספת הקובץ ל-FormData
        try {
            const res = await axios.post('http://localhost:7000/api/book', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' // הגדרת התוכן כ-multipart
                },
            });
            if (res.status === 200 || res.status === 201) {
                if (gradeId) {
                    getBooksByGrade(gradeId);
                } else {
                    getBooks();
                }
            }
        } catch (e) {
            alert(e.res.data.mes)
            if (e.status === 400)
                console.error("Error creating book:", e);
            if (e.status === 402)
                alert("this book name alrady exits")
        }finally {
            setLoading(false);
          }
    };

    const handleNavigation = (id) => {
        if (!token) {
            alert('You are not allowed to view the book files.')
        }
        else {
            navigate(`/Titles/${id}`);
            // אם המשתמש אינו מורשה, מפעיל פונקציה להצגת דיאלוג
        }
    };

    const gridItem = (book) => (
        <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2" key={book._id}>
            <div
                className="p-4 border-1 surface-border surface-card border-round"
                onClick={() => handleNavigation(book._id)}
                style={{ cursor: 'pointer' }}>
                <div className="flex flex-column align-items-center gap-3 py-5">
                    <img
                        className="object-cover w-full h-full"
                        src={`http://localhost:7000${book.image}`}
                        alt={book.name}
                        style={{ objectFit: 'cover', width: '80%', height: '80%' }} // תמונה בגודל קטן יותר
                    />
                    <div className="text-2xl font-bold">{book.name}</div>
                    {book.grades && book.grades.length > 0 && (
                        <>
                            <strong>Suitable for:</strong>
                            <ul className="m-0 pl-3 list-disc text-xs">
                                {book.grades.map((grade, idx) => (
                                    <li key={idx}>{grade.name}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
                <div className="card flex flex-wrap gap-2 justify-content-center">
                    {user?.roles === "Admin" && (
                        <>
                            <Button
                                icon="pi pi-pencil"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setVisible(true);
                                    setSelectedBook(book);
                                }}
                                tooltip="Edit"
                            />
                            <Button
                                icon="pi pi-trash"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteBook(book._id);
                                }}
                                tooltip="Delete"
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    const itemTemplate = (book, layout, index) => {
        if (!book) return;
        return layout === 'list' ? gridItem(book) : gridItem(book);
    };

    const listTemplate = (books, layout) => (
        <div className="grid grid-nogutter">
            {books.map((book, index) => itemTemplate(book, layout, index))}
        </div>
    );

    return (
        <div>
            {loading && (
                                <div style={{ margin: "20px" }}>
                                  <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="5" />
                                  <p>Wait just a moment please...</p>
                                </div>
                              )}
            <div>
                {gradeName && (
                    <h1 className="grade-header">{gradeName}</h1> // שם הכיתה בראש
                )}
            </div>
            {user?.roles === "Admin" && (
                <Button icon="pi pi-plus" rounded aria-label="Filter" onClick={() => setVisibleCreatBook(true)} className="add-button" />)}
            <BookCreate createBook={createBook} setVisibleCreatBook={setVisibleCreatBook} visibleCreatBook={visibleCreatBook} />
            <div className="card">
                <DataView value={Array.isArray(books) ? books : []} listTemplate={listTemplate} layout={layout} />
            </div>
            {selectedBook ? <BookUpdate updateBook={updateBook} setVisible={setVisible} visible={visible} book={selectedBook} /> : <></>}
        </div>
    );
}