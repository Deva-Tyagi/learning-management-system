import React, { createContext, useContext, useState, useEffect } from 'react';
import API_BASE_URL from '../lib/utils';

const PlatformContext = createContext();

export const usePlatform = () => useContext(PlatformContext);

export const PlatformProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        platformName: 'MICC CRM',
        supportEmail: 'support@micc.com',
        supportPhone: '+91 00000 00000',
        primaryColor: '#2563eb',
        prices: { basic: 999, professional: 2499, enterprise: 4999 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Ensure the URL is correct for public settings
                const res = await fetch(`${API_BASE_URL}/super-admin/public/settings`);
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                    
                    // Apply primary color to document root if needed
                    document.documentElement.style.setProperty('--primary-color', data.primaryColor);
                }
            } catch (err) {
                console.error("Platform settings fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    return (
        <PlatformContext.Provider value={{ ...settings, loading }}>
            {children}
        </PlatformContext.Provider>
    );
};
