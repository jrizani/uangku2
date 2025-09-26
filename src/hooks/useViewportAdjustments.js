import { useEffect } from 'react';

const supportsVisualViewport = typeof window !== 'undefined' && 'visualViewport' in window;

export function useViewportAdjustments() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const root = document.documentElement;

        const updateViewportVars = () => {
            const innerHeight = window.innerHeight || root.clientHeight;
            root.style.setProperty('--app-viewport-height', `${innerHeight}px`);

            if (supportsVisualViewport && window.visualViewport) {
                const { height, offsetTop } = window.visualViewport;
                const keyboardOffset = Math.max(0, innerHeight - (height + offsetTop));
                root.style.setProperty('--keyboard-offset', `${keyboardOffset}px`);
            } else {
                root.style.setProperty('--keyboard-offset', '0px');
            }
        };

        updateViewportVars();

        window.addEventListener('resize', updateViewportVars);

        if (supportsVisualViewport) {
            window.visualViewport.addEventListener('resize', updateViewportVars);
            window.visualViewport.addEventListener('scroll', updateViewportVars);
        }

        return () => {
            window.removeEventListener('resize', updateViewportVars);
            if (supportsVisualViewport) {
                window.visualViewport.removeEventListener('resize', updateViewportVars);
                window.visualViewport.removeEventListener('scroll', updateViewportVars);
            }
        };
    }, []);
}
