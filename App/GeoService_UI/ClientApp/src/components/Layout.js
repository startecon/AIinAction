import React from 'react';
import { MsalContext } from "@azure/msal-react";
import { languageOptions, dictionaryList } from './../translations';
import { LanguageContext } from './LanguageContext';
/*import GlobalMenu from "./GlobalMenu"*/
import { Box } from '@mui/material';

/* User language from local storage */
const defaultLanguage = window.localStorage.getItem('geoservice-lang');

/* User Language from browser */
const userLang = (navigator.language || navigator.userLanguage || 'en').substring(0, 2).toLowerCase();
const lang = Object.keys(dictionaryList).indexOf(userLang) > -1 ? userLang : 'en';

export class Layout extends React.Component {
    static contextType = MsalContext;

    constructor(props) {
        super(props);

        this.state = {
            userLanguage: defaultLanguage || lang,
        };
    }

    userLanguageChange = selected => {
        const newLanguage = languageOptions[selected] ? selected : "en";
        this.setState({ userLanguage: newLanguage });
        window.localStorage.setItem('geoservice-lang', newLanguage);
    }

    updateLanguage = e => this.setState({ language: e.target.value });

    onExpand = (value) => {
        if (value) {
            this.setState({ widthStyle: "calc(100vw - 300px)" });
        } else {
            this.setState({ widthStyle: "calc(100vw - 65px)" });
        }
    }

    render() {
/*        const { instance } = this.context;*/
        const { userLanguage } = this.state;

        return (
            <LanguageContext.Provider value={{
                userLanguage: userLanguage,
                dictionary: dictionaryList[userLanguage],
                userLanguageChange: this.userLanguageChange
            }}>
                {/*<div>*/}
                {/*    <div style={{ position: "absolute", zIndex: 999, height: "100vh" }}>*/}
                {/*        <GlobalMenu selected={this.props.selected} onExpand={this.onExpand} pca={instance} />*/}
                {/*    </div>                */}
                {/*    <Box sx={{ marginLeft: { xs: '0px', md: '70px' }, marginTop: { xs: '100px', md: '0px' } }}>{this.props.children}</Box>*/}
                {/*</div>*/}
                <div>
                    <Box>
                        {this.props.children}
                    </Box>
                </div>
            </LanguageContext.Provider>
        );
    }
}
