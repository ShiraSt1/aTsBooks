import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { logOut } from '../redux/tokenSlice';
import { getConfig } from '../config';
import { useSelector } from "react-redux";

const FilesDataView = ({ titleId }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCreate, setVisibleCreate] = useState(false);
    const [visibleUpdate, setVisibleUpdate] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newFileName, setNewFileName] = useState('');
    const [book, setBook] = useState(null);
    const apiUrl = getConfig().API_URL;
    const { token } = useSelector((state) => state.token);
    const toast = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTitleAndBook = async () => {
            try {
                const titleRes = await axios.get(`${apiUrl}api/title/${titleId}`);
                // const titleRes = await axios.get(`${process.env.REACT_APP_API_URL}api/title/${titleId}`);
                const title = titleRes.data;
                const bookRes = await axios.get(`${apiUrl}api/book/${title.book}`);
                // const bookRes = await axios.get(`${process.env.REACT_APP_API_URL}api/book/${title.book}`);
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

    useEffect(() => {
        console.log("in component files");
        
    },[]);

    const fetchFiles = async () => {
        setFiles([]);
        try {
            const res = await axios.get(`${apiUrl}api/file/title/${titleId}`);
            // const res = await axios.get(`${process.env.REACT_APP_API_URL}api/file/title/${titleId}`);
            setFiles(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No files were uploaded.', life: 3000 });
            setLoading(false);
        }
    };

    const handleUpload = async ({ files: uploadedFiles }) => {
        console.log("in function upload");
        
        const file = uploadedFiles[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', titleId);

        try {
            const res = await axios.post(`${apiUrl}api/file`, formData, {
                // const res = await axios.post(`${process.env.REACT_APP_API_URL}api/file`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        console.log("after try")

            setFiles(prev => [...prev, res.data]);
            setVisibleCreate(false);
            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'File uploaded ', life: 3000 });
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error in uploading file', life: 3000 });
        }
    };

    const handleDelete = async (fileId) => {
        try {
            await axios.delete(`${apiUrl}api/file/${fileId}`);
            // await axios.delete(`${process.env.REACT_APP_API_URL}api/file/${fileId}`);
            setFiles(prev => prev.filter(file => file._id !== fileId));
            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'File deleted ', life: 3000 });
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error deleting file.', life: 3000 });
        }
    };

    const handleDownload = async (fileId) => {
        try {
            const res = await axios.get(`${apiUrl}api/file/download/${fileId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            window.open(res.data.url, "_blank");
          } catch (err) {
            console.error("Error getting download URL", err);
            toast.current?.show({ severity: 'error', detail: 'Error downloading file', life: 3000 });
          }
        // window.open(`${apiUrl}api/file/download/${fileId}`, '_blank');
        // window.open(`${process.env.REACT_APP_API_URL}api/file/download/${fileId}`, '_blank');
    };

    const handleView = async(fileId) => {
        try {
            const res = await axios.get(`${apiUrl}api/file/view/${fileId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            window.open(res.data.url, "_blank");
          } catch (err) {
            console.error("Error getting view URL", err);
            toast.current?.show({ severity: 'error', detail: 'Error viewing file', life: 3000 });
          }
        // window.open(`${apiUrl}api/file/view/${fileId}`, '_blank');
        // window.open(`${process.env.REACT_APP_API_URL}api/file/view/${fileId}`, '_blank');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('newName', newFileName);

        try {
            const res = await axios.put(`${apiUrl}api/file/${selectedFile._id}`, formData);
            // const res = await axios.put(`${process.env.REACT_APP_API_URL}api/file/${selectedFile._id}`, formData);
            setFiles(prev => prev.map(file => file._id === res.data._id ? res.data : file));
            setVisibleUpdate(false);
            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'File updated ', life: 3000 });
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error updating file.', life: 3000 });
        }
    };

    if (loading) return <div>Loading Files...</div>;
    
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
                            // src={`${apiUrl}uploads/${book.image}`}
                            // src={`${process.env.REACT_APP_API_URL}uploads/${book.image}`}
                            src={book.image}
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
                        <Button label="Add File" icon="pi pi-plus" onClick={() => setVisibleCreate(true)} className="mb-3" />
                        <div className="grid">
                            {Array.isArray(files) && files.map(file => (
                                <div key={file._id} className="col-12">
                                    <div className="p-3 border-1 surface-border surface-card border-round flex flex-column gap-2">
                                        <div className="text-xl">{file.name}</div>
                                        <div className="text-sm text-color-secondary">{(file.size).toFixed(2)} KB</div>
                                        <div className="flex gap-2 mt-2">
                                            <Button icon="pi pi-eye" rounded text size="small" onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/fileview/${file._id}`);
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
            <Dialog header="Upload new file!!!!" visible={visibleCreate} style={{ width: '30vw' }} onHide={() => setVisibleCreate(false)}>
                <FileUpload 
                name="file"
                mode="basic" 
                auto 
                customUpload 
                uploadHandler={handleUpload} 
                chooseLabel="Choose File" />
            </Dialog>

            <Dialog header="Edit file" visible={visibleUpdate} style={{ width: '30vw' }} onHide={() => setVisibleUpdate(false)}>
                <form onSubmit={handleUpdate} className="flex flex-column gap-3">
                    <InputText placeholder="Namw of new file " value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />
                    <Button label="Save" type="submit" />
                </form>
            </Dialog>

            <Toast ref={toast} />
        </div>
    );
};

export default FilesDataView;