// src/context/AppContext.js
import React, { createContext, useContext } from 'react';
import { useAppData } from '../hooks/useAppData';

const AppContext = createContext(null);

export const AppProvider = ({ isAuthenticated, children, onLogout, onImportData }) => {
    const data = useAppData(isAuthenticated);

    // Gabungkan data dari hook dengan fungsi-fungsi yang di-pass dari App.js
    const contextValue = {
        ...data,
        onLogout,
        onImportData
    };
    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === null) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};