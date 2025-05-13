import React, { useRef, useState,useEffect } from "react";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { AutoComplete } from "primereact/autocomplete";

const UpdateGrade = (props) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const items = ['first grade', 'second grade', 'third grade', 'fourth grade', 'fifth grade', 'sixth grade', 'seventh grade', 'eighth grade'];
    const [filteredItems, setFilteredItems] = useState(null);
    const { updateGrade, visible, setVisible, grade } = props;
    const nameRef = useRef("");
    const imageRef = useRef("");

    useEffect(() => {
        if (grade) {
            setSelectedItem(grade.name); // הגדרת הכיתה הנוכחית
        }
    }, [grade]); // יפעל מחדש אם הערך של grade משתנה

    const searchItems = (event) => {
        setFilteredItems(items);
    };

    return (
        <Dialog
            visible={visible}
            modal
            header="Update Grade"
            style={{ width: '400px', borderRadius: '8px' }}
            onHide={() => setVisible(false)}
            onClick={(e) => e.stopPropagation()} // מונע את הפיכת הדיאלוג לקישור
        >
            <div className="flex flex-column gap-4" style={{ padding: '1rem' }}>
                <div className="flex flex-column gap-2">
                    <label htmlFor="name" className="font-medium">Name</label>
                    <AutoComplete
                        id="name"
                        value={selectedItem}
                        suggestions={filteredItems}
                        completeMethod={searchItems}
                        dropdown
                        onChange={(e) => setSelectedItem(e.value)}
                        placeholder="Select grade"
                        className="p-inputtext-sm"
                    />
                </div>
                <div className="flex justify-content-center gap-2">
                    <Button
                        label="Update"
                        onClick={(e) => {
                            e.stopPropagation()
                            updateGrade(selectedItem);
                            setVisible(false);
                        }}
                        className="p-button p-button-primary"
                    />
                    <Button
                        label="Cancel"
                        onClick={(e) => 
                            {e.stopPropagation()
                            setVisible(false)}}
                        className="p-button p-button-secondary"
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default UpdateGrade;