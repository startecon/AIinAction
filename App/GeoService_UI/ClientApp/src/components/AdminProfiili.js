import React, { Component } from 'react';
import MUIDataTable from 'mui-datatables';
import AdminProfiiliAdd from "./AdminProfiiliAdd";
import AdminProfiiliEdit from "./AdminProfiiliEdit";
import AdminProfiiliPreview from "./AdminProfiiliPreview";
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import cloneDeep from 'lodash.clonedeep';
import SortColButton from "./SortColButton";

import { authFetch, authPost } from "./../authProvider";
import { LanguageContext } from './LanguageContext';

/* Näkymäkohtaiset muuttujat ja vakiot */
const API_PREFIX = 'api/Roolit/Profiili';

var toimeksiantajat = {};
var default_columns = [
    {
        label: "ProfiiliId",
        name: "profiiliId",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Asetukset",
        name: "uI_Settings",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Käyttäjä",
        name: "username",
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
export class AdminProfiili extends Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        // State alustukset
        this.state = {
            lookupLists: {
                toimeksiantajat: toimeksiantajat
            },
            loading: true
        };

        //Bindit
        this.swapCols = this.swapCols.bind(this);
        this.addNewItem = this.addNewItem.bind(this);
    }

    componentDidMount() {
        var that = this;

        //Items
        authFetch(this.props.pca, API_PREFIX + '/Read')
            .then(response => response.json())
            .then(data => {
                items = data

                //Profiili
                authFetch(this.props.pca, PROFIILI_GET)
                    .then(response => response.json())
                    .then(data => {
                        var cols = (((JSON.parse(data.uI_Settings) || {}).columns || {}).profiili || []);
                        if (cols.length > 0) cols = JSON.parse(cols);
                        else cols = null;
                        var columns = get_ordered_columns(cols);
                        that.setState({
                            lookupLists: {
                                toimeksiantajat: toimeksiantajat
                            },
                            columns: columns,
                            data: items,
                            loading: false
                        });
                    });
            });
    }

    swapCols = (index) => {
        if (index > 1) {
            var cols = cloneDeep(this.state.columns);
            var d = this.state.data;
            [cols[index - 1], cols[index]] = [cols[index], cols[index - 1]];
            this.setState({ columns: cols });
            var setting = { "key": "columns.profiili", "value": JSON.stringify(cols.map(function (d) { return d.name; })).split('"').join('""') };
            authPost(this.props.pca, PROFIILI_PUT, {
                body: JSON.stringify(setting)
            }).then(res => console.log(res));
        }
    };

    addNewItem = (newrow) => {
        // ADD
        var data = cloneDeep(this.state.data);
        data = data.concat(newrow);
        authPost(this.props.pca, API_PREFIX + '/Create', {
            body: JSON.stringify(newrow)
        }).then(res => {
            if (res.status == 200) {
                authFetch(this.props.pca, API_PREFIX + '/Read')
                    .then(response => response.json())
                    .then(data => {
                        this.setState({ data: data })
                    });
            }
        });
        this.setState({ data: data });
    }

    editItem = (newrow) => {
        // EDIT
        var data = cloneDeep(this.state.data);
        authPost(this.props.pca, API_PREFIX + '/Update', {
            body: JSON.stringify(newrow)
        }).then(res => {
            if (res.status == 200) {
                authFetch(this.props.pca, API_PREFIX + '/Read')
                    .then(response => response.json())
                    .then(data => {
                        this.setState({ data: data })
                    });
            }
        });
        this.setState({ data: data });
    }

    onRowsSelect = (_, allRows) => {
        this.setState({ rowsSelected: allRows.map(row => row.index) });
        console.log(this.state.rowsSelected);
    };

    addNewLookupItem = (list, item) => {
        if (list.length > 0 && item.length > 0) {
            var data = cloneDeep(this.state.lookupLists);
            var id = Math.max(...Object.keys(data[list])) + 1;
            data[list][id] = item;
            this.setState({ lookupLists: data });
            const options = {
                body: JSON.stringify(item)
            }
        }
    }

    render() {
        const { dictionary } = this.context;

        for (var i = 0; i < default_columns.length; i++) {
            default_columns[i].label = dictionary.AdminProfiili.Columns[i]
        }


        var options = {
            textLabels: dictionary.DataTableLabels,
            selectableRows: "single",
            filterType: 'dropdown',
            responsive: "standard",
            rowsPerPageOptions: [5, 10, 25, 50, 100],
            rowsPerPage: 10,
            customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
                rowId = displayData[selectedRows.data[0].index].data[0];
                var handleDelete = () => {
                    if (window.confirm(dictionary.Toolbar.Confirmation)) {
                        console.log(rowId);
                        authPost(this.props.pca, API_PREFIX + '/Delete/' + rowId, { method: 'delete' })
                            .then(res => {
                                if (res.status == 200) {
                                    authFetch(this.props.pca, API_PREFIX + '/Read')
                                        .then(response => response.json())
                                        .then(data => {
                                            this.setState({ data: data })
                                        });
                                }
                            });
                    }
                }
                // TODO: Edit kohtaan oma toiminto
                return (
                    <div className={"custom-toolbar-select"}>
                        <AdminProfiiliPreview lookupLists={this.state.lookupLists} Daatta={this.state.data} rowId={rowId} />
                        <AdminProfiiliEdit onEditRow={this.editItem} lookupLists={this.state.lookupLists} Daatta={this.state.data} rowId={rowId} />
                        <Tooltip title={dictionary.Toolbar.Delete}>
                            <IconButton onClick={handleDelete}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                );
            },
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

            customToolbar: () => {
                return (
                    <React.Fragment>
                        <AdminProfiiliAdd onAddNewRow={this.addNewItem} lookupLists={this.state.lookupLists} onLookupListChange={this.addNewLookupItem} />
                        <SortColButton columns={this.state.columns} onOrderChange={this.swapCols} />
                    </React.Fragment>
                );
            }
        };
        return (
            <div className="Cont" >
                <div>
                    {(this.state.loading) ? (
                        <CircularProgress />
                    ) : (
                        <MUIDataTable
                            title={dictionary.AdminProfiili.Title}
                            data={this.state.data}
                            columns={this.state.columns}
                            options={options}
                        />
                    )
                    }
                </div>
            </div >
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