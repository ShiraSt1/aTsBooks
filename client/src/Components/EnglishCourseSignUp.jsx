import React, { useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import axios from "axios";
// import { getConfig } from '../config';
import { Toast } from "primereact/toast";
import { Helmet } from 'react-helmet-async';
import api from '../api';

const EnglishCourseSignUp = () => {
  // const apiUrl = getConfig().API_URL;
  const toast = useRef(null);
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
      toast.current.show({ severity: 'error', detail: 'Please fill up all the fields', life: 3000 });
      return;
    }

    setLoading(true);
    setServerResponse(false)
    const formData = new FormData();
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    formData.append("email", form.email);
    formData.append("message", form.message);
    if (form.files) {
      form.files.forEach(file => formData.append("files", file));
    }
    try {
      // const res = await axios.post(`${apiUrl}api/course/register`, formData);
      const res = await api.post(`/api/course/register`, formData);
      if (res.status === 201 || res.status === 200) {
        setServerResponse(true);
      } else {
        toast.current.show({ severity: 'error', detail: `There was a problem sending your message.`, life: 3000 });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.current.show({ severity: 'error', detail: `There was a problem sending your message.`, life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-form-container">
      <Helmet>
        <title>{`aTsBooks | Contact Us`} </title>
        <meta name="description" content="Have a question or need help choosing the right English books? Contact us today – we're here to assist with orders, recommendations, and more." />
        <meta name="keywords" content="contact, get in touch, English books support, ESL help, English learning questions, customer service" />
        <meta property="og:title" content="Contact Us | We're Here to Help" />
        <meta property="og:description" content="Reach out with any questions about our English books, age levels, or orders. Fast and friendly support!" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Toast ref={toast} />
      <h1 className="signup-title">Contact Us</h1>
      <h3 className="signup-subtitle">
        Have any questions, comments, or feedback?
      </h3>
      <h3 className="signup-subtitle">
        Want to share your work with us?
      </h3>
      <h3 className="signup-subtitle">
        Send us a message — we’d love to hear from you!
      </h3>

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
            Attach files (optional)
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
                gap: '8px',
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