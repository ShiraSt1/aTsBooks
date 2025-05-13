import React, { useState, useEffect } from "react";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FileUpload } from 'primereact/fileupload';
import { useSelector } from "react-redux";

const BookCreate = (props) => {
    const { createBook, visibleCreatBook, setVisibleCreatBook } = props;
    const { token } = useSelector((state) => state.token);
    const [name, setName] = useState(""); // שינוי ל-State עבור שם הספר
    const [selectedGrades, setSelectedGrades] = useState([]);
    const [grades, setGrades] = useState([]);
    const [nameError, setNameError] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [selectedimage, setselectedImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const { gradeId } = useParams();

    const AvailablGrade = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}api/grade`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 204) {
                setGrades([]);
            } else {
                const gradeOptions = res.data.map((grade) => ({
                    label: grade.name,
                    value: grade.name,
                    id: grade._id,
                }));
                setGrades(gradeOptions);
                if (gradeId) {
                    const selectedGrade = gradeOptions.find((grade) => grade.id === gradeId);
                    if (selectedGrade) {
                        setSelectedGrades([selectedGrade.value]);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching grades:', error);
            setGrades([]);
        }
    };

    useEffect(() => {
        AvailablGrade();
    }, [gradeId]);

    const handleCreateClick = () => {
        createBook(name, selectedGrades, selectedimage);
        setVisibleCreatBook(false);
    };

    return (
        <Dialog
            visible={visibleCreatBook}
            modal
            header="Create Book"
            style={{ width: '400px', borderRadius: '8px' }}
            onHide={() => setVisibleCreatBook(false)}
        >
            <div className="flex flex-column gap-4" style={{ padding: '1rem' }}>
                <div className="inline-flex flex-column gap-2">
                    <label htmlFor="name" className="font-medium">Name</label>
                    <InputText
                        id="name"
                        className={`p-inputtext-sm ${nameError ? 'p-invalid' : ''}`}
                        type="text"
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Enter book name"
                    />
                    {nameError && (
                        <small className="p-error">This field is required.</small>
                    )}
                </div>

                <div className="inline-flex flex-column gap-2">
                    <label htmlFor="grades" className="font-medium">Grades</label>
                    <MultiSelect
                        id="grades"
                        value={selectedGrades}
                        options={grades}
                        onChange={(e) => setSelectedGrades(e.value)}
                        optionLabel="label"
                        placeholder="Select Grades"
                        display="chip"
                        className="p-multiselect-sm"
                        virtualScrollerOptions={{ itemSize: 38 }}
                    />
                </div>

                {/* שדה תמונה לפי כתובת URL */}
                <div className="inline-flex flex-column gap-2">
                    <label htmlFor="image" className="font-medium">Upload Image</label>
                    <FileUpload
                        name="image"
                        customUpload
                        accept="image/*"
                        maxFileSize={5 * 1024 * 1024}
                        uploadHandler={(e) => {
                            const file = e.files[0];
                            if (file) {
                                setselectedImage(file);
                                setPreview(URL.createObjectURL(file));
                            }
                        }}
                        emptyTemplate={<p>Drag an image file or click to select.</p>}
                        chooseLabel="Choose"
                        uploadLabel="Confirm"
                        cancelLabel="Cancel"
                    />
                    {preview && <img src={preview} alt="Preview" style={{ width: 150, marginTop: 10 }} />}
                </div>

                <div className="flex justify-content-center gap-2">
                    <Button
                        label="Create"
                        onClick={() => {
                            handleCreateClick(); // קריאה לפונקציה הקיימת
                            setselectedImage(null); 
                            setPreview(null); // איפוס preview
                            setName(null);
                        }}
                        className="p-button p-button-primary"
                    />
                    <Button
                        label="Cancel"
                        onClick={() => {
                            setVisibleCreatBook(false);
                            setselectedImage(null);
                            setPreview(null);
                            setName(null);
                        }}
                        className="p-button p-button-secondary"
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default BookCreate;