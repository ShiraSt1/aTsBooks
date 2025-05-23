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
    message: "",
    file: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverResponse, setServerResponse] = useState(false);

  const handleInputChange = (e, field) => {
    const value = field === "file" ? e.target.files[0] : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
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
    if (form.file) {
      formData.append("file", form.file);
    }
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}api/course/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
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

  const click =async () => {
    console.log("aa");
    try{
      console.log("dd");
      const res =await axios.get(`${process.env.REACT_APP_API_URL}api/course/click`);
      if (res.status === 200) {
        console.log("bb");
        alert("clicked in client");
      }
      else{
        console.log("ee");
      }
    }catch(err){
      console.log("cc");
      console.log("error in client", err);
    }
  }

  return (
    <div className="signup-form-container">
      <button onClick={()=>click()}>click me</button>
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
          <label htmlFor="fileUpload" className="cute-label">
            Upload a file (optional)
          </label>
          <input
            type="file"
            id="fileUpload"
            name="file"
            onChange={handleInputChange} // פונקציה שתעדכני ב-state
            className="cute-input"
          />
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