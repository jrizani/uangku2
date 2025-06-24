import {useEffect, useRef, useState} from "react";

export const SearchableDropdown = ({
                                       label,
                                       items,
                                       selectedId,
                                       onSelect,
                                       onFocus,
                                       placeholder,
                                       onAddNew,
                                       canAddNew = false
                                   }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const selectedItem = items.find(item => item.id === selectedId);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filteredItems = searchTerm ? items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())) : items;

    const handleSelect = (item) => {
        onSelect(item.id);
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleAddNewClick = () => {
        if (searchTerm) {
            onAddNew(searchTerm);
            setSearchTerm('');
            setIsOpen(false);
        }
    }

    const displayValue = selectedItem?.display || selectedItem?.name || '';

    return (<div className="relative" ref={wrapperRef}><label
        className="block text-sm font-medium text-gray-600 mb-1">{label}</label>

        <div
            className="w-full text-left px-4 py-3 bg-gray-50 border rounded-lg cursor-pointer flex justify-between items-center"
            onClick={() => {
                if (!isOpen) {
                    setIsOpen(true);
                    if (onFocus) onFocus();
                }
            }}
        >
            {isOpen ? (
                <input
                    type="text"
                    autoFocus
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent outline-none"
                />
            ) : (
                <div className="w-full min-h-[1.5em]">{displayValue || <span className="text-gray-400">{placeholder}</span>}</div>
            )}
        </div>

        {isOpen && (
            <div className="absolute z-20 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                <ul>{filteredItems.map(item => <li key={item.id} onClick={() => handleSelect(item)}
                                                   className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{item.display || item.name}</li>)}</ul>
                {canAddNew && searchTerm && !filteredItems.some(i => i.name.toLowerCase() === searchTerm.toLowerCase()) && (
                    <div className="p-2 border-t">
                        <button onClick={handleAddNewClick} className="w-full text-left px-2 py-1 text-blue-600">Tambah:
                            "{searchTerm}"
                        </button>
                    </div>)}</div>)}</div>);
}