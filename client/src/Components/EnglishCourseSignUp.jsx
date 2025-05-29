import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import axios from "axios";
import { getConfig } from '../config';

const EnglishCourseSignUp = () => {
  const apiUrl = getConfig().API_URL;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    files: []
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverResponse, setServerResponse] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState([]);

  const handleInputChange = (e, field) => {
    if (field === 'files') {
      const filesArray = Array.from(e.target.files);
      setSelectedFileName(filesArray.map(file => file.name));
      setForm(prev => ({ ...prev, files: filesArray }));
    } else {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  const SentRequestForJoinTheCourse = async () => {
    setSubmitted(true);
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.message
    ) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    formData.append("email", form.email);
    formData.append("message", form.message);
    if (form.files) {
      form.files.forEach(file => {
        formData.append("files", file);
      });
    }
    try {
      const res = await axios.post(`${apiUrl}api/course/register`, formData, {
        // const res = await axios.post(`${process.env.REACT_APP_API_URL}api/course/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      if (res.status === 201 || res.status === 200) {
        setServerResponse(true);
      } else {
        alert("There was a problem sending your message. ❌");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error sending message ❗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-form-container">
      <h1 className="signup-title">Contact Us</h1>
      <p className="signup-subtitle">
        Have any questions, comments, or feedback?
      </p>
      <p className="signup-subtitle">
        Want to share your work with us?
      </p>
      <p className="signup-subtitle">
        Send us a message — we’d love to hear from you!
      </p>

      <div className="signup-form">
        {[["firstName", "What's your first name?"],
        ["lastName", "And your last name?"],
        ["email", "What's your email? "],
        ["message", "What would you like to tell us?"]
        ].map(([field, label]) => (
          <div className="form-field" key={field}>
            <label htmlFor={field} className="cute-label">
              {label}
            </label>
            <InputText
              id={field}
              placeholder={`Type your ${field}`}
              value={form[field]}
              onChange={(e) => handleInputChange(e, field)}
              className={`cute-input ${submitted && !form[field] ? "p-invalid" : ""}`}
            />
            {submitted && !form[field] && (
              <small className="p-error">This field is required</small>
            )}
          </div>
        ))}

        <div className="form-field">
          <label htmlFor="fileUpload" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Atach files (optional)
          </label>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <label
              htmlFor="fileUpload"
              style={{
                color: 'green',
                padding: '10px 18px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                display: 'inline-block',
                transition: 'background-color 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px', // רווח בין האייקון לטקסט
              }}
            >
              <i className="pi pi-upload" style={{ fontSize: '1.2em' }}></i>
              Choose Files
            </label>

            <input
              type="file"
              id="fileUpload"
              name="file"
              multiple
              onChange={(e) => { handleInputChange(e, 'files') }}
              style={{
                display: 'none',
              }}
            />
          </div>

          {/* הצגת שם הקובץ שנבחר */}
          {selectedFileName.length > 0 && (
            <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#333' }}>
              Selected files:
              <ul>
                {selectedFileName.map((name, idx) => (
                  <li key={idx}><strong>{name}</strong></li>
                ))}
              </ul>
            </div>
          )}
        </div>


        <div className="form-field">
          <Button
            label="Be In Touch"
            icon="pi pi-send"
            className="cute-button"
            onClick={SentRequestForJoinTheCourse}
          />
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <ProgressSpinner style={{ width: '30px', height: '30px' }} />
          <p>Your request is being processed...</p>
        </div>
      )}

      {serverResponse && (
        <div className="response-container">
          <h2>Thank you for reaching out!</h2>
          <h3>We’ve received your message and will do our best to get back to you as soon as possible.</h3>
        </div>
      )}
    </div>
  );
};

export default EnglishCourseSignUp;