import React from 'react';
import { useMsal } from "@azure/msal-react";
import CircularProgress from '@mui/material/CircularProgress';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

import { authFetch } from "./../authProvider";
import { LanguageContext } from './LanguageContext';

const API_POWERBI_PREFIX = 'api/PowerBI';

export const PowerBIContent = (props) => {
    const { instance } = useMsal();
    const context = React.useContext(LanguageContext);
    const [embedUrl, setEmbedUrl] = React.useState(null);
    const [accessToken, setAccessToken] = React.useState(null);
    const [report, setReport] = React.useState(null);
    const [fitting, setFitting] = React.useState("ActualSize");

    React.useEffect(() => {
        setAccessToken(null);

        if (props.DisplayOption) {
            setFitting(props.DisplayOption || "ActualSize");
        }

        //token RLS
        //authFetch(instance, API_POWERBI_PREFIX + '/ReportParams/' + (props?.ReportId || '') + (props?.DatasetId ? '/' + props?.DatasetId : '') + (props?.PageId ? '/' + props?.PageId : ''))
        //    .then(response => response.json())
        //    .then(data => {
        //        if (!data.error) {
        //            setEmbedUrl((((data.message || {}).embedReport || [])[0] || {}).embedUrl);
        //            setAccessToken(((data.message || {}).embedToken || {}).token);
        //        }
        //    });

        if (props.ReportId) {

            //token
            authFetch(instance, API_POWERBI_PREFIX + '/ReportParams/' + props?.ReportId)
                .then(response => response.json())
                .then(data => {
                    if (!data.error) {
                        setEmbedUrl((((data.message || {}).embedReport || [])[0] || {}).embedUrl);
                        setAccessToken(((data.message || {}).embedToken || {}).token);
                    }
                });
        }

    }, [props?.ReportId])

    return (
        <div className="Cont">
            <div>
                {(!accessToken) ? (
                    <div style={{ width: "100%", height: "100vh" }}>
                        <CircularProgress />
                    </div>
                ) : (
                    <div>
                        <PowerBIEmbed
                            embedConfig={{
                                type: 'report',   // Supported types: report, dashboard, tile, visual and qna
                                id: props.ReportId,
                                pageName: props.PageId,
                                embedUrl: embedUrl,
                                accessToken: accessToken,
                                tokenType: models.TokenType.Embed,
                                settings: {
                                    panes: {
                                        filters: {
                                            expanded: false,
                                            visible: props.Filters
                                        },
                                        pageNavigation: {
                                            expanded: props.PageNavigation,
                                            visible: props.PageNavigation
                                        },
                                        bookmarks: {
                                            expanded: props.Bookmarks,
                                            visible: props.Bookmarks
                                        }
                                    },
                                    background: models.BackgroundType.Default,
                                    localeSettings: {
                                        language: context.userLanguage,
                                        formatLocale: context.userLanguage
                                    },
                                    layoutType: models.LayoutType.Custom,
                                    customLayout: {
                                        displayOption: models.DisplayOption[fitting]
                                    }
                                }
                            }}

                            eventHandlers={
                                new Map([
                                    ['loaded', function () { console.log('Report loaded'); }],
                                    ['rendered', function () { console.log('Report rendered'); }],
                                    ['error', function (event) { console.log(event.detail); }]
                                ])
                            }

                            cssClassName={"powerbi-report"}

                            getEmbeddedComponent={(embeddedReport) => {
                                setReport(embeddedReport);
                            }}
                        />
                    </div>
                )
                }
            </div>
        </div>
    );

}