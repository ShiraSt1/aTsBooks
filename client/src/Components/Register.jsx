import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Password } from 'primereact/password';
import '../Styles/register.css'
import { ProgressSpinner } from 'primereact/progressspinner';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({
        email: "",
        name: "",
        password: "",
        phone: "",
    });

    const createUser = async (name, email, phone, password) => {
        setLoading(true);
        const newUser = { name, email, phone, password };
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}api/user/register`, newUser);

            if (res.status === 409) {
                alert("email exits")
            }

            else if (res.status === 200 || res.status === 201) {
                navigate('/login')
            }
        } catch (e) {
            alert("An error occurred while creating the user. Please try again later. Eror:", e);
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        validateEmail(email); //****
        validateName(name); //****
        validatePassword(password); //****
    }, [email, name, password]);

    const validateEmail = (value) => {
        setEmail(value);
        if (!value) {
            setErrors((prev) => ({ ...prev, email: "This field is required" }));
        } else if (!/^\S+@\S+\.\S+$/.test(value)) {
            setErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
        } else {
            setErrors((prev) => ({ ...prev, email: "" }));
        }
    };

    const validateName = (value) => {
        setName(value);
        if (!value) {
            setErrors((prev) => ({ ...prev, name: "This field is required" }));
        } else if (value.length < 4) {
            setErrors((prev) => ({ ...prev, name: "At least 4 characters required" }));
        } else {
            setErrors((prev) => ({ ...prev, name: "" }));
        }
    };

    const validatePassword = (value) => {
        setPassword(value);
        if (!value) {
            setErrors((prev) => ({ ...prev, password: "This field is required" }));
        } else if (value.length < 6) {
            setErrors((prev) => ({ ...prev, password: "Minimum 6 characters required" }));
        } else {
            setErrors((prev) => ({ ...prev, password: "" }));
        }
    };

    const validatePhone = (value) => {
        if (!/^\d*$/.test(value)) {
            setErrors((prev) => ({ ...prev, phone: "The phone number can only contain digits." }));
        } else if (value.length > 10) {
            setErrors((prev) => ({ ...prev, phone: "The phone number can contain up to 10 digits only." }));
        } else {
            setErrors((prev) => ({ ...prev, phone: "" }));
        }
        setPhone(value);
    };

    const isFormValid = Object.values(errors).every((error) => error === "") &&
        email && name && password;

    return (
        <div className="register-page-container">
            <div className="register-form-container">
                {loading && (
                    <div className="loading-container">
                        <ProgressSpinner style={{ width: '30px', height: '30px' }}/>
                        <p>Your request is being processed...</p>
                    </div>
                )}
                <h2 className="register-title">Create an Account</h2>
                <form className="register-form">
                    <div className="register-input-wrapper">
                        <label className="register-label">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => validateName(e.target.value)}
                            className="register-input"
                            placeholder="Enter your full name"
                        />
                        {errors.name && <small className="register-error">{errors.name}</small>}
                    </div>

                    <div className="register-input-wrapper">
                        <label className="register-label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => validateEmail(e.target.value)}
                            className="register-input"
                            placeholder="Enter your email address"
                        />
                        {errors.email && <small className="register-error">{errors.email}</small>}
                    </div>

                    <div className="register-input-wrapper">
                        <label className="register-label">Password</label>
                        <Password
                            value={password}
                            inputClassName="register-input"
                            onChange={(e) => validatePassword(e.target.value)}
                            placeholder="Enter your password"
                            toggleMask
                            feedback={false}
                        />
                        {errors.password && <small className="register-error">{errors.password}</small>}
                    </div>

                    <div className="register-input-wrapper">
                        <label className="register-label">Phone Number</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => validatePhone(e.target.value)}
                            className="register-input"
                            placeholder="Enter your phone number"
                        />
                        {errors.phone && <small className="register-error">{errors.phone}</small>}
                    </div>
                    <small>*Your request to join will be sent to the site administrator. You’ll receive an email once it’s approved.</small>
                    <button
                        type="button"
                        onClick={() => createUser(name, email, phone, password)}
                        className="register-button"
                        disabled={!isFormValid}>
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;