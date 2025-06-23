import React, {useMemo, useRef, useState} from "react";
import {ArrowLeftIcon, ArrowRightIcon} from "../../utils/icons";

export const DatePickerDialog = ({selectedDate, onSelectDate, onClose}) => {
    const [displayDate, setDisplayDate] = useState(new Date(selectedDate));
    const wrapperRef = useRef(null);

    const changeMonth = (amount) => setDisplayDate(prev => {
        const newDate = new Date(prev);
        newDate.setUTCMonth(newDate.getUTCMonth() + amount, 1);
        return newDate;
    });

    const days = useMemo(() => {
        const year = displayDate.getUTCFullYear();
        const month = displayDate.getUTCMonth();
        const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay(); // 0=Minggu, 1=Senin,..
        const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        const today = new Date();
        const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        const selected = new Date(selectedDate);

        let daysArray = [];
        for (let i = 0; i < firstDay; i++) daysArray.push(null);
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            daysArray.push({
                date: i,
                isToday: d.toDateString() === todayUTC.toDateString(),
                isSelected: d.toDateString() === selected.toDateString(),
            });
        }
        return daysArray;
    }, [displayDate, selectedDate]);

    const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    const handleSelectDate = (day) => {
        const newDate = new Date(Date.UTC(displayDate.getUTCFullYear(), displayDate.getUTCMonth(), day));
        onSelectDate(newDate.toISOString().split('T')[0]);
    };


    return (<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
                 onClick={onClose}>
        <div ref={wrapperRef} className="bg-white rounded-lg shadow-xl p-4 w-full max-w-sm"
             onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeftIcon/></button>
                <p className="font-bold text-lg">{displayDate.toLocaleDateString('id-ID', {
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'UTC' // Tampilkan header bulan dalam UTC.
                })}</p>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowRightIcon/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map(day => <div key={day} className="font-semibold text-sm text-gray-500">{day}</div>)}
                {days.map((day, index) => (day ? <button key={index}
                                                         onClick={() => handleSelectDate(day.date)}
                                                         className={`p-2 rounded-full transition-colors ${day.isSelected ? 'bg-blue-600 text-white' : day.isToday ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>{day.date}</button> :
                    <div key={index}></div>))}
            </div>
        </div>
    </div>);
};