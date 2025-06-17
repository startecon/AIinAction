import React from 'react';
import { dictionaryList } from './../translations';

/* User Language from browser */
const userLang = (navigator.language || navigator.userLanguage || 'en').substring(0, 2).toLowerCase();
const lang = Object.keys(dictionaryList).indexOf(userLang) > -1 ? userLang : 'en';

export const LanguageContext = React.createContext({
    userLanguage: lang,
    dictionary: dictionaryList[lang]
});

