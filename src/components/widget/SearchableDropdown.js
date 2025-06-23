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
            handleSelect({id: searchTerm, name: searchTerm});
        }
    }

    return (<div className="relative" ref={wrapperRef}><label
        className="block text-sm font-medium text-gray-600 mb-1">{label}</label><input type="text"
                                                                                       value={isOpen ? searchTerm : selectedItem?.name || ''}
                                                                                       onChange={e => {
                                                                                           setSearchTerm(e.target.value);
                                                                                           if (selectedItem) onSelect(null);
                                                                                       }} onFocus={() => {
        setIsOpen(true);
        onFocus();
    }} placeholder={placeholder} className="w-full px-4 py-3 bg-gray-50 border rounded-lg cursor-pointer"/>{isOpen && (
        <div className="absolute z-20 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
            <ul>{filteredItems.map(item => <li key={item.id} onClick={() => handleSelect(item)}
                                               className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{item.name}</li>)}</ul>
            {canAddNew && searchTerm && !filteredItems.some(i => i.name.toLowerCase() === searchTerm.toLowerCase()) && (
                <div className="p-2 border-t">
                    <button onClick={handleAddNewClick} className="w-full text-left px-2 py-1 text-blue-600">Tambah:
                        "{searchTerm}"
                    </button>
                </div>)}</div>)}</div>);
}