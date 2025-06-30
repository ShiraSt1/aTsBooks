import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Password } from 'primereact/password'; // Correct import for Password
import { setToken, logOut } from '../redux/tokenSlice'
import '../Styles/login.css'
import { ProgressSpinner } from 'primereact/progressspinner';
import { getConfig } from '../config';
import { Toast } from 'primereact/toast';
import { Helmet } from 'react-helmet-async';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [forgotPassword, setForgotPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [validationError, setValidationError] = useState('');
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.token);
    const [verificationStep, setVerificationStep] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const apiUrl = getConfig().API_URL;
    const toast = useRef(null);

    const handlePasswordReset = async () => {
        validatePassword(newPassword);
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        try {
            const res = await axios.post(`${apiUrl}api/user/reset-password-with-code`, {
                email,
                verificationCode,
                newPassword
            });
            if (res && res.status === 200) {
                dispatch(setToken({ token: res.data.accessToken, user: res.data.user }))
                navigate('/'); // ניווט אחרי השינוי
                setSuccessMessage('Password has been reset successfully. You can now log in.');
                setForgotPassword(false);
                setVerificationStep(false);
            }
        } catch (err) {
            setError('Failed to reset password. Please check the verification code and try again.');
        }
    };

    const sendVerificationCode = async () => {
        try {
            const res = await axios.post(`${apiUrl}api/user/send-verification-code`, { email });
            if (res && res.status === 200) {
                toast.current.show({ severity: 'info', detail: 'A verification code will be sent to your email.', life: 3000 });
                setVerificationStep(true);
                setSuccessMessage('Verification code has been sent to your email.');
            }
        } catch (err) {
            setError('Failed to send verification code. Please try again.');
        }
    };

    const login = async () => {
        setLoading(true);
        if (email && password) {
            try {
                const res = await axios.post(`${apiUrl}api/user/login`, { email, password });
                if (res && res.status === 200) {
                    dispatch(setToken({ token: res.data.accessToken, user: res.data.user }))
                    navigate('/');
                }
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    setError('Email does not have an acount.');
                } else if (err.response && err.response.status === 402) {
                    setError('Your password is not correct.');
                } else if (err.response && err.response.status === 403) {
                    setError('Your account has not been confirmed yet.');
                } else {
                    setError('An error occurred, please try again.');
                }
            } finally {
                setLoading(false);
            }
        } else {
            setError('Please fill in both email and password.');
        }
    };

    const validatePassword = (value) => {
        if (!value) {
            setValidationError('Password is required.');
        } else if (value.length < 6) {
            setValidationError('Password must be at least 6 characters long.');
        } else if (!/[A-Z]/.test(value)) {
            setValidationError('Password must contain at least one uppercase letter.');
        } else if (!/[a-z]/.test(value)) {
            setValidationError('Password must contain at least one lowercase letter.');
        } else if (!/[0-9]/.test(value)) {
            setValidationError('Password must contain at least one digit.');
        } else {
            setValidationError('');
        }
    };

    return (
        <div className="login-page-container">
            <Helmet>
                <title>{`aTsBooks | Login`}</title>
                <meta name="description" content="Log in to access your personal English learning materials, books, and resources on aTsBooks." />
                <meta name="robots" content="noindex, nofollow" />
                <meta property="og:title" content="Login | aTsBooks" />
                <meta property="og:description" content="Access your personalized English learning resources by logging in to your aTsBooks account." />
                <meta property="og:type" content="website" />
            </Helmet>

            <Toast ref={toast} />
            {loading && (
                <div className="loading-container">
                    <ProgressSpinner style={{ width: '30px', height: '30px' }} />
                    <p>Your request is being processed...</p>
                </div>
            )}
            <h2 className="login-title">Log in to ATS-books</h2>
            {!forgotPassword ? (
                <>
                    <div className="login-input-wrapper">
                        <label htmlFor="email" className="login-label">Email address</label>
                        <InputText
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="text"
                            className="login-input"
                        />
                    </div>
                    <div className="login-input-wrapper">
                        <label htmlFor="password" className="login-label">Password</label>
                        <InputText
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            className="login-input"
                        />
                    </div>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); setForgotPassword(true); }}
                        className="btn-secondary forgot-password-link"
                    >
                        Forgot Password?
                    </a>
                    <button onClick={login} className="login-button">
                        Login
                    </button>
                </>
            ) : verificationStep ? (
                <>
                    <div className="login-input-wrapper">
                        <label htmlFor="verification-code" className="login-label">Verification Code</label>
                        <InputText
                            id="verification-code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            type="text"
                            className="login-input"
                        />
                    </div>
                    <div className="login-input-wrapper">
                        <label htmlFor="new-password" className="login-label">New Password</label>
                        <Password
                            inputId="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            toggleMask
                            feedback={false}
                            className="login-input"
                        />
                    </div>
                    <div className="login-input-wrapper">
                        <label htmlFor="confirm-password" className="login-label">Confirm Password</label>
                        <Password
                            inputId="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            toggleMask
                            feedback={false}
                            className="login-input"
                        />
                    </div>
                    <button
                        onClick={handlePasswordReset}
                        className="login-button"
                    >
                        Reset Password
                    </button>
                </>
            ) : (
                <>
                    <div className="login-input-wrapper">
                        <label htmlFor="email" className="login-label">Email address</label>
                        <InputText
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="text"
                            className="login-input"
                        />
                    </div>
                    <button
                        onClick={sendVerificationCode}
                        className="login-button"
                    >
                        Send Verification Code
                    </button>
                </>
            )}
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
        </div>
    );
};

export default Login;