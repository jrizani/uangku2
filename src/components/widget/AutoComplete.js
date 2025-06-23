import React, {useState} from "react";

export const AutocompleteInput = React.forwardRef(({value, onChange, suggestions, onFocus, label = "Deskripsi"}, ref) => {
    const [filtered, setFiltered] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const handleChange = (e) => {
        const input = e.target.value;
        onChange(input);
        if (input) {
            setFiltered(suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase())).slice(0, 5));
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };
    const onSuggestionClick = (suggestion) => {
        onChange(suggestion);
        setShowSuggestions(false);
    };
    return (
        <div className="relative"><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><input
            ref={ref} type="text" value={value} onChange={handleChange} onFocus={onFocus}
            placeholder={`Tulis ${label.toLowerCase()}...`}
            className="w-full px-4 py-3 bg-gray-50 border rounded-lg"/>{showSuggestions && filtered.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">{filtered.map((s, i) =>
                <li key={i} onClick={() => onSuggestionClick(s)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{s}</li>)}</ul>)}</div>);
});