import React, { useState, useRef, useEffect } from "react";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import axios from 'axios';
import { FileUpload } from "primereact/fileupload";
import { getConfig } from '../config';

const BookUpdate = (props) => {
    const { updateBook, visible, book = {}, setVisible } = props; // ברירת מחדל ל-book
    const [selectedImage, setSelectedImage] = useState(null); // תמונה שנבחרה
    const [preview, setPreview] = useState(book?.image ? `${apiUrl}${book.image}` : "");
    // const [preview, setPreview] = useState(book?.image ? `${process.env.REACT_APP_API_URL}${book.image}` : "");
    const [grades, setGrades] = useState([]);
    const [selectedGrades, setSelectedGrades] = useState([]);
    const nameRef = useRef("");
    const [name, setName] = useState(book?.name || "");
    const apiUrl = getConfig().API_URL;

    // הבאת כיתות זמינות
    const AvailablGrade = async () => {
        try {
            const res = await axios.get(`${apiUrl}api/grade`);
            // const res = await axios.get(`${process.env.REACT_APP_API_URL}api/grade`);
            if (res.status === 204) {
                setGrades([]);
            } else {
                const gradeOptions = res.data.map((grade) => ({
                    label: grade.name,
                    value: grade.name,
                }));
                setGrades(gradeOptions);
            }
        } catch (error) {
            console.error('Error fetching grades:', error);
            setGrades([]);
        }
    };

    useEffect(() => {
        AvailablGrade();
    }, []);

    // הגדרת כיתות ראשוניות
    useEffect(() => {
        if (book?.grades && book.grades.length > 0) {
            const initialGrades = book.grades.map((grade) => grade.name);
            setSelectedGrades(initialGrades);
        }
    }, [book, grades]);

    useEffect(() => {
        if (book?.image) {
            setPreview(`${apiUrl}${book.image}`);
            // setPreview(`${process.env.REACT_APP_API_URL}${book.image}`);
        }
    }, [book.image]);
    
    // העלאת תמונה חדשה
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        // const file = e.files[0];
        if (file) {
            setSelectedImage(file);
            setPreview(URL.createObjectURL(file)); // עדכון תצוגה מקדימה
        }
    };

    return (
        <Dialog
            visible={visible}
            modal
            header="Update Book"
            style={{ width: '400px', borderRadius: '8px' }}
            onHide={() => {
                setSelectedImage(null);
                setPreview(book.image || "");
                setVisible(false);
            }}
        >
            <div className="flex flex-column gap-4" style={{ padding: '1rem' }}>
                {/* שם הספר */}
                <div className="flex flex-column gap-2">
                    <label htmlFor="name" className="font-medium">Name</label>
                    <InputText
                        id="name"
                        placeholder="Enter book name"
                        className="p-inputtext-sm"
                        onChange={(e) => {setName(e.target.value)  }} 
                        defaultValue={book?.name || ""}
                    />
                </div>

                {/* כיתות */}
                <div className="flex flex-column gap-2">
                    <label htmlFor="grades" className="font-medium">Grades</label>
                    <MultiSelect
                        id="grades"
                        value={selectedGrades}
                        options={grades}
                        onChange={(e) => setSelectedGrades(e.value)}
                        optionLabel="label"
                        placeholder="Select Grades"
                        display="chip"
                        className="w-full md:w-20rem custom-multiselect"
                    />
                </div>

                {/* העלאת תמונה */}
                <div className="flex flex-column gap-2">
                    <label htmlFor="image" className="font-medium">Upload New Image</label>
                    <FileUpload
                        name="image"
                        customUpload
                        accept="image/*"
                        maxFileSize={5 * 1024 * 1024}
                        uploadHandler={handleImageUpload}
                    />
                    {preview && <img src={preview} alt="Preview" style={{ width: 150, marginTop: 10 }} />}
                </div>

                {/* כפתורים */}
                <div className="flex justify-content-center gap-2">
                    <Button
                        label="Update"
                        onClick={() => {
                            setName(nameRef.current.value || book.name)

                            const imageToSend = selectedImage || book.image; // אם אין תמונה חדשה, שולחים את הקיימת
                            updateBook(name, selectedGrades, imageToSend, book);
                            setVisible(false);
                        }}
                        className="p-button p-button-primary"
                    />
                    <Button
                        label="Cancel"
                        onClick={() => {
                            setSelectedImage(null);
                            setPreview(book.image || "");
                            setVisible(false);
                        }}
                        className="p-button p-button-secondary"
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default BookUpdate;