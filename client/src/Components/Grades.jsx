import { useEffect, useState, useRef } from "react"
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import axios from 'axios'
import Grade from "./Grade"
import CreateGrade from "./GradeCreat"
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { useSelector } from "react-redux";
import { Toast } from 'primereact/toast';
import '../Styles/Grades.css';

const Grades = () => {
    const { token } = useSelector((state) => state.token);
    const { user } = useSelector((state) => state.token);
    const [gradesData, setGradesData] = useState([])
    const [visibleCreatGrade, setVisibleCreatGrade] = useState(false);
    const toast = useRef(null);

    //GET - getAllGrades/
    const getGrades = async () => {
        try {
            const res = await axios.get('http://localhost:7000/api/grade')
            if (res.status === 200) {
                setGradesData(res.data)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const getGradeById = async (id) => {
        try {
            const res = await axios.get(`http://localhost:7000/api/grade/${id}`)
        } catch (e) {
            console.error(e)
        }
    }

    //******Grade - createGrade***** */
    const createGrade = async (selectedItem, imageRef) => {
        const newGrade = {
            name: selectedItem,
            image: imageRef.current.value ? imageRef.current.value : " "
        }
        try {
            const res = await axios.post('http://localhost:7000/api/grade', newGrade, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.status === 201) {
                getGrades()
            }
        }
        catch (e) {
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

    //********useEffect
    useEffect(() => {
        getGrades()
    }, [])

    const itemTemplate = (grade, index) => {
        if (!grade) {
            return;
        }
        return <Grade grade={grade} getGrades={getGrades} setGradesData={setGradesData} />;
    };

    const listTemplate = (gradesData) => {
        return <div className="grid grid-nogutter">{gradesData.map((grade, index) => itemTemplate(grade, index))}</div>;
    };

    return (<>
        <Toast ref={toast} />
        {user?.roles === "Admin" && (
            <Button icon="pi pi-plus" rounded aria-label="Filter" onClick={() => setVisibleCreatGrade(true)} className="add-button" />)}
        <CreateGrade createGrade={createGrade} setVisibleCreatGrade={setVisibleCreatGrade} visibleCreatGrade={visibleCreatGrade} />
        <div className="card">
            <DataView value={gradesData} listTemplate={listTemplate} />
        </div>
    </>)
}

export default Grades