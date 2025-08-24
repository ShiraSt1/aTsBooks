import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Password } from 'primereact/password';
import '../Styles/register.css'
import { ProgressSpinner } from 'primereact/progressspinner';
import { getConfig } from '../config';
import { Toast } from 'primereact/toast';
import { Helmet } from 'react-helmet-async';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const apiUrl = getConfig().API_URL;
    const [errors, setErrors] = useState({
        email: "",
        name: "",
        password: "",
        phone: "",
    });
    const toast = useRef(null);
    const [agreeToEmails, setAgreeToEmails] = useState(false); // ✅ Checkbox state
    const [emailConsentError, setEmailConsentError] = useState(''); // ✅ Error state for checkbox

    const createUser = async (name, email, phone, password) => {
        if (!agreeToEmails) {
            setEmailConsentError('You must agree to receive emails.');
            return;
        } else {
            setEmailConsentError('');
        }
        setLoading(true);
        const newUser = { name, email, phone, password };
        try {
            const res = await axios.post(`${apiUrl}api/user/register`, newUser);

            if (res.status === 409) {
                toast.current.show({ severity: 'error', detail: 'This email already has an acount.', life: 3000 });
            }

            else if (res.status === 200 || res.status === 201) {
                navigate('/login')
            }
        } catch (e) {
            toast.current.show({ severity: 'error', detail: 'An error acured while sighning up. Please try again later.', life: 3000 });
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
        email && name && password && agreeToEmails;

    return (
        <div className="register-page-container">
            <Helmet>
                <title>{`aTsBooks | Sign Up`}</title>
                <meta name="description" content="Create your free aTsBooks account to access English learning books, workbooks, audio files, and more." />
                <meta name="keywords" content="sign up, register, aTsBooks, create account, English learning access, free English books" />
                <meta property="og:title" content="Sign Up | aTsBooks" />
                <meta property="og:description" content="Join aTsBooks to access a full library of English learning resources for kids, teens, and adults." />
                <meta property="og:type" content="website" />
            </Helmet>

            <Toast ref={toast} />
            <div className="register-form-container">
                {loading && (
                    <div className="loading-container">
                        <ProgressSpinner style={{ width: '30px', height: '30px' }} />
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
                        {/*     value={password}
                        //     inputClassName="register-input"
                        //     onChange={(e) => validatePassword(e.target.value)}
                        //     placeholder="Enter your password"
                        //     toggleMask
                        //     feedback={false}
                         />*/}
                        <Password
                            value={password}
                            onChange={(e) => validatePassword(e.target.value)}
                            placeholder="Enter your password"
                            toggleMask
                            feedback={false}
                            className="register-password"
                            inputClassName="register-input"
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
                    {/* <small>*Your request to join will be sent to Tami Stern. You’ll receive an email once it’s approved.</small> */}
                    <div className="register-input-wrapper">
                        <label className="register-checkbox-label">
                            <input
                                type="checkbox"
                                checked={agreeToEmails}
                                onChange={(e) => {
                                    setAgreeToEmails(e.target.checked);
                                    if (e.target.checked) setEmailConsentError('');
                                }}
                            />
                            &nbsp; I agree to receive emails and updates.
                        </label>
                        {emailConsentError && <small className="register-error">{emailConsentError}</small>}
                    </div>
                    <button
                        type="button"
                        onClick={() => createUser(name, email, phone, password)}
                        className="register-button"
                        disabled={!isFormValid}>
                        Register
                    </button>
                    <small>*Your request to join will be sent to Tami Stern. You’ll receive an email once it’s approved.</small>
                </form>
            </div>
        </div>
    );
};

export default Register;