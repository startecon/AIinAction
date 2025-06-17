import React, { Component } from 'react';
import MUIDataTable from 'mui-datatables';
import AdminProfiiliAdd from "./AdminProfiiliAdd";
import AdminProfiiliEdit from "./AdminProfiiliEdit";
import AdminProfiiliPreview from "./AdminProfiiliPreview";
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import cloneDeep from 'lodash.clonedeep';
import SortColButton from "./SortColButton";

import { authFetch, authPost } from "./../authProvider";
import { LanguageContext } from './LanguageContext';

/* Näkymäkohtaiset muuttujat ja vakiot */
const API_PREFIX = 'api/Lokitus';

var toimeksiantajat = {};
var default_columns = [
    {
        label: "Id",
        name: "id",
        options: {
            filter: true
        }
    },
    {
        label: "Loki",
        name: "loki",
        options: {
            filter: true
        }
    },
    {
        label: "Käyttäjä",
        name: "username",
        options: {
            filter: true
        }
    },
    {
        label: "Luotu",
        name: "created",
        options: {
            filter: true
        }
    }
];

/* Perusmuuttujat ja vakiot */
const PROFIILI_GET = 'api/Profiili/Read';
const PROFIILI_PUT = 'api/Profiili/Update';

var rowId;
var items = [];

/* Luokka */
export class Lokitus extends Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        // State alustukset
        this.state = {
            loading: true,
            showStart: false,
            showReady: false
        };

    }

    componentDidMount() {

        //Items
        authFetch(this.props.pca, API_PREFIX + '/Read')
            .then(response => response.json())
            .then(data => {
                items = data
                console.log(data.length);
                if (data.length < 1) {
                    this.setState({ showStart: true, showReady: false })
                }
                else if (data.length >= 1) {
                    this.setState({ showStart: false, showReady: true  })
                }
                //Profiili
                authFetch(this.props.pca, PROFIILI_GET)
                    .then(response => response.json())
                    .then(data => {
                        var cols = (((JSON.parse(data.uI_Settings) || {}).columns || {}).lokitus || []);
                        if (cols.length > 0) cols = JSON.parse(cols);
                        else cols = null;
                        var columns = get_ordered_columns(cols);
                        this.setState({
                            columns: columns,
                            data: items,
                            loading: false
                        });
                    });
            });
    }

    GetData = () => {
        authFetch(this.props.pca, API_PREFIX + '/Read')
            .then(response => response.json())
            .then(data => {
                items = data
                this.setState({ data: items });
            });
    }

    WriteData = () => {
        this.setState({ showStart: false })
        authPost(this.props.pca, API_PREFIX + '/Create', { body: JSON.stringify(1) })
            .then(response => response.json())
            .then(data => {
                authFetch(this.props.pca, API_PREFIX + '/Read')
                    .then(response => response.json())
                    .then(data => {
                        items = data
                        console.log(this.state.showStart, this.state.showReady);
                    });
            });
    }

    ClearData = () => {
        authFetch(this.props.pca, API_PREFIX + '/Clear')
            .then(response => response.json())
            .then(data => {
                items = data
                this.setState({ data: items, showStart: true, showReady: false });
            });
    }

    render() {
        const { dictionary } = this.context;

        var cols = cloneDeep(this.state.columns);
        if ((cols || []).length > 0) {
            for (var i = 0; i < default_columns.length; i++) {
                for (var j = 0; j < cols.length; j++) {
                    if (cols[j].label == default_columns[i].label) {
                        cols[j].label = dictionary.Lokitus.Columns[i]
                    }
                }
            }
        }

        var options = {
            selectableRows: "single",
            responsive: "standard",
            rowsPerPage: 20,
            // Huomioi samat arvot ja sen jölkeen lajitellaan ensimmäisen sarakkeen (id) mukaan
            customSort: (data, colIndex, order) => {
                const { columns, lookupLists } = this.state;

                return data.sort((a, b) => {
                    if (a.data[colIndex] == b.data[colIndex]) {
                        // samanarvoisissa riveissä otetaan riviavainjärjestys
                        return ((a.data[0] || -9e6) < (b.data[0] || -9e6) ? -1 : 1) * (order === 'desc' ? 1 : -1);
                    } else if (columns[colIndex].options.lookuplist) {
                        // lookuplist lajittelu
                        const list = lookupLists[columns[colIndex].options.lookuplist];
                        var aa = (list[a.data[colIndex]] || ''), bb = (list[b.data[colIndex]] || '');

                        return ((parseInt(!/[^0-9]/i.test(aa) ? aa : 'x') || aa.toString()) < (parseInt(!/[^0-9]/i.test(bb) ? bb : 'x') || bb.toString()) ? -1 : 1) * (order === 'desc' ? 1 : -1);
                    } else {
                        // normaali lajittelu
                        return ((a.data[colIndex] || -9e6) < (b.data[colIndex] || -9e6) ? -1 : 1) * (order === 'desc' ? 1 : -1);
                    }
                });
            },
        };

        var Title = (
            <React.Fragment>
                <React.Fragment style={{ paddingRight: "5px" }}>
                    <Button variant="contained" onClick={this.WriteData} disabled={!this.state.showStart}>Aloita</Button>
                </React.Fragment>
                <React.Fragment>
                    <Button variant="contained" onClick={this.ClearData} disabled={!this.state.showReady}>Valmis</Button>
                </React.Fragment>
            </React.Fragment>
        );

        return (
            <div className="Cont">
                <div>
                    {(this.state.loading) ? (
                        <CircularProgress />
                    ) : (
                        <MUIDataTable
                            title={Title}
                            data={this.state.data}
                            columns={cols}
                            options={options}
                        />
                    )
                    }
                </div>
            </div>
        );
    }
}

function get_ordered_columns(list) {
    var columns = [];

    if (Array.isArray(list)) {
        list.forEach(function (el) {
            columns.push((default_columns.filter(function (d) { return d.name == el; }) || [])[0]);
        });
    } else {
        columns = default_columns;
    }

    return columns;
}