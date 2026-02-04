import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, translations } from '../i18n/translations';

const LocaleContext = createContext(null);

const STORAGE_KEY = 'saro_locale_v1';

const normalizeLocale = (value) => {
    if (!value) return DEFAULT_LOCALE;
    const normalized = String(value).toLowerCase();
    if (SUPPORTED_LOCALES.includes(normalized)) return normalized;
    return DEFAULT_LOCALE;
};

const getInitialLocale = () => {
    const stored = normalizeLocale(localStorage.getItem(STORAGE_KEY));
    if (stored) return stored;

    const language = (navigator.language || DEFAULT_LOCALE).slice(0, 2).toLowerCase();
    return normalizeLocale(language);
};

export const LocaleProvider = ({ children }) => {
    const [locale, setLocale] = useState(getInitialLocale);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, locale);
        document.documentElement.lang = locale;
    }, [locale]);

    const setLanguage = useCallback((nextLocale) => {
        setLocale(normalizeLocale(nextLocale));
    }, []);

    const dictionary = translations[locale] || translations[DEFAULT_LOCALE];

    const t = useCallback(
        (key, fallback) => {
            const parts = String(key).split('.');
            let value = dictionary;
            for (const part of parts) {
                value = value?.[part];
            }
            if (typeof value === 'string') return value;
            if (typeof fallback === 'string') return fallback;
            return key;
        },
        [dictionary]
    );

    const value = useMemo(() => ({ locale, setLanguage, t }), [locale, setLanguage, t]);

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
    const ctx = useContext(LocaleContext);
    if (!ctx) {
        throw new Error('useLocale must be used within LocaleProvider');
    }
    return ctx;
};

export default LocaleContext;
