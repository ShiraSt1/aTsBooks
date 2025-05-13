import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import axios from "axios";

const EnglishCourseSignUp = () => {

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    schoolName: "",
    email: "",
    grade: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverResponse, setServerResponse] = useState(false);

  const grades = [3, 4, 5, 6, 7, 8].map((j) => ({
    label: `${j}th Grade`,
    value: `${j}th Grade`,
  }));

  const handleInputChange = (e, field) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const SentRequestForJoinTheCourse = async () => {
    setSubmitted(true);
    if (
      !form.firstName ||
      !form.lastName ||
      !form.schoolName ||
      !form.email ||
      !form.grade
    ) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true); // Show loading spinner

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}api/course/register`, form);
      if (res.status === 201) {
        setServerResponse(true);
        alert("Your request to join has been sent to the site administrator. You will receive an email notification when your request is approved.")
      } else {
        alert("There was a problem sending your request. ❌");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error sending request ❗");
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

 
  return (
    <div className="signup-form-container">
      <h1 className="signup-title">💌 Welcome to Take It Easy English Courses</h1>
      <p className="signup-subtitle">
        Let's get to know you better so we can help you shine 💫
      </p>

      <div className="signup-form">
        {[["firstName", "What's your first name? 🌟"],
        ["lastName", "And your last name? 🌈"],
        ["schoolName", "Where do you study? 🏫"],
        ["email", "What's your email? 📧"],
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
          <label htmlFor="grade" className="cute-label">
            What grade are you in? 🎓
          </label>
          <Dropdown
            id="grade"
            value={form.grade}
            options={grades}
            onChange={(e) => handleInputChange(e, "grade")}
            placeholder="Select your grade"
            className={`cute-dropdown ${submitted && !form.grade ? "p-invalid" : ""}`}
          />
          {submitted && !form.grade && (
            <small className="p-error">This field is required</small>
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