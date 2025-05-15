import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import axios from "axios";

const EnglishCourseSignUp = () => {

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message:""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverResponse, setServerResponse] = useState(false);

  const handleInputChange = (e, field) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
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

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}api/course/register`, form);
      if (res.status === 201) {
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
        Want to share your work with us?
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
          <ProgressSpinner />
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