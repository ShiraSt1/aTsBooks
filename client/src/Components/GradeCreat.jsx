import React, { useState, useRef } from "react";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { AutoComplete } from "primereact/autocomplete";

const CreateGrade = (props) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const items = ['first grade', 'second grade', 'third grade', 'fourth grade', 'fifth grade', 'sixth grade', 'seventh grade', 'eighth grade','ninth grade','tenth grade','eleventh grade','twelfth grade'];
    const [filteredItems, setFilteredItems] = useState(null);
    const { createGrade, visibleCreatGrade } = props;
    const searchItems = (event) => {
        setFilteredItems(items);
    };
    const imageRef = useRef("");
    return (
        <Dialog
            visible={visibleCreatGrade}
            modal
            onHide={() => props.setVisibleCreatGrade(false)}
            style={{ width: '25rem', borderRadius: '8px' }} // התאמת רוחב הדיאלוג
            className="custom-dialog"
        >
            <div className="flex flex-column gap-4 p-4">
                {/* Name Input */}
                <div className="flex flex-column gap-2">
                    <label className="text-gray-700 font-medium">Name</label>
                    <AutoComplete
                        value={selectedItem}
                        suggestions={filteredItems}
                        completeMethod={searchItems}
                        virtualScrollerOptions={{ itemSize: 38 }}
                        dropdown
                        onChange={(e) => setSelectedItem(e.value)}
                        className="p-inputtext p-3 border border-gray-300 rounded-md w-full"
                    />
                </div>
                {/* Buttons */}
                <div className="flex justify-content-between gap-3">
                    <Button
                        label="Create"
                        onClick={(e) => { createGrade(selectedItem, imageRef); props.setVisibleCreatGrade(false); }}
                        className="bg-indigo-500 text-white px-5 py-2 rounded-md hover:bg-indigo-600"
                    />
                    <Button
                        label="Cancel"
                        onClick={() => props.setVisibleCreatGrade(false)}
                        className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600"
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default CreateGrade;