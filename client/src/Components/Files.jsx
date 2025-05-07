import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';


const FilesDataView = ({ titleId }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCreate, setVisibleCreate] = useState(false);
    const [visibleUpdate, setVisibleUpdate] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newFileName, setNewFileName] = useState('');
    const [book, setBook] = useState(null);

    console.log("titleId:", titleId);

    const toast = useRef(null);
     const navigate = useNavigate();

    // useEffect(() => {
    //     if (titleId) {
    //         setLoading(true);
    //         fetchFiles();
    //     }
    // }, [titleId]);
    useEffect(() => {
        console.log("titleId:", titleId);
        const fetchTitleAndBook = async () => {
            try {
                const titleRes = await axios.get(`http://localhost:7000/api/title/${titleId}`);
                const title = titleRes.data;
    
                const bookRes = await axios.get(`http://localhost:7000/api/book/${title.book}`);
                setBook(bookRes.data);
    
                fetchFiles(); // כבר קיים אצלך
            } catch (err) {
                console.error("Error fetching title or book:", err);
            }
        };
    
        if (titleId) {
            fetchTitleAndBook();
        }
    }, [titleId]);

    const fetchFiles = async () => {
        setFiles([]);
        try {
            const res = await axios.get(`http://localhost:7000/api/file/title/${titleId}`);
            setFiles(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'שגיאה', detail: 'לא נטענו קבצים', life: 3000 });
            setLoading(false);
        }
    };

    const handleUpload = async ({ files: uploadedFiles }) => {
        const file = uploadedFiles[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', titleId);

        try {
            const res = await axios.post('http://localhost:7000/api/file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFiles(prev => [...prev, res.data]);
            setVisibleCreate(false);
            toast.current?.show({ severity: 'success', summary: 'הצלחה', detail: 'קובץ הועלה', life: 3000 });
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'שגיאה', detail: 'בעיה בהעלאת קובץ', life: 3000 });
        }
    };

    const handleDelete = async (fileId) => {
        try {
            await axios.delete(`http://localhost:7000/api/file/${fileId}`);
            setFiles(prev => prev.filter(file => file._id !== fileId));
            toast.current?.show({ severity: 'success', summary: 'הצלחה', detail: 'קובץ נמחק', life: 3000 });
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'שגיאה', detail: 'בעיה במחיקת קובץ', life: 3000 });
        }
    };



    const handleDownload = (fileId) => {
        window.open(`http://localhost:7000/api/file/download/${fileId}`, '_blank');
    };

    const handleView = (fileId) => {
        window.open(`http://localhost:7000/api/file/view/${fileId}`, '_blank');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('newName', newFileName);

        try {
            const res = await axios.put(`http://localhost:7000/api/file/${selectedFile._id}`, formData);
            setFiles(prev => prev.map(file => file._id === res.data._id ? res.data : file));
            setVisibleUpdate(false);
            toast.current?.show({ severity: 'success', summary: 'הצלחה', detail: 'קובץ עודכן', life: 3000 });
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'שגיאה', detail: 'בעיה בעדכון קובץ', life: 3000 });
        }
    };

    if (loading) return <div>טוען קבצים...</div>;
        return (
            <div className="p-4">
                {/* כותרת ראשית עם שם הספר */}
                {book && (
                    <h2 className="text-center mb-4">{book.name}</h2>
                )}
        
                {/* אזור התוכן - שתי עמודות */}
                <div className="grid">
                    {/* צד שמאל - תמונה */}
                    <div className="col-12 md:col-6 flex justify-content-center align-items-center">
                        {book?.image && (
                            <img
                                src={`http://localhost:7000/uploads/${book.image}`}
                                alt={book.name}
                                style={{
                                    width: '100%',
                                    maxWidth: '400px',
                                    borderRadius: '16px',
                                    objectFit: 'cover',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                        )}
                    </div>
        
                    {/* צד ימין - קבצים */}
                    <div className="col-12 md:col-6">
                        <div className="card">
                            <Button label="הוסף קובץ" icon="pi pi-plus" onClick={() => setVisibleCreate(true)} className="mb-3" />
        
                            <div className="grid">
                                {Array.isArray(files) && files.map(file => (
                                    <div key={file._id} className="col-12">
                                        <div className="p-3 border-1 surface-border surface-card border-round flex flex-column gap-2">
                                            <div className="text-xl">{file.name}</div>
                                            <div className="text-sm text-color-secondary">{file.size}</div>
                                            <div className="flex gap-2 mt-2">
                                                <Button icon="pi pi-eye" rounded text size="small" onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/FileView/${file._id}`);
                                                }} />
                                                <Button icon="pi pi-download" className="p-button-sm p-button-success" onClick={() => handleDownload(file._id)} tooltip="הורד" />
                                                <Button icon="pi pi-pencil" className="p-button-sm p-button-warning" onClick={() => { setSelectedFile(file); setVisibleUpdate(true); }} tooltip="ערוך" />
                                                <Button icon="pi pi-trash" className="p-button-sm p-button-danger" onClick={() => handleDelete(file._id)} tooltip="מחק" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
        
                {/* דיאלוגים וטוסטים */}
                <Dialog header="העלאת קובץ חדש" visible={visibleCreate} style={{ width: '30vw' }} onHide={() => setVisibleCreate(false)}>
                    <FileUpload mode="basic" auto customUpload uploadHandler={handleUpload} chooseLabel="בחר קובץ" />
                </Dialog>
        
                <Dialog header="עריכת קובץ" visible={visibleUpdate} style={{ width: '30vw' }} onHide={() => setVisibleUpdate(false)}>
                    <form onSubmit={handleUpdate} className="flex flex-column gap-3">
                        <InputText placeholder="שם קובץ חדש" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />
                        <Button label="שמור" type="submit" />
                    </form>
                </Dialog>
        
                <Toast ref={toast} />
            </div>
        );
        
    // );
};

export default FilesDataView;