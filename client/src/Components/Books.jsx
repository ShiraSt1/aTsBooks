import React, { useState, useEffect, useRef } from 'react';
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
import { Toast } from 'primereact/toast';
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { getConfig } from '../config';
import { Messages } from 'primereact/messages';
import { Skeleton } from 'primereact/skeleton';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import api from '../api';

export default function BooksDataView() {
    const location = useLocation();
    const gradeId = location.state ? location.state.gradeId : null;
    const [books, setBooks] = useState([]);
    const [layout, setLayout] = useState('grid');
    const [selectedBook, setSelectedBook] = useState({});
    const [flagGradeId, setFlagGradeId] = useState(false);
    const [gradeName, setGradeName] = useState('');
    const [visibleCreatBook, setVisibleCreatBook] = useState(false);
    const [visible, setVisible] = useState(false);
    const { token } = useSelector((state) => state.token);
    const { user } = useSelector((state) => state.token);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const toastDelete = useRef(null);
    // const apiUrl = getConfig().API_URL;
    const msgs = useRef(null);
    const toast = useRef(null);
    const [compLoading, setCompLoading] = useState(false);

    useEffect(() => {
        const loadAll = async () => {
            setCompLoading(true)
            try {
                if (gradeId != null) {
                    await getGradeName(gradeId);
                    await getBooksByGrade(gradeId);
                } else {
                    await getBooks();
                    setGradeName(''); 
                }
            } finally {
                setCompLoading(false)
            }
        }
        loadAll();
    }, [gradeId, flagGradeId]);

    const getGradeName = async (Id) => {
        try {
            // const res = await axios.get(`${apiUrl}api/grade/${Id}`); 
            const res = await api.get(`/api/grade/${Id}`);
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
            // const res = await axios.get(`${apiUrl}api/book`);
            const res = await api.get('/api/book');
            if (res.status === 200) {
                setBooks(res.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const getBooksByGrade = async (Id) => {
        try {
            // const res = await axios.get(`${apiUrl}api/book/grade/${Id}`);
            const res = await api.get(`/api/book/grade/${Id}`);
            if (res.status === 200) {
                setBooks(res.data);
            }
            if (res.status === 204) {
                if (msgs.current) {
                    msgs.current.clear();
                    msgs.current.show([
                        { sticky: true, severity: 'warn', detail: 'There are no books yet to this grade.', closable: false },
                    ]);
                }
            }
        } catch (e) {
            console.error("error: ", e)
            if (msgs.current) {
                msgs.current.clear();
                msgs.current.show([
                    { sticky: true, severity: 'error', detail: 'there was a problem, try again later.', closable: false },
                ]);
            }
        }
    };

    const deleteBook = async (bookId) => {
        setLoading(true)
        try {
            // const res = await axios.delete(`${apiUrl}api/book/${bookId}`, {
            const res = await api.delete(`api/book/${bookId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFlagGradeId(!flagGradeId)
        } catch (err) {
            console.error('Error deleting book:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateBook = async (name, selectedItem, image, book) => {
        setLoading(true)
        const formData = new FormData();
        formData.append('_id', book._id);
        formData.append('name', name || book.name);
        formData.append('grades', JSON.stringify(selectedItem));

        if (image instanceof File || image instanceof Blob) {
            formData.append('image', image);
        }
        try {
            // const res = await axios.put(`${apiUrl}api/book`, formData, {
            const res = await api.put('/api/book', formData, {
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
        } finally {
            setLoading(false);
        }
    };

    const createBook = async (name, selectedItem, image) => {
        setLoading(true)
        if (!image) {
            toast.current.show({ severity: 'warn', detail: 'You must press uploal to confirm the image', life: 3000 });
        }
        const formData = new FormData();
        formData.append('name', name);
        formData.append('grades', JSON.stringify(selectedItem));
        formData.append('image', image);
        try {
            // const res = await axios.post(`${apiUrl}api/book`, formData, {
            const res = await api.post('/api/book', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' // הגדרת התוכן כ-multipart
                },
            });
            if (res.status === 200 || res.status === 201) {
                setVisibleCreatBook(false);
                if (gradeId) {
                    getBooksByGrade(gradeId);
                } else {
                    getBooks();
                }
            }
        } catch (e) {
            setVisibleCreatBook(false);
            if (e.status === 400) {
                console.error("Error creating book:", e);
                toast.current.show({ severity: 'error', detail: 'Error creating book', life: 3000 });
            }
            if (e.status === 402) {
                toast.current.show({ severity: 'error', detail: 'This book name already exists', life: 3000 });
            }

        } finally {
            setLoading(false);
        }
    };

    const handleNavigation = (book) => {
        if (!token) {
            toast.current.show({ severity: 'error', detail: 'You must log-in to view the book files.', life: 3000 });
        }
        else if (book.name == "Take It Easy" || book.name == "Go Ahead" || book.name == "Go Ahead Boys") {
            toast.current.show({ severity: 'error', detail: 'This book is not in use any more.', life: 3000 });
        }
        else {
            navigate(`/titles/${book.name}`, { state: { bookId: book._id,bookName:book.name } });
        }
    };

    const gridItem = (book) => (
        <div className="col-12 sm:col-6 lg:col-4 xl:col-3 p-2" key={book._id}>
            <div
                className="p-4 border-1 surface-border surface-card border-round"
                onClick={() => handleNavigation(book)}
                style={{ cursor: 'pointer', height: "640px" }}>
                <div style={{ position: 'relative', width: '100%', height: "550px" }} className="flex flex-column align-items-center gap-3 py-5">
                    <img
                        className="object-cover w-full h-full"
                        src={book.image}
                        alt={book.name}
                        style={{
                            width: "100%", height: "100%", objectFit: "cover", minHeight: '100px',
                            filter: book.name === "Take It Easy" || book.name == "Go Ahead" || book.name == "Go Ahead Boys" ? "grayscale(100%) brightness(1)" : "none",
                            opacity: book.name === "Take It Easy" || book.name == "Go Ahead" || book.name == "Go Ahead Boys" ? 0.6 : 1,
                            borderRadius: '8px'
                        }}
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
                <div
                    style={{ marginTop: 'auto', paddingBottom: '0px', paddingTop: '0px', marginBottom: '0px' }}
                    className="card flex flex-wrap gap-2 justify-content-center">
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
                                    confirmPopup({
                                        target: e.currentTarget,
                                        message: 'Are you sure you want to delete this book and all the files in it?',
                                        icon: 'pi pi-exclamation-triangle',
                                        defaultFocus: 'accept',
                                        accept: () => {
                                            e.stopPropagation()
                                            deleteBook(book._id);
                                            setVisible(false);
                                        },
                                        reject: () => {
                                            e.stopPropagation()
                                            setVisible(false);
                                        }
                                    });
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
            <Helmet>
                <title>{`aTsBooks | Books`} {gradeName ? `for ${gradeName}` : ''}</title>
                <meta name="description" content="Explore our full collection of English learning books for all age groups and levels. Perfect for home, school, or self-study – find your next favorite book today!" />
                <meta name="keywords" content="English books, ESL materials, learn English, English for kids, English for teens, English reading practice" />
                <meta property="og:title" content="All English Books – For Every Age and Level" />
                <meta property="og:description" content="Discover our complete selection of engaging English books for kids, teens, and adults. Designed for fun, effective learning." />
                <meta property="og:type" content="website" />
            </Helmet>
            {compLoading ? (
                <div className="flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                    <div className="flex justify-center items-center gap-3 text-xl mt-6">
                        <div className="custom-spinner" />
                        <span>Loading, please wait...</span>
                    </div>
                </div>
            ) :
                (<>
                    <Toast ref={toast} />
                    <Messages ref={msgs} />
                    <Toast ref={toastDelete} />
                    <ConfirmPopup />
                    {loading && (
                        <div style={{ margin: "20px" }}>
                            <ProgressSpinner style={{ width: '30px', height: '30px' }} strokeWidth="5" />
                            <p>Wait just a moment please...</p>
                        </div>
                    )}
                    <div>
                        {gradeName ? (
                            <h1 className="grade-header">{gradeName}</h1>
                        ) : (
                            <h1 className="grade-header">Our Books</h1>
                        )}
                    </div>
                    {user?.roles === "Admin" && (
                        <Button icon="pi pi-plus" rounded aria-label="Filter" onClick={() => setVisibleCreatBook(true)} className="add-button" />)}
                    <BookCreate createBook={createBook} setVisibleCreatBook={setVisibleCreatBook} visibleCreatBook={visibleCreatBook} />
                    <div className="card">
                        <DataView value={Array.isArray(books) ? books : []} listTemplate={listTemplate} layout={layout} />
                    </div>
                    {selectedBook ? <BookUpdate updateBook={updateBook} setVisible={setVisible} visible={visible} book={selectedBook} /> : <></>}
                </>)}
        </div>
    );
}

