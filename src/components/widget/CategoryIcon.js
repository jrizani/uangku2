import React from 'react';

export function CategoryIcon({ icon, name, size = 'w-8 h-8' }) {
    if (icon && icon.startsWith('fa-')) {
        return <i className={`${icon} ${size} flex items-center justify-center text-xl text-gray-700`}></i>;
    }

    const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
    const colors = [
        'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const color = colors[Math.abs(name.charCodeAt(0) % colors.length)];

    return (
        <div className={`${size} ${color} rounded-full flex items-center justify-center text-white font-bold`}>
            {firstLetter}
        </div>
    );
}