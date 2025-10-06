import {useEffect} from "react";

export const useVisualViewport = () => {
    useEffect(() => {
        const handleViewportResize = () => {
            const vh = window.visualViewport.height;
            document.documentElement.style.setProperty('--app-height', `${vh}px`);
        };

        // Panggil saat pertama kali dan setiap kali viewport berubah
        handleViewportResize();
        window.visualViewport.addEventListener('resize', handleViewportResize);

        return () => {
            window.visualViewport.removeEventListener('resize', handleViewportResize);
        };
    }, []);
};