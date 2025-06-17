import React, { Component } from 'react';
import MUIDataTable from 'mui-datatables';
import AdminPalvelupakettiAdd from "./AdminPalvelupakettiAdd";
import AdminPalvelupakettiEdit from "./AdminPalvelupakettiEdit";
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import cloneDeep from 'lodash.clonedeep';
import SortColButton from "./SortColButton";
import { authFetch, authPost } from "./../authProvider";
import moment from 'moment';
import { LanguageContext } from './LanguageContext';
import ErrorDialog from './ErrorDialog'
import FileCopyIcon from "@mui/icons-material/FileCopy";

/* Näkymäkohtaiset muuttujat ja vakiot */
const API_PREFIX = 'api/PalvelupakettiSisalto';
const API_PALVELUPAKETIT_PREFIX = 'api/Palvelupaketti';
const API_TOIMINNOT_PREFIX = 'api/Toiminto';
const API_ENTITEETIT_PREFIX = 'api/Roolit/Entiteetit';


var default_columns = [
    {
        label: "Id",
        name: "palvelupakettiSisaltoId",
        options: {
            filter: false
        }
    },
    {
        label: "Palvelupaketti",
        name: "palvelupaketti_Id",
        options: {
            filter: true,
            customBodyRender: function (value, tableMeta, updateValue) {
                return palvelupaketit[value];
            },
            lookuplist: 'palvelupaketit'
        }
    },
    {
        label: "Toiminto",
        name: "toiminnot_Id",
        options: {
            filter: true,
            customBodyRender: function (value, tableMeta, updateValue) {
                return toiminnot[value];
            },
            lookuplist: 'toiminnot'
        }
    },
    {
        label: "Entiteetti",
        name: "entiteetti_Id",
        options: {
            filter: true,
            customBodyRender: function (value, tableMeta, updateValue) {
                return entiteetit[value];
            },
            lookuplist: 'entiteetit'
        }
    },
    {
        label: "Maksimi",
        name: "maksimi",
        options: {
            filter: false
        }
    },
    {
        label: "Created",
        name: "created",
        options: {
            filter: false,
            customBodyRender: function (value, tableMeta, updateValue) {
                var date = moment(value).format("DD/MM/YYYY, HH:mm");
                return moment(value).isValid() ? date : "";
            },
        }
    },
    {
        label: "Updated",
        name: "updated",
        options: {
            filter: false,
            customBodyRender: function (value, tableMeta, updateValue) {
                var date = moment(value).format("DD/MM/YYYY, HH:mm");
                return moment(value).isValid() ? date : "";
            },
        }
    },
    {
        label: "Username",
        name: "username",
        options: {
            filter: false,
        }
    },
    {
        label: "Active",
        name: "active",
        options: {
            filter: false
        }
    }
];

/* Perusmuuttujat ja vakiot */
const PROFIILI_GET = 'api/Profiili/Read';
const PROFIILI_PUT = 'api/Profiili/Update';

var items = [];
var palvelupaketit = {};
var toiminnot = {};
var entiteetit = {};

var selectedRows = [];
var rowId;

/* Luokka */
export class AdminPalvelupaketti extends Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        // State alustukset
        this.state = {
            lookupLists: {
                palvelupaketit: palvelupaketit,
                toiminnot: toiminnot,
                entiteetit: entiteetit
            },
            multiple: false,
            hidden: [],
            loading: true,
            rowNum: 0,
            errorShow: false,
            errorTitle: '',
            errorBody: '',
            rowsSelected: [],
        };

        //Bindit
        this.swapCols = this.swapCols.bind(this);
        this.addNewItem = this.addNewItem.bind(this);
    }

    componentDidMount() {
        var that = this;

        //palvelupaketit
        authFetch(this.props.pca, API_PALVELUPAKETIT_PREFIX + '/Read')
            .then(response => response.json())
            .then(data => {
                data.forEach(function (d, i) {
                    palvelupaketit[d.palvelupakettiId] = (d.palvelupakettiNimi || 'ei tietoja');
                });

                //palvelupaketit
                authFetch(this.props.pca, API_TOIMINNOT_PREFIX + '/Read')
                    .then(response => response.json())
                    .then(data => {
                        data.forEach(function (d, i) {
                            toiminnot[d.riviAvain] = (d.toiminto || 'ei tietoja');
                        });


                        //entiteetit
                        authFetch(this.props.pca, API_ENTITEETIT_PREFIX + '/Read')
                            .then(response => response.json())
                            .then(data => {
                                data.forEach(function (d, i) {
                                    entiteetit[d.entiteettiId] = (d.entiteettiNimi || 'ei tietoja');
                                });

                                //Items
                                authFetch(this.props.pca, API_PREFIX + '/Read')
                                    .then(response => response.json())
                                    .then(data => {
                                        items = data

                                        //Profiili
                                        authFetch(this.props.pca, PROFIILI_GET)
                                            .then(response => response.json())
                                            .then(data => {
                                                var cols = (((JSON.parse(data.uI_Settings) || {}).columns || {}).palvelupaketti || []);
                                                if (cols.length > 0) cols = JSON.parse(cols);
                                                else cols = null;

                                                // hidden cols
                                                var hidden_cols = (((JSON.parse(data.uI_Settings) || {}).hiddencolumns || {}).palvelupaketti || []);
                                                if (hidden_cols.length > 0) hidden_cols = JSON.parse(hidden_cols);
                                                else hidden_cols = null;

                                                // rowNum
                                                var rowNum = (((JSON.parse(data.uI_Settings) || {}).rownum || {}).palvelupaketti || []);
                                                if (rowNum.length > 0) rowNum = JSON.parse(rowNum);
                                                else rowNum = 20;

                                                var columns = get_ordered_columns(cols, hidden_cols);

                                                that.setState({
                                                    lookupLists: {
                                                        palvelupaketit: palvelupaketit,
                                                        toiminnot: toiminnot,
                                                        entiteetit: entiteetit
                                                    },
                                                    columns: columns,
                                                    data: items,
                                                    loading: false,
                                                    rowNum: rowNum
                                                });
                                            });
                                    });
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
            var setting = { "key": "columns.palvelupaketti", "value": JSON.stringify(cols.map(function (d) { return d.name; })).split('"').join('""') };
            authPost(this.props.pca, PROFIILI_PUT, {
                body: JSON.stringify(setting)
            })
        }
    };

    changeRownum = (num) => {
        this.setState({ rowNum: num })

        var setting = { "key": "rownum.palvelupaketti", "value": JSON.stringify(num).split('"').join('""') };
        authPost(this.props.pca, PROFIILI_PUT, {
            body: JSON.stringify(setting)
        })
    };

    hiddenCols = (changedColumn, action) => {
        var cols = cloneDeep(this.state.columns);
        var hidden = [];

        for (var i = 0; i < cols.length; i++) {
            if (!(cols[i].options))
                cols[i].options = {};

            if (cols[i].name == changedColumn)
                cols[i].options.display = (action === "add" ? true : false)

            if (cols[i].options.display == false) {
                hidden.push(cols[i].name);
            }
        }

        if (action === "add") {
            hidden.splice(hidden.indexOf(changedColumn), 1);
        }
        else if (action === "remove") {
            hidden.push(changedColumn);
        }

        this.setState({ columns: cols });
        var setting = { "key": "hiddencolumns.palvelupaketti", "value": (hidden.length > 0 ? JSON.stringify(hidden).split('"').join('""') : "[]") }; // TODO: muuta avain
        authPost(this.props.pca, PROFIILI_PUT, {
            body: JSON.stringify(setting)
        })
    };

    handleError = (error) => {
        var title = '', body = ''
        if (error == 4) {
            title = this.context.dictionary.ErrorDialog.Error4.title;
            body = this.context.dictionary.ErrorDialog.Error4.body;
        } else if (error == 5) {
            title = this.context.dictionary.ErrorDialog.Error5.title;
            body = this.context.dictionary.ErrorDialog.Error5.body;
        } else {
            title = this.context.dictionary.ErrorDialog.Error.title;
            body = this.context.dictionary.ErrorDialog.Error.body;
        }
        this.setState({
            errorShow: true,
            errorTitle: title,
            errorBody: body
        })
    }

    handleErrorClose = () => this.setState({ errorShow: false });

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
            method: 'PUT',
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

    onRowSelectionChange = (_, allRows) => {
        this.setState({ rowsSelected: allRows.map(row => row.index) });
    };

    addNewLookupItem = (list, item) => {
        if (list.length > 0 && item.length > 0) {
            var data = cloneDeep(this.state.lookupLists);
            var id = Math.max(...Object.keys(data[list])) + 1;
            data[list][id] = item;
            this.setState({ lookupLists: data });
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            }
        }
    }

    render() {
        const { userLanguage, dictionary } = this.context;
        const { errorShow, errorTitle, errorBody } = this.state;

        var cols = cloneDeep(this.state.columns);
        if ((cols || []).length > 0) {
            for (var i = 0; i < default_columns.length; i++) {
                for (var j = 0; j < cols.length; j++) {
                    if (cols[j].label == default_columns[i].label) {
                        cols[j].label = dictionary.Palvelupaketti.Columns[i]
                    }
                }
            }
        }

        var options = {
            textLabels: dictionary.DataTableLabels,
            selectableRowsHeader: true,
            selectableRowsOnClick: true,
            selectableRows: "multiple",
            selectToolbarPlacement: 'above',
            filterType: 'multiselect',
            responsive: "standard",
            jumpToPage: true,
            rowsPerPage: this.state.rowNum,
            rowsPerPageOptions: [10, 20, 50, 80, 100, 150],
            rowsSelected: this.state.rowsSelected,
            onChangeRowsPerPage: (num) => {
                this.changeRownum(num);
            },
            onViewColumnsChange: (changedColumn, action) => {
                this.hiddenCols(changedColumn, action);
            },
            onRowSelectionChange: (currentRowsSelected, allRows, rowsSelected) => {
                const { data } = this.state;
                rowId = null;
                if (rowsSelected.length > 0) {
                    rowId = data[rowsSelected[0]].palvelupakettiSisaltoId; //TODO: Muuta avain
                }
                this.setState({ rowsSelected: rowsSelected });
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
            customToolbarSelect: (selRows, displayData, setSelectedRows) => {
                const { data } = this.state;

                if ((selRows.data || []).length > 0) {
                    selectedRows = selRows.data.map(d => (d.dataIndex));
                    rowId = data[selectedRows[0]].palvelupakettiSisaltoId; //TODO: Muuta avain
                }

                var handleDelete = () => {
                    var data = cloneDeep(this.state.data);

                    if (window.confirm(dictionary.Toolbar.Confirmation + ' ' + selectedRows.map(d => data[d].palvelupakettiSisaltoId).join(", "))) { //TODO: Muuta avain
                        var requests = []
                        for (var i = 0; i < selectedRows.length; i++) {
                            requests.push(
                                authPost(this.props.pca, API_PREFIX + '/Delete/' + data[selectedRows[i]].palvelupakettiSisaltoId, { method: 'delete' }) //TODO: Muuta avain
                            );
                        }
                        Promise.all(requests)
                            .then(() => {
                                setSelectedRows([]);
                                authFetch(this.props.pca, API_PREFIX + '/Read')
                                    .then(response => response.json())
                                    .then(data => {
                                        this.setState({ data: data, rowsSelected: [] })
                                    });
                            });
                    }
                }

                var handleCopy = () => {
                    const { data } = this.state;
                    if (window.confirm(dictionary.Toolbar.Confirmation2 + selectedRows.map(d => data[d].palvelupakettiSisaltoId).join(", "))) {
                        var requests = []
                        for (var i = 0; i < selectedRows.length; i++) {
                            const row = data[selectedRows[i]];
                            var newrow = {
                                PalvelupakettiSisaltoId: 1,
                                Palvelupaketti_Id: row.palvelupaketti_Id,
                                Toiminnot_Id: row.toiminnot_Id,
                                Entiteetti_Id: row.entiteetti_Id,
                                Maksimi: row.maksimi,
                                Created: row.created,
                                Updated: row.updated,
                                Username: row.username,
                                Active: row.active
                            };
                            requests.push(
                                authPost(this.props.pca, API_PREFIX + '/Create', { body: JSON.stringify(newrow) })
                            );
                        }
                        Promise.all(requests)
                            .then(() => {
                                authFetch(this.props.pca, API_PREFIX + '/Read')
                                    .then(response => response.json())
                                    .then(data => {
                                        this.setState({ data: data, rowsSelected: [] })
                                    });
                            });
                    }
                }
                // TODO: Edit kohtaan oma toiminto
                return (
                    <div className={"custom-toolbar-select"}>
                        {selectedRows.length < 2 ? (
                            <React.Fragment>
                                <AdminPalvelupakettiEdit onEditRow={this.editItem} lookupLists={this.state.lookupLists} Daatta={this.state.data} rowId={(displayData.length > selRows.data[0].index ? displayData[selRows.data[0].index].data[0] : displayData[0].data[0])} />
                                <Tooltip title={dictionary.Toolbar.Delete}>
                                    <IconButton onClick={handleDelete}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </React.Fragment>
                        ) : (
                            <Tooltip title={dictionary.Toolbar.Delete}>
                                <IconButton onClick={handleDelete}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </div>
                );
            },
            customToolbar: () => {
                return (
                    <React.Fragment>
                        <AdminPalvelupakettiAdd onAddNewRow={this.addNewItem} lookupLists={this.state.lookupLists} onLookupListChange={this.addNewLookupItem} />
                        <SortColButton columns={cols} onOrderChange={this.swapCols} />
                    </React.Fragment>
                );
            }
        };
        return (
            <div style={{ padding: "10px" }}>
                {(this.state.loading) ? (
                    <CircularProgress />
                ) : (
                    <MUIDataTable
                        title={dictionary.Palvelupaketti.Title}
                        data={this.state.data}
                        columns={cols}
                        options={options}
                    />
                )
                }
                <ErrorDialog open={errorShow} title={errorTitle} body={errorBody} onClose={this.handleErrorClose} />
            </div>
        );
    }
}

function get_ordered_columns(list, hidden) {
    var columns = [];

    if (!Array.isArray(list)) {
        list = default_columns.map((c) => (c.name));
    }

    list.forEach(function (el) {
        columns.push((default_columns.filter(function (d) { return d.name == el; }) || [])[0]);
        if (hidden != null) {
            if (!(columns[columns.length - 1].options))
                columns[columns.length - 1].options = {};
            if (hidden.indexOf(columns[columns.length - 1].name) > -1) {
                columns[columns.length - 1].options.display = false;
            } else {
                columns[columns.length - 1].options.display = true;
            }
        }
    });

    return columns;
}