import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import axios from 'axios';
import { useRef } from 'react';
import React, { useState, useEffect } from 'react';
import { PickList } from 'primereact/picklist';
import UserProfile from './UserProfile';
import { FaTrashAlt } from 'react-icons/fa';
import "../Styles/Users.css";
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getConfig } from '../config';
import { Helmet } from 'react-helmet-async';

const Users = () => {
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.token);
    const { user } = useSelector((state) => state.token);
    const [source, setSource] = useState([]);
    const [target, setTarget] = useState([]);
    const toast = useRef(null)
    const [sourceSelection, setSourceSelection] = useState([]);
    const [targetSelection, setTargetSelection] = useState([]);
    const apiUrl = getConfig().API_URL;

    const getUsers = async () => {
        try {
            const res = await axios.get(`${apiUrl}api/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 200) {
                const confirmedUsers = res.data.filter(user => (user.confirm === true && user.roles !== 'Admin'));
                const notConfirmedUsers = res.data.filter(user => (user.confirm === false && user.roles !== 'Admin'));
                setSource(notConfirmedUsers);
                setTarget(confirmedUsers);
            }
        } catch (e) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error loading users', life: 3000 });
        }
    };

    const createUser = async (nameRef, emailRef, phoneRef, passwordRef) => {
        const newUser = {
            name: nameRef.current.value ? nameRef.current.value : " ",
            email: emailRef.current.value ? emailRef.current.value : "",
            phone: phoneRef.current.value ? phoneRef.current.value : " ",
            password: passwordRef.current.value ? passwordRef.current.value : " "
        };
        try {
            const res = await axios.post(`${apiUrl}api/user`, newUser, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 200 || res.status === 201) {
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'User created successfully', life: 3000 });
                navigate('/login');
            }
        } catch (e) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error loading/deleting/confirming user', life: 3000 });
        }
    };

    const confirmDeleteUser = (id) => {
        confirmDialog({
            message: 'Are you sure you want to delete this user?',
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            accept: () => deleteUser(id),
            reject: () => {
                toast.current.show({ severity: 'info', summary: 'Cancelled', detail: 'Deletion canceled', life: 3000 });
            }
        });
    };

    const deleteUser = async (id) => {
        try {
            const res = await axios.delete(`${apiUrl}api/user/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 200) {
                setSource(prevSource => prevSource.filter(user => user._id !== res.data._id));
                setTarget(prevTarget => prevTarget.filter(user => user._id !== res.data._id));
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'User deleted', life: 3000 });
            }
        } catch (e) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error loading/deleting/confirming user', life: 3000 });
        }
    };

    const confirmUser = async (id) => {
        try {
            const _id = id;
            const res = await axios.put(`${apiUrl}api/user/confirm`, { _id }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 200) {
            }
        } catch (e) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error loading/deleting/confirming user', life: 3000 });
        }
    }

    const onChange = (event) => {
        const movedToTarget = event.target.filter(user => !target.some(u => u._id === user._id));
        const movedToSource = event.source.filter(user => !source.some(u => u._id === user._id));
        movedToTarget.forEach(user => confirmUser(user._id));
        movedToSource.forEach(user => confirmUser(user._id));
        setSource(event.source);
        setTarget(event.target);
        setSourceSelection([]);
        setTargetSelection([]);
    };

    const itemTemplate = (item) => {
        return (
            <div className="flex flex-wrap p-2 align-items-center gap-3">
                <UserProfile name={item.name}></UserProfile>
                <span className="font-semibold">{item.email}</span>
                <span className="font-semibold">{item.phone}</span>
                <FaTrashAlt size={20} className="delete-icon" onClick={() => confirmDeleteUser(item._id)} />
            </div>
        );
    };

    useEffect(() => {
        getUsers();
    }, []);

    return (
        <div className="card">
            <Helmet>
                <title>{`aTsBooks | User Management`}</title>
                <meta name="description" content="Admin dashboard: view, approve, and manage all registered users. Includes both approved and pending accounts." />
                <meta name="robots" content="noindex, nofollow" />
                <meta property="og:title" content="Admin | Manage Users" />
                <meta property="og:description" content="Internal admin panel to manage user approvals and account statuses." />
                <meta property="og:type" content="website" />
            </Helmet>

            <Toast ref={toast} />
            <ConfirmDialog />
            <PickList
                dataKey="_id"
                source={source}
                target={target}
                onChange={onChange}
                itemTemplate={itemTemplate}
                selection={sourceSelection}
                onSelectionChange={(e) => {
                    setSourceSelection(e.sourceSelection);
                    setTargetSelection(e.targetSelection);
                }}
                filter
                filterBy="name"
                breakpoint="1280px"
                sourceHeader="Not Confirmed"
                targetHeader="Confirmed"
                sourceStyle={{ height: '24rem' }}
                targetStyle={{ height: '24rem' }}
                sourceFilterPlaceholder="Search by name"
                targetFilterPlaceholder="Search by name"
            />
        </div>
    );
};
export default Users;

