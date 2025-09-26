import { useEffect, useRef } from 'react';

const supportsVisualViewport = typeof window !== 'undefined' && 'visualViewport' in window;

export function useViewportAdjustments() {
    const baselineHeightRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const root = document.documentElement;
        const visualViewport = supportsVisualViewport ? window.visualViewport : null;

        const getViewportHeight = () => {
            if (visualViewport) {
                return visualViewport.height + visualViewport.offsetTop;
            }
            return window.innerHeight || root.clientHeight;
        };

        const updateOffsets = () => {
            const totalViewportHeight = getViewportHeight();

            if (baselineHeightRef.current == null || totalViewportHeight > baselineHeightRef.current) {
                baselineHeightRef.current = totalViewportHeight;
            }

            const currentHeight = visualViewport ? visualViewport.height + visualViewport.offsetTop : totalViewportHeight;
            const diff = Math.max(0, (baselineHeightRef.current || currentHeight) - currentHeight);

            root.style.setProperty('--bottom-nav-offset', `${diff}px`);
        };

        updateOffsets();

        const handleResize = () => {
            updateOffsets();
        };

        window.addEventListener('resize', handleResize);

        if (visualViewport) {
            visualViewport.addEventListener('resize', handleResize);
            visualViewport.addEventListener('scroll', handleResize);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (visualViewport) {
                visualViewport.removeEventListener('resize', handleResize);
                visualViewport.removeEventListener('scroll', handleResize);
            }
        };
    }, []);
}
