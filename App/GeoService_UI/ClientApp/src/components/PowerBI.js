import React from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import cloneDeep from 'lodash.clonedeep';

import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

import { authFetch, authPost } from "./../authProvider";
import { LanguageContext } from './LanguageContext';

const API_POWERBI_PREFIX = 'api/PowerBI';

/* Luokka */
export class PowerBI extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        this.state = {
            reportId: '34da757e-a16e-42f9-9b38-c5f086ba09b8',//'dc6947af-40ba-4b1d-94d8-adab2f90267a',
            embedUrl: '',
            accessToken: null,
            loading: true
        };
    };

    componentDidMount() {

        //token
        authFetch(this.props.pca, API_POWERBI_PREFIX + '/ReportParams/' + this.state.reportId)
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    this.setState({
                        embedUrl: (((data.message || {}).embedReport || [])[0] || {}).embedUrl,
                        accessToken: ((data.message || {}).embedToken || {}).token,
                        loading: false
                    })
                }
            });
    };


    render() {
        const { dictionary } = this.context;
        const { reportId, embedUrl, accessToken } = this.state;

        return (
            <div className="Cont">
                <div>
                    {(this.state.loading) ? (
                        <CircularProgress />
                    ) : (
                            <div>
                                <h3>Carbon Footprint Analytics</h3>
                                <PowerBIEmbed
                                    embedConfig={{
                                        type: 'report',   // Supported types: report, dashboard, tile, visual and qna
                                        id: reportId,
                                        embedUrl: embedUrl,
                                        accessToken: accessToken,
                                        tokenType: models.TokenType.Embed,
                                        settings: {
                                            panes: {
                                                filters: {
                                                    expanded: false,
                                                    visible: false
                                                }
                                            },
                                            background: models.BackgroundType.Transparent,
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
                                        this.report = embeddedReport;
                                    }}
                                />
                                </div>
                        )
                    }
                </div>
            </div>
        );
    }
}
