import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Password } from 'primereact/password';
import '../Styles/register.css'

const Register = () => {
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const [errors, setErrors] = useState({
        email: "",
        name: "",
        password: "",
        phone: "",
    });

    const createUser = async (name, email, phone, password) => {
        const newUser = {name,email,phone,password};
        try {
            const res = await axios.post('${process.env.REACT_APP_API_URL}api/user/register', newUser);
            console.log("server responded:", res?res.data:"no response");
            
            if (res.status === 409){
                console.log("duplicate email");
                alert("email exits")
            }
            else if (res.status === 200 || res.status === 201) {
                alert("Your request to join has been sent to the site administrator. You will receive an email notification when your request is approved.")
                navigate('../login')
            }
        } catch (e) {
            alert("An error occurred while creating the user. Please try again later. Eror:",e);
            console.error(e);
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

                    <button
                        onClick={() => createUser(name, email, phone, password)}
                        className="register-button"
                        disabled={!isFormValid}
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;