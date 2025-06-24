import React from 'react';
import {ChartIcon, HomeIcon, SettingsIcon, WalletsIcon} from "../../utils/icons";

export function BottomNavBar({activeView, onNavigate}) {
    const navItems = [
        {name: 'home', label: 'Home', icon: <HomeIcon/>},
        {name: 'wallets', label: 'Dompet', icon: <WalletsIcon/>},
        {name: 'charts', label: 'Chart', icon: <ChartIcon />},
        {name: 'settings', label: 'Pengaturan', icon: <SettingsIcon />},
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t">
            <div className="flex justify-around max-w-lg mx-auto">
                {navItems.map(item => (
                    <button
                        key={item.name}
                        onClick={() => onNavigate(item.name)}
                        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 ${activeView === item.name ? 'text-blue-600' : 'text-gray-500'}`}
                    >
                        {item.icon}
                        <span className="text-xs">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}