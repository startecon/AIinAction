import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { unregister } from './registerServiceWorker';
import { MsalProvider, MsalAuthenticationTemplate } from "@azure/msal-react";
import { InteractionType, PublicClientApplication } from "@azure/msal-browser";
import { authConfig } from './authProvider';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const themeOptions = {
    palette: {
        type: 'light',
        primary: {
            main: '#7030a0',
        },
        secondary: {
            main: '#ff6600',
        },
        error: {
            main: '#ff3100',
        },
        success: {
            main: '#95a5db',
        },
        warning: {
            main: '#ffc000',
        },
        info: {
            main: '#ebebeb',
        },
        iconText: {
            main: 'rgb(0 0 0 / 65%)',
        },
        white: {
            main: '#fff',
        },
        text: {
            primary: '#303030',
            secondary: '#fff'
        },
    },
    typography: {
        fontFamily: 'Arial Narrow',
    },
    props: {
        MuiTooltip: {
            arrow: true,
        },
    },
    components: {
        MuiTable: {
            styleOverrides: {
                root: {
                    backgroundColor: "#fafafa",
                    color: "#303030ff"
                },
            },
        },
        MUIDataTableToolbar: {
            styleOverrides: {
                root: {
                    backgroundColor: "#fafafa",
                    color: "#303030ff"
                },
            }
        },
        MUIDataTableToolbarSelect: {
            styleOverrides: {
                root: {
                    backgroundColor: "#ebebebff",
                    color: "#303030ff"
                },
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    backgroundColor: "#fafafa !important",
                    color: "#303030ff !important"
                }
            }
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: "rgb(0 0 0 / 65%) !important"
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    color: "rgb(0 0 0 / 65%) !important"
                }
            }
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: "#ff6600 !important"
                }
            }
        },
        MuiRadio: {
            styleOverrides: {
                root: {
                    color: "#ff6600 !important"
                }
            }
        },
    }
};

const searchParams = new URLSearchParams(document.location.search);
const theme = createTheme(themeOptions);
const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const rootElement = document.getElementById('root');
const authRequest = {
    scopes: ["openid", "profile"]
};
const authProvider = new PublicClientApplication(authConfig);

ReactDOM.render(
    <BrowserRouter basename={baseUrl}>
        {/*<MsalProvider instance={authProvider}>*/}
        {/*    <MsalAuthenticationTemplate*/}
        {/*        interactionType={InteractionType.Redirect}*/}
        {/*        authenticationRequest={authRequest}*/}
        {/*    >*/}
                <ThemeProvider theme={theme}>
                    <App />
                </ThemeProvider>
        {/*    </MsalAuthenticationTemplate >*/}
        {/*</MsalProvider>*/}
    </BrowserRouter>,
    rootElement);

unregister();
