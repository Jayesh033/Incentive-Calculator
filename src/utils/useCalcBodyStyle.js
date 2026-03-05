import { useEffect } from 'react';

/**
 * Sets body styles appropriate for calculator pages on mount,
 * and cleans them up on unmount (so the homepage can use its own styles).
 */
export default function useCalcBodyStyle() {
    useEffect(() => {
        document.body.style.fontFamily = 'Arial, sans-serif';
        document.body.style.margin = '0';
        document.body.style.background = '#f0f2f5';
        document.body.style.paddingBottom = '100px';
        return () => {
            document.body.style.fontFamily = '';
            document.body.style.margin = '';
            document.body.style.background = '';
            document.body.style.paddingBottom = '';
        };
    }, []);
}
