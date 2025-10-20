import React, { useEffect, useState, useRef } from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getConfig } from '../config';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Titles = () => {
    // const location = useLocation();
    // const bookName= location.state?.bookName;
    // const bookId = location.state?.bookId;
    const { bookName, bookId } = useParams();
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
    const navigate = useNavigate();
    const apiUrl = getConfig().API_URL;
    const [isLoading, setIsLoading] = useState(false);
    const [loadingId, setLoadingId] = useState(null);

    const fetchBook = async () => {
        try {
            const res = await axios.get(`${apiUrl}api/book/${bookId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log("Book data:", res.data);

            setBook(res.data);

        } catch (err) {
            if (err.status === 400)
                toast?.current.show({ severity: 'error', summary: 'Error', detail: 'No book found', life: 3000 });
            console.error("error loading book:", err);
        }
    };

    const uploadFileToS3 = async (file) => {
        try {
            const res = await axios.post(`${apiUrl}api/file/presign`, {
                fileName: file.name,
                fileType: file.type
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const { url, key } = res.data;

            await axios.put(url, file, {
                headers: {
                    'Content-Type': file.type
                }
            });

            return key;
        } catch (err) {
            console.error("Error uploading to S3:", err);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Upload to S3 failed', life: 3000 });
            return null;
        }
    };

    useEffect(() => {
        fetchBook();
        fetchTitles();
    }, []);

    const fetchTitles = async () => {
        try {
            const res = await axios.get(`${apiUrl}api/title/getTitlesByBook/${bookId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const titles = res.data;
            const filesMap = {};

            for (const title of titles) {
                const filesRes = await axios.get(`${apiUrl}api/file/title/${title._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                filesMap[title._id] = filesRes.data;
            }

            setFilesByTitle(filesMap);

            const panelItems = titles.map(title => ({
                label: (
                    <div key={`${title._id}-${loadingId}`} className="flex items-center justify-between w-full px-1 py-2">
                        {/* כותרת */}
                        <span className="text-base leading-none">{title.name}</span>

                        {/* אייקונים מימין */}
                        <div className="flex items-center gap-2">
                            <Tooltip target={`.zip-icon-${title._id}`} content="Download all files" />
                            {/* אייקון הורדה */}
                            <i className={`pi pi-download text-blue-500 cursor-pointer text-blue-500 zip-icon-${title._id} ml-2`}
                                style={{ fontSize: '1.2rem', lineHeight: '1', display: 'inline-flex', alignItems: 'center', }}
                                onClick={(e) => { e.stopPropagation(); handleDownload(title._id) }}></i>
                            {/* כפתור הוספת קובץ – רק למנהל */}
                            {user?.roles === "Admin" && (
                                <i className={`pi pi-plus text-blue-500 cursor-pointer text-blue-500 ml-2`}
                                    style={{ fontSize: '1.2rem', lineHeight: '1', display: 'inline-flex', alignItems: 'center', }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setErrorMessage("");
                                        setUploadTitleId(title._id);
                                        setVisibleUpload(true);
                                    }}></i>
                            )}
                        </div>
                    </div>
                ),
                items: (filesMap[title._id] || []).map(file => ({
                    label: (
                        <div className="flex justify-between items-center w-full gap-2">
                            <span
                                style={{
                                    flexGrow: 1,
                                    minWidth: 0,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: 'block',
                                    marginTop: '1rem'
                                }}
                                title={file.name}
                            >
                                {file.name.length > 30 ? file.name.slice(0, 30) + '...' : file.name}
                            </span>

                            <span className="flex gap-2">
                                <Button icon="pi pi-eye" rounded text size="small" onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/fileview/${file._id}`);
                                }} />
                                <Button icon="pi pi-download" rounded text size="small" onClick={(e) => {
                                    setIsLoading(true);
                                    e.stopPropagation();
                                    window.open(`${apiUrl}api/file/download/${file._id}?name=${file.customName || file.name}`, '_blank');
                                    setIsLoading(false);
                                }} />
                                {user?.roles === "Admin" && (
                                    <Button icon="pi pi-trash" rounded text size="small" severity="danger" onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(file._id, title._id);
                                    }} />
                                )}
                            </span>
                        </div>
                    )
                }))
            }));

            setItems(panelItems);
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error loading titles', life: 3000 });
        }
    };

    const handleDelete = async (fileId, titleId) => {
        try {
            await axios.delete(`${apiUrl}api/file/${fileId}`, {
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

    const handleUpload = async () => {
        if (!selectedFile || !uploadTitleId) return;

        setIsLoading(true)
        const s3Key = await uploadFileToS3(selectedFile);
        if (!s3Key) return;

        const fileUrl = `https://${process.env.REACT_APP_S3_BUCKET}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/${s3Key}`;

        try {
            await axios.post(`${apiUrl}api/file/save-metadata`, {
                title: uploadTitleId,
                name: selectedFile.name,
                customName: newFileName,
                s3Key,
                url: fileUrl,
                size: Number((selectedFile.size / 1024).toFixed(2))
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            fetchTitles();
            setVisibleUpload(false);
            setNewFileName('');
            setSelectedFile(null);
            setFilePreview('');
            toast.current?.show({ severity: 'success', summary: 'Uploaded', detail: 'File uploaded successfully', life: 2000 });
        } catch (err) {
            console.error("Error saving metadata:", err);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Saving file failed', life: 3000 });
        } finally {
            setIsLoading(false)
        }
    };

    const handleDownload = async (titleId) => {
        try {
            setLoadingId(titleId);
            const res = await axios.get(`${apiUrl}api/download-zip/${titleId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const { downloadUrl } = res.data;
            window.open(downloadUrl, '_blank');
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to download', life: 3000 });
        } finally {
            setLoadingId(null);
        }
    };

    const [filePreview, setFilePreview] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    /*מכאן זה טיפול בהערה שקופצת למשתמש */
    // const NoticeCard = () => (
    //     <div className="notice-card" dir="ltr" style={{ width: '100%', maxWidth: 560, textAlign: 'left' }}>
    //         <div className="flex align-items-center">
    //             <span className="notice-icon">
    //                 <i className="pi pi-info-circle" style={{ fontSize: '1rem', color: '#3b82f6' }} />
    //             </span>
    //             <h3 className="notice-title m-0">For your attention</h3>
    //         </div>
    //         <div className="notice-body">
    //             <p>
    //                 All tests, photocopies, and materials - other than the official books, workbooks, and the
    //                 teacher’s guide - are created and shared by teachers. We do not take any responsibility for
    //                 these materials.
    //             </p>
    //             <p>
    //                 We would be happy to receive any new tests or other materials you may have and share them with others.
    //             </p>
    //         </div>
    //     </div>
    // );

    const NOTICE_KEY = `notice_${user?._id || 'anon'}_v1`;

    const [showNotice, setShowNotice] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        try {
          const val = localStorage.getItem(NOTICE_KEY);
          // אם אין ערך בכלל — מציגים כברירת מחדל
          setShowNotice(val === null ? true : val !== '0');
        } catch {}
      }, [user?._id,NOTICE_KEY]);
      

    const handleCloseNotice = () => {
        try {
            if (dontShowAgain) localStorage.setItem(NOTICE_KEY, '0'); // 0 = אל תציג יותר
        } catch { }
        setShowNotice(false);
    };

    return (
        <div className="p-4 ">
            <Helmet>
                <title>{`aTsBooks${bookName ? ' | ' + bookName : ''}`}</title>
                <meta name="description" content={`Explore all resources for "${bookName}": workbook, teachers guide, tests, audio files, videos, and more.`} />
                <meta name="keywords" content={`${bookName}, English book, workbook, audio files, ESL resources, tests, videos`} />
                <meta property="og:title" content={`${bookName} | Complete English Resource Kit`} />
                <meta property="og:description" content={`Get access to all materials related to "${bookName}" — perfect for teachers, and self-learners.`} />
                <meta property="og:type" content="article" />
            </Helmet>
            {book && (
                <div className="flex items-center justify-center gap-4 mb-4 w-full">
                    <h2 className="m-0" style={{ paddingLeft: '45%' }}>{bookName}</h2>
                    {loadingId && (
                        <div className="flex items-center">
                            <div className="custom-spinner" />
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-column md:flex-row gap-4">
                {/* תמונת הספר בצד שמאל */}
                {book?.image && (
                    <div className="flex justify-content-center md:w-4">
                        <img
                            src={book.image}
                            alt="Book"
                            className="border-round shadow-2"
                            style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                        />
                    </div>
                )}
                {/* כותרות בצד ימין */}
                <div className="flex-grow-1">
                    <PanelMenu key={loadingId} model={items} className="w-full md:w-30rem" />
                </div>
            </div>

            {/* שמאל: תמונת הספר */}
            {/* אמצע: רשימות הקבצים */}
            {/* ימין: תיבת ההערה */}
            {/* <div className="flex flex-column md:flex-row gap-4">
                {book?.image && (
                    <div className="flex justify-content-center md:w-4">
                        <img
                            src={book.image}
                            alt="Book"
                            className="border-round shadow-2"
                            style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                        />
                    </div>
                )}

                <div className="flex-grow-1 md:w-6">
                    <PanelMenu key={loadingId} model={items} className="w-full md:w-30rem" />
                </div>

                <aside className="notice-wrap md:w-6">
                    <div className="notice-card" dir="ltr" style={{ minWidth: 280, maxWidth: 380, textAlign: 'left' }}>
                        <div className="flex align-items-center">
                            <span className="notice-icon">
                                <i className="pi pi-info-circle" style={{ fontSize: '1rem', color: '#3b82f6' }} />
                            </span>
                            <h3 className="notice-title">For your attention</h3>
                        </div>
                        <div className="notice-body">
                            <p>
                                All tests, photocopies, and materials - other than the official books, workbooks, and the
                                teacher’s guide - are created and shared by teachers. We do not take any responsibility for
                                these materials.
                            </p>
                            <p>
                                We would be happy to receive any new tests or other materials you may have and share them with others.
                            </p>
                        </div>
                    </div>
                </aside>
            </div> */}


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
                    {errorMessage && (
                        <div style={{ color: 'red', marginTop: '8px' }}>
                            {errorMessage}
                        </div>
                    )}
                    <FileUpload
                        mode="basic"
                        auto={false} // ביטול העלאה אוטומטית
                        customUpload
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
                            onClick={() => {
                                if (selectedFile) {
                                    handleUpload({ files: [selectedFile] }); // קריאה ל-handleUpload עם הקובץ הנבחר
                                } else {
                                    toast.current?.show({ severity: 'warn', summary: 'Error', detail: 'Press upload below', life: 3000 });
                                }
                            }}
                            disabled={isLoading}
                            className="p-button-primary"
                            style={{ width: '40%', position: 'relative' }}
                        >
                            {isLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '0.5rem', marginTop: '1rem' }}>
                                    <ProgressSpinner
                                        style={{ width: '20px', height: '20px' }}
                                        strokeWidth="4"
                                    />
                                    <span>Loading</span>
                                </div>
                            ) : (
                                <span>Upload</span>
                            )}
                        </Button>
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

            {/* Dialog: הודעת תשומת לב */}
            <Dialog
                visible={showNotice}
                onHide={handleCloseNotice}
                modal
                blockScroll
                dismissableMask={false}
                showHeader={false}        // לא להציג פס עליון לבן
                closable={false}          // לא להציג X מובנה
                style={{ width: '680px', maxWidth: '95vw', background: 'transparent', boxShadow: 'none' }}
                contentStyle={{ background: 'transparent', padding: 0, overflow: 'visible' }}
            >
                {/* אותו עיצוב בדיוק – משתמשים בקומפוננטה הממוחזרת כדי למנוע כפילות */}
                <div className="notice-card" dir="ltr" style={{ width: '100%', textAlign: 'left' }}>
                    <div className="flex align-items-center justify-content-between">
                        <div className="flex align-items-center">
                            <span className="notice-icon">
                                <i className="pi pi-info-circle" style={{ fontSize: '1rem', color: '#3b82f6' }} />
                            </span>
                            <h3 className="notice-title m-0">For your attention</h3>
                        </div>
                    </div>

                    <div className="notice-body">
                        <p>
                            All tests, photocopies, and materials — other than the official books, workbooks, and the
                            teacher’s guide — are created and shared by teachers. We do not take any responsibility for
                            these materials.
                        </p>
                        <p>
                            We would be happy to receive any new tests or other materials you may have and share them with others.
                        </p>
                    </div>

                    {/* שורת פעולות */}
                    <div className="flex align-items-center justify-content-between mt-3">
                        <label className="flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                            <input
                                id="dontShowAgain"
                                type="checkbox"
                                checked={dontShowAgain}
                                onChange={(e) => setDontShowAgain(e.target.checked)}
                            />
                            <span>Don’t show this again</span>
                        </label>

                        <Button
                            label="Got it"
                            onClick={handleCloseNotice}
                            className="p-button-primary"
                        />
                    </div>
                </div>
            </Dialog>

            <Toast ref={toast} />

        </div>
    );
};

export default Titles;