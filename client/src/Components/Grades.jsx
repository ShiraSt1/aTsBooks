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
import { getConfig } from '../config';
import { ProgressSpinner } from "primereact/progressspinner";
import { ProgressBar } from "primereact/progressbar";
import { Helmet } from 'react-helmet-async';

const Grades = () => {

    const { token } = useSelector((state) => state.token);
    const { user } = useSelector((state) => state.token);
    const [gradesData, setGradesData] = useState([])
    const [visibleCreatGrade, setVisibleCreatGrade] = useState(false);
    const toast = useRef(null);
    const apiUrl = getConfig().API_URL;
    const [compLoading, setCompLoading] = useState(false);

    const getGrades = async () => {
        try {
            const res = await axios.get(`${apiUrl}api/grade`)
            if (res.status === 200) {
                setGradesData(res.data)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const getGradeById = async (id) => {
        try {
            const res = await axios.get(`${apiUrl}api/grade/${id}`)
        } catch (e) {
            console.error(e)
        }
    }

    const createGrade = async (selectedItem, imageRef) => {
        const newGrade = {
            name: selectedItem,
            image: imageRef.current.value ? imageRef.current.value : " "
        }
        try {
            const res = await axios.post(`${apiUrl}api/grade`, newGrade, {
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

    useEffect(() => {
        const loadAll = async () => {
            setCompLoading(true)
            try {
                getGrades()
            } finally {
                setCompLoading(false)
            }
        }
        loadAll()
    }, [])

    const itemTemplate = (grade, index) => {
        if (!grade) {
            return;
        }
        return <Grade grade={grade} getGrades={getGrades} setGradesData={setGradesData} />;
    };

    const listTemplate = (gradesData) => {
        return <div className="grid grid-nogutter" >{gradesData.map((grade, index) => itemTemplate(grade, index))}</div>;
    };

    return (<>
        <Helmet>
            <title>{`aTsbooks | Grades`}</title>
            <meta name="description" content="Choose the right English books by selecting a grade. Personalized learning resources for kids, teens, and young learners." />
            <meta name="keywords" content="English books by grade, English by age group, ESL levels, English learning paths, books for kids, books for teens" />
            <meta property="og:title" content="Choose Age or Grade | Tailored English Learning" />
            <meta property="og:description" content="Pick a grade level or age group to explore English books designed for your learners' needs. Start the learning journey now!" />
            <meta property="og:type" content="website" />
        </Helmet>

        {compLoading ? (
            <div className="flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <div className="flex justify-center items-center gap-3 text-xl mt-6">
                    <div className="custom-spinner" />
                    <span>Loading, please wait...</span>
                </div>
            </div>
        ) : (<>
            <Toast ref={toast} />

            <h1 className="grade-header">Available Grades</h1> 

            {user?.roles === "Admin" && (
                <Button icon="pi pi-plus" rounded aria-label="Filter" onClick={() => setVisibleCreatGrade(true)} className="add-button" />)}
            <CreateGrade createGrade={createGrade} setVisibleCreatGrade={setVisibleCreatGrade} visibleCreatGrade={visibleCreatGrade} />
            <div className="card">
                <DataView value={gradesData} listTemplate={listTemplate} />
            </div>
        </>)}
    </>)
}

export default Grades