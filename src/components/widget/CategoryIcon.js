import React from 'react';
import Icon from '@mdi/react';
import { materialColors } from '../../utils/helpers'; // Impor palet warna

export function CategoryIcon({ icon, name, color, size = 'w-8 h-8' }) {
    // Tentukan warna yang akan digunakan: dari prop, atau generate acak jika tidak ada.
    const displayColor = color || materialColors[Math.abs((name || '').charCodeAt(0) % materialColors.length)];

    // Jika ada ikon (bukan default), gunakan warna untuk mewarnai ikonnya
    if (icon && icon.type === 'fa') {
        return <i className={`${icon.className} ${size} flex items-center justify-center text-xl`} style={{ color: displayColor }}></i>;
    }

    if (icon && icon.type === 'mdi') {
        return <Icon path={icon.path} size={1.2} className={`${size}`} style={{ color: displayColor }}/>;
    }

    // Jika tidak ada ikon, gunakan warna sebagai latar belakang ikon huruf
    const firstLetter = name ? name.charAt(0).toUpperCase() : '?';

    return (
        <div className={`${size} rounded-full flex items-center justify-center text-white font-bold text-sm`} style={{ backgroundColor: displayColor }}>
            {firstLetter}
        </div>
    );
}