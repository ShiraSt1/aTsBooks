import { useState } from "react"
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { useRef } from 'react';
import UpdateGrade from "./GradeUpdate"
import 'primeicons/primeicons.css';
import axios from 'axios'
import '../Grade.css';
import { useSelector } from "react-redux";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { getConfig } from './config';

const Grade = (props) => {
    const [visible, setVisible] = useState(false);
    const toast = useRef(null);
    const toastDelete = useRef(null);
    const { token } = useSelector((state) => state.token);
    const { user } = useSelector((state) => state.token);
    const navigate = useNavigate();
    const apiUrl = getConfig().API_URL;

    //**********updateGrade
    const updateGrade = async (selectedItem, imageRef) => {
        const updatedGrade = {
            ...props.grade,
            name: selectedItem,
            // image: imageRef.current.value ? imageRef.current.value : props.grade.body,
        };
        try {
            const res = await axios.put(`${apiUrl}api/grade`, updatedGrade, {
                // const res = await axios.put(`${process.env.REACT_APP_API_URL}api/grade`, updatedGrade, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.status === 200) {
                props.setGradesData(res.data)
                if (toast?.current) {
                    toast.current.show({ severity: 'success', summary: 'Updated successfully', life: 3000 });
                }
            }
        } catch (e) {
            if (e.status === 409) {
                if (toast?.current) {
                    toast.current.show({ severity: 'error', summary: 'This grade alredy exits', life: 4000 });
                }
            }
            if (e.status === 400)
                if (toast?.current) {
                    toast.current.show({ severity: 'error', summary: 'Grade name is required', life: 4000 });
                }
            console.error(e)
        }
    }

    const [isLoading, setIsLoading] = useState(false);

    const deleteGrade = async (id) => {
        try {
            const res = await axios.delete(`${apiUrl}api/grade/${id}`, {
                // const res = await axios.delete(`${process.env.REACT_APP_API_URL}api/grade/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (Array.isArray(res.data)) {
                props.setGradesData(res.data);
                if (toast.current) {
                    toast.current.show({ severity: 'success', summary: 'Deleted successfuly', life: 3000 });
                }

            }
        } catch (e) {
            toast.current.show({
                severity: 'error',
                summary: 'Error deleting',
                detail: e.response?.data?.message || e.message,
                life: 4000
            });
        }
        finally {
            setIsLoading(false); // להחזיר את המצב לאחר סיום הפעולה
        }
    };

    const [iDdeleteBook, setIDdeleteBook] = useState(null);
    const [deletflage, setDeletflage] = useState(false);

    const footer = (
        <div className="card flex flex-wrap gap-2 justify-content-center">
            {user?.roles === "Admin" && (
                <>
                    <Button icon="pi pi-times" label="Delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            confirmPopup({
                                target: e.currentTarget,
                                message: 'Are you sure you want to delete the grade and all the files in it?',
                                icon: 'pi pi-exclamation-triangle',
                                defaultFocus: 'accept',
                                accept: () => {
                                    e.stopPropagation()
                                    deleteGrade(props.grade._id)
                                    setVisible(false);
                                },
                                reject: () => {
                                    e.stopPropagation()
                                    setVisible(false);
                                }
                            });
                        }} />

                    <Button label="Update" icon="pi pi-pencil" onClick={(e) => {
                        e.stopPropagation()
                        setVisible(true)
                    }} /></>)}
            <UpdateGrade updateGrade={updateGrade} setVisible={setVisible} visible={visible} grade={props.grade} />
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            <Toast ref={toastDelete} />
            <ConfirmPopup />
            <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2" key={props.grade._id}>
                <div
                    className="p-4 border-1 surface-border surface-card border-round"
                    onClick={(e) => { e.stopPropagation(); navigate(`/books/${props.grade._id}`) }}
                    style={{ cursor: 'pointer' }}>

                    <div className="flex flex-column align-items-center gap-3 py-5">
                        <img className="course-image" src={`/pictures/${props.grade.name}.png`} alt={props.grade.name} />
                        <div className="text-2xl font-bold">{props.grade.name}</div>
                    </div>
                    {footer}
                </div>
            </div>
        </>
    )
}
export default Grade