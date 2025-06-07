import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { getConfig } from '../config';
import { Toast } from 'primereact/toast';

const FileView = () => {
  const { fileId } = useParams();
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.token);
  const { user } = useSelector((state) => state.token);
  const apiUrl = getConfig().API_URL;
  const toast = useRef(null);

  useEffect(() => {
    if (fileId)
      fetchFile()
  }, [fileId]);

  const fetchFile = async () => {
    try {
      // קריאת שרת עם headers
      const response = await axios.get(`${apiUrl}api/file/view/${fileId}`, {
        // const response = await axios.get(`${process.env.REACT_APP_API_URL}api/file/view/${fileId}`, {
        headers: { 'Authorization': `Bearer ${token}` }, // הוספת הטוקן ב-Headers
        responseType: 'blob', // טיפוס blob עבור קבצים
      });
      // יצירת URL זמני מה-blob
      const url = URL.createObjectURL(response.data);
      setFileUrl(url);
      setLoading(false);
      const extension = fileId.split('.').pop().toLowerCase();
      if (['mp4', 'webm'].includes(extension)) setFileType('video');
      else if (['mp3', 'wav', 'ogg'].includes(extension)) setFileType('audio');
      else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) setFileType('image');
      else if (['pdf'].includes(extension)) setFileType('pdf');
      else if (['txt', 'doc', 'docx'].includes(extension)) setFileType('document');
      else setFileType('iframe');
    }
    catch (err) {
      console.error("Error in loading file", err);
      toast.current.show({ severity: 'error', detail: 'Error in loading file.', life: 3000 });
      setLoading(false);
    }
  }

  const renderFile = () => {
    switch (fileType) {
      case 'video':
        return (
          <video controls width="100%" height="100%">
            <source src={fileUrl} type="video/mp4" />
            Your browser does not support video files.
          </video>
        );
      case 'audio':
        return (
          <audio controls style={{ width: '100%' }}>
            <source src={fileUrl} type="audio/mpeg" />
            Your browser does not support audio files.
          </audio>
        );
      case 'image':
        return <img src={fileUrl} alt="תמונה" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
      case 'pdf':
        return (
          <iframe
            src={fileUrl}
            title="PDF view"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              toast.current.show({ severity: 'error', detail: 'Error in loading file.', life: 3000 });
            }}
          />
        );
      case 'document':
        return (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
            title="File view "
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        );
      default:
        return (
          <iframe
            src={fileUrl}
            title="File view"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              toast.current.show({ severity: 'error', detail: 'Error in loading file.', life: 3000 });
            }}
          />
        );
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      <Toast ref={toast} />

      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
          width: '100%',
          maxWidth: '1000px',
          height: '80vh',
          overflow: 'hidden',
          backgroundColor: '#f9f9f9',
          position: 'relative',
        }}
      >
        {loading && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: '#f9f9f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10
          }}>
            Loading file...
          </div>
        )}
        {renderFile()}
      </div>
    </div>
  );
}
export default FileView;

