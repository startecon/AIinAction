import { BrowserCacheLocation, InteractionRequiredAuthError, LogLevel } from "@azure/msal-browser";

export const authConfig = {
    auth: getAuthConfig(),
    cache: {
        cacheLocation: BrowserCacheLocation.SessionStorage
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            }
        }
    }
};

export const authFetch = async (authProvider, url) => {
    const token = await getIdToken(authProvider);

    return fetch(url, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
        },
    });
};

export const authPost = async (authProvider, url, parameters) => {
    const token = await getIdToken(authProvider);

    // Default Options
    var defaults =
    {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
        },
    }

    var options = mergeDeep(defaults, parameters)

    return fetch(url, options);
};

export const authPostFile = async (authProvider, url, parameters) => {
    const token = await getIdToken(authProvider);

    // Default Options
    var defaults =
    {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token,
        },
    }

    var options = mergeDeep(defaults, parameters)

    return fetch(url, options);
};

export const logOut = async (authProvider) => {
    authProvider.logoutRedirect();
}

/**
 * 
 * 
 **/
async function getIdToken(authProvider) {
    const accounts = authProvider.getAllAccounts();

    const request = {
        scopes: ["openid"],
        account: (accounts || [])[0]
    }

    const idToken = await authProvider.acquireTokenSilent(request).then((response) => {
        return response.idToken;
    }).catch(error => {
        if (error instanceof InteractionRequiredAuthError) {
            // fallback to interaction when silent call fails
            authProvider.acquireTokenRedirect(request)
                .then(response => {
                    return response.idToken
                })
                .catch(err => {
                    console.log(err);
                });
        }
    });

    return idToken
}

/** 
 *  Dynamic Configuration from Key Vault (through appsettings and MSI)
 *  source: https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/481
**/
function getAuthConfig() {
    var request = new XMLHttpRequest();
    request.open('GET', "/api/Settings", false);  // request application settings synchronous
    request.send(null);
    const response = JSON.parse(request.responseText);
    return response;
}

/**
 * source: https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
* Performs a deep merge of objects and returns new object. Does not modify
* objects (immutable) and merges arrays via concatenation.
*
* @param {...object} objects - Objects to merge
* @returns {object} New object with merged key/values
*/
function mergeDeep(...objects) {
    const isObject = obj => obj && typeof obj === 'object';

    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach(key => {
            const pVal = prev[key];
            const oVal = obj[key];

            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = pVal.concat(...oVal);
            }
            else if (isObject(pVal) && isObject(oVal)) {
                prev[key] = mergeDeep(pVal, oVal);
            }
            else {
                prev[key] = oVal;
            }
        });

        return prev;
    }, {});
}