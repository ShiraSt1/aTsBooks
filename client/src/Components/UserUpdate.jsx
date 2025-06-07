import React, { useEffect, useRef, useState } from "react";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useNavigate } from 'react-router-dom';
import 'primeicons/primeicons.css';
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import { setToken, logOut } from '../redux/tokenSlice'
import { getConfig } from '../config';
import { Toast } from "primereact/toast";

const UpdateUser = (props) => {
    const navigate = useNavigate();
    const nameRef = useRef("");
    const emailRef = useRef("");
    const phoneRef = useRef("");
    const { token } = useSelector((state) => state.token);
    const { user } = useSelector((state) => state.token);
    const dispatch = useDispatch();
    const apiUrl = getConfig().API_URL;
    const toast = useRef(null);

    useEffect(() => {
        navigate('/');
    }, [user]);

    const updateUser = async () => {
        const updatedUser = {
            ...props.user,
            name: nameRef.current.value ? nameRef.current.value : props.user.name,
            email: emailRef.current.value ? emailRef.current.value : props.user.email,
            phone: phoneRef.current.value ? phoneRef.current.value : props.user.phone
        };
        try {
            const res = await axios.put(`${apiUrl}api/user`, updatedUser, {
                // const res = await axios.put(`${process.env.REACT_APP_API_URL}api/user`, updatedUser, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 200) {
                dispatch(setToken({ token: token, user: res.data }))
                props.onHide();
                navigate('/'); // מעבר לדף הבית
                toast.current.show({ severity: 'sucess', detail: 'Your details were updated.', life: 3000 });
            }
        } catch (e) {
            if (e.status === 401){
                toast.current.show({ severity: 'sucess', detail: 'This email has already an acount.', life: 3000 });
            }
            if (e.status === 409){
                toast.current.show({ severity: 'error', detail: 'feilds of email and name are required.', life: 3000 });
            }
            console.error("Error updating user:", e);
        }

    };

    return (
        <Dialog
            visible={props.visible}
            modal
            onHide={props.onHide}
            header="Update User"
        >
            <Toast ref={toast} />
            <div className="flex flex-column gap-3">
                <label>Name</label>
                <InputText ref={nameRef} defaultValue={props.user.name} />

                <label>Email</label>
                <InputText ref={emailRef} defaultValue={props.user.email} />

                <label>Phone</label>
                <InputText ref={phoneRef} defaultValue={props.user.phone} />

                <div className="flex justify-content-end gap-2 mt-4">
                    <Button label="Update" onClick={updateUser} />
                    <Button label="Cancel" onClick={props.onHide} className="p-button-secondary" />
                </div>
            </div>
        </Dialog>
    );
};

export default UpdateUser;
