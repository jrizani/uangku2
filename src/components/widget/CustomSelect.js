import React, {useEffect, useRef, useState} from "react";
import {ChevronDownIcon} from "../../utils/icons";

export const CustomSelect = ({label, options, selectedId, onSelect, onFocus}) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const selectedItem = options.find(item => item.id === selectedId);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (item) => {
        onSelect(item.id);
        setIsOpen(false);
    };

    return (<div className="relative" ref={wrapperRef}><label
        className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <button type="button" onClick={() => setIsOpen(prev => !prev)} onFocus={onFocus}
                className="w-full text-left px-4 py-3 bg-gray-50 border rounded-lg cursor-pointer flex justify-between items-center">
            <span>{selectedItem?.name || `Pilih ${label.toLowerCase()}`}</span><ChevronDownIcon/></button>
        {isOpen && (
            <div className="absolute z-20 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                <ul>{options.map(item => <li key={item.id} onClick={() => handleSelect(item)}
                                             className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{item.name}</li>)}</ul>
            </div>)}</div>);
}