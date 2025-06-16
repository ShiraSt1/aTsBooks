import React, { useEffect, useState, useRef } from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getConfig } from '../config';

const Titles = () => {
    const [items, setItems] = useState([]);
    const [visibleUpload, setVisibleUpload] = useState(false);
    const [uploadTitleId, setUploadTitleId] = useState(null);
    const [newFileName, setNewFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filesByTitle, setFilesByTitle] = useState({});
    const [book, setBook] = useState(null);
    const { token } = useSelector((state) => state.token);
    const { user } = useSelector((state) => state.token);
    const toast = useRef(null);
    const { bookId } = useParams();
    const navigate = useNavigate();
    const apiUrl = getConfig().API_URL;

    const fetchBook = async () => {
        try {
            const res = await axios.get(`${apiUrl}api/book/${bookId}`, {
                // const res = await axios.get(`${process.env.REACT_APP_API_URL}api/book/${bookId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBook(res.data);
        } catch (err) {
            if (err.status === 400)
                toast?.current.show({ severity: 'error', summary: 'Error', detail: 'No book found', life: 3000 });
            console.error("error loading book:", err);
        }
    };

    useEffect(() => {
        fetchBook();
        fetchTitles();
    }, []);

    const fetchTitles = async () => {
        try {
            const res = await axios.get(`${apiUrl}api/title/getTitlesByBook/${bookId}`, {
                // const res = await axios.get(`${process.env.REACT_APP_API_URL}api/title/getTitlesByBook/${bookId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const titles = res.data;
            const filesMap = {};
            for (const title of titles) {
                const filesRes = await axios.get(`${apiUrl}api/file/title/${title._id}`, {
                    // const filesRes = await axios.get(`${process.env.REACT_APP_API_URL}api/file/title/${title._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                filesMap[title._id] = filesRes.data;
            }
            setFilesByTitle(filesMap);
            const panelItems = titles.map(title => ({
                label: (
                    <div className="flex justify-between align-items-center w-full">
                        <span>{title.name}</span>
                        {user?.roles === "Admin" && (<>
                            <Button icon="pi pi-plus" rounded text size="small" onClick={(e) => {
                                e.stopPropagation();
                                setUploadTitleId(title._id);
                                setVisibleUpload(true);
                            }} /></>)}
                    </div>
                ),
                items: (filesMap[title._id] || []).map(file => ({
                    label: (
                        <div className="flex justify-between align-items-center w-full gap-2">
                            <span
                                style={{
                                    maxWidth: '30%', // חצי מהרוחב של השורה
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                                title={file.name} // מציג את השם המלא כ-tooltip על מעבר עכבר
                            >
                                {file.name}
                            </span>
                            <span className="flex gap-2">
                                <Button icon="pi pi-eye" rounded text size="small" onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/fileview/${file._id}`);
                                }} />
                                <Button icon="pi pi-download" rounded text size="small" onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`${apiUrl}api/file/download/${file._id}?name=${file.customName || file.name}`, '_blank'
                                        // window.open(`${process.env.REACT_APP_API_URL}api/file/download/${file._id}?name=${file.customName || file.name}`, '_blank'
                                    );
                                }} />
                                {user?.roles === "Admin" && (<>
                                    <Button icon="pi pi-trash" rounded text size="small" severity="danger" onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(file._id, title._id);
                                    }} /></>)}
                            </span>
                        </div>
                    )
                }))
            }));
            setItems(panelItems);
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error loading', life: 3000 });
        }
    };

    const handleDelete = async (fileId, titleId) => {
        try {
            await axios.delete(`${apiUrl}api/file/${fileId}`, {
                // await axios.delete(`${process.env.REACT_APP_API_URL}api/file/${fileId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFilesByTitle(prev => ({
                ...prev,
                [titleId]: prev[titleId].filter(f => f._id !== fileId)
            }));
            fetchTitles();
            toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'File deleted successfuly', life: 2000 });
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error deleting', life: 3000 });
        }
    };

    const handleUpload = async ({ files }) => {
        
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', uploadTitleId);
        formData.append('customName', newFileName); // שליחת שם מותאם אישית

        try {
            await axios.post(`${apiUrl}api/file`, formData, {
                // await axios.post(`${process.env.REACT_APP_API_URL}api/file`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
            });
            fetchTitles();
            setVisibleUpload(false);
            setNewFileName('');

            toast.current?.show({ severity: 'success', summary: 'Uploaded', detail: 'File uploaded successfuly', life: 2000 });
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Upload failed', life: 3000 });
        }
    };

    const [filePreview, setFilePreview] = useState(''); // תצוגה מקדימה של שם הקובץ הנבחר

    return (
        <div className="p-4">
            {book && (
                <h2 className="text-center mb-4">{book.name}</h2>
            )}
            <div className="flex flex-column md:flex-row gap-4">
                {/* תמונת הספר בצד שמאל */}
                {book?.image && (
                    <div className="flex justify-content-center md:w-4">
                        <img
                            src={`${apiUrl}${book.image}`}
                            // src={`${process.env.REACT_APP_API_URL}${book.image}`}
                            alt="Book"
                            className="border-round shadow-2"
                            style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                        />
                    </div>
                )}
                {/* כותרות בצד ימין */}
                <div className="flex-grow-1">

                    <PanelMenu model={items} className="w-full md:w-30rem" />
                </div>
            </div>
            <Dialog
                header="Upload new file"
                visible={visibleUpload}
                onHide={() => {
                    setVisibleUpload(false);
                    setSelectedFile(null); // איפוס הקובץ הנבחר אם החלון נסגר
                    setFilePreview(''); // איפוס תצוגת שם הקובץ
                }}
                style={{ width: '30rem', borderRadius: '8px', textAlign: 'center' }}
                className="custom-upload-dialog"
            >
                <div className="flex flex-column gap-4" style={{ padding: '1.5rem' }}>
                    <label htmlFor="fileName" className="font-medium" style={{ textAlign: 'left' }}>
                        File name
                    </label>
                    <InputText
                        id="fileName"
                        placeholder="Enter file name"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="p-inputtext-lg"
                        style={{ borderRadius: '6px', width: '100%' }}
                    />
                    <FileUpload
                        mode="basic"
                        auto={false} // ביטול העלאה אוטומטית
                        customUpload
                        // uploadHandler={handleUpload}
                        chooseLabel="Choose file"
                        uploadHandler={({ files }) => {
                            setSelectedFile(files[0]); // שמירת הקובץ הנבחר ב-state זמני
                            setFilePreview(files[0]?.name || ''); // הצגת שם הקובץ הנבחר
                        }}
                        className="p-button-primary"
                        style={{ width: '100%' }}

                    />
                    {filePreview && (
                        <div style={{ textAlign: 'left', fontSize: '0.9rem', color: '#555' }}>
                            <strong>Selected file:</strong> {filePreview}
                        </div>
                    )}
                    <div className="flex justify-content-center gap-3">
                        <Button
                            label="Upload"
                            onClick={() => {
                                if (selectedFile) {
                                    handleUpload({ files: [selectedFile] }); // קריאה ל-handleUpload עם הקובץ הנבחר
                                } else {
                                    toast.current?.show({ severity: 'warn', summary: 'Error', detail: 'Press upload below', life: 3000 });
                                }
                            }}
                            className="p-button-primary"
                            style={{ width: '40%' }}
                        />
                        <Button
                            label="Cancel"
                            onClick={() => {
                                setVisibleUpload(false);
                                setSelectedFile(null); // איפוס הקובץ הנבחר
                                setFilePreview(''); // איפוס שם הקובץ
                            }}
                            className="p-button-secondary"
                            style={{ width: '40%' }}
                        />
                    </div>
                </div>
            </Dialog>
            <Toast ref={toast} />
        </div>
    );
};

export default Titles;