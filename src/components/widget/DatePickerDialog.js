import React, {useMemo, useRef, useState} from "react";
import {ArrowLeftIcon, ArrowRightIcon} from "../../utils/icons";

export const DatePickerDialog = ({selectedDate, onSelectDate, onClose}) => {
    const [displayDate, setDisplayDate] = useState(new Date(selectedDate + 'T00:00:00'));
    const wrapperRef = useRef(null);

    const changeMonth = (amount) => setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));

    const days = useMemo(() => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        const selected = new Date(selectedDate + 'T00:00:00');

        let daysArray = [];
        for (let i = 0; i < firstDay; i++) daysArray.push(null);
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            daysArray.push({
                date: i,
                isToday: d.toDateString() === today.toDateString(),
                isSelected: d.toDateString() === selected.toDateString(),
            });
        }
        return daysArray;
    }, [displayDate, selectedDate]);

    const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
             onClick={onClose}>
            <div ref={wrapperRef} className="bg-white rounded-lg shadow-xl p-4 w-full max-w-sm"
                 onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeftIcon/></button>
                    <p className="font-bold text-lg">{displayDate.toLocaleDateString('id-ID', {
                        month: 'long',
                        year: 'numeric'
                    })}</p>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100">
                        <ArrowRightIcon/></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {weekDays.map(day => <div key={day} className="font-semibold text-sm text-gray-500">{day}</div>)}
                    {days.map((day, index) => (
                        day ? <button key={index}
                                      onClick={() => onSelectDate(new Date(displayDate.getFullYear(), displayDate.getMonth(), day.date).toISOString().split('T')[0])}
                                      className={`p-2 rounded-full transition-colors ${day.isSelected ? 'bg-blue-600 text-white' : day.isToday ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>{day.date}</button> :
                            <div key={index}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};