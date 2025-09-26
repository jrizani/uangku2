import React, { useMemo } from 'react';
import {ChartIcon, HomeIcon, SettingsIcon, WalletsIcon} from "../../utils/icons";

export function BottomNavBar({activeView, onNavigate}) {
    const navItems = useMemo(() => ([
        {name: 'home', label: 'Home', icon: <HomeIcon/>},
        {name: 'wallets', label: 'Dompet', icon: <WalletsIcon/>},
        {name: 'charts', label: 'Chart', icon: <ChartIcon />},
        {name: 'settings', label: 'Pengaturan', icon: <SettingsIcon />},
    ]), []);

    return (
        <div
            className="fixed inset-x-0 bottom-0 z-30 bg-white/95 border-t shadow-lg backdrop-blur-sm pb-safe"
            style={{ transform: 'translateZ(0)' }}
        >
            <div className="flex justify-around max-w-lg mx-auto">
                {navItems.map(item => (
                    <button
                        key={item.name}
                        onClick={() => onNavigate(item.name)}
                        className={`flex flex-col items-center justify-center w-full pt-2 pb-2 ${activeView === item.name ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}
                    >
                        {item.icon}
                        <span className="text-xs mt-1">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
