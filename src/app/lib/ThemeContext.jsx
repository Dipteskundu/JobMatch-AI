"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("dark"); // Default to dark mode
    const [mounted, setMounted] = useState(false);

    // Hoist applyTheme so it can be used in effects
    function applyTheme(newTheme) {
        const root = document.documentElement;

        // Remove existing theme classes
        root.classList.remove("light", "dark");

        // Add new theme class
        root.classList.add(newTheme);

        // Update data attribute for additional styling if needed
        root.setAttribute("data-theme", newTheme);

        // Force a repaint to ensure styles are applied
        root.style.colorScheme = newTheme;
    }

    useEffect(() => {
        // Check localStorage first, if not found default to dark mode
        const savedTheme = localStorage.getItem("skillmatch-theme");
        const initialTheme = savedTheme || "dark"; // Default to dark instead of system preference

        // Defer React state updates to avoid synchronous setState in effect
        applyTheme(initialTheme);
        setTimeout(() => setTheme(initialTheme), 0);
        setTimeout(() => setMounted(true), 0);
    }, []);

    // Apply theme whenever theme state changes
    useEffect(() => {
        if (mounted) {
            applyTheme(theme);
        }
    }, [theme, mounted]);

    // applyTheme is hoisted above

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("skillmatch-theme", newTheme);
    };

    // Return a loading state while mounting to prevent hydration issues
    const value = {
        theme,
        toggleTheme,
        mounted
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}
