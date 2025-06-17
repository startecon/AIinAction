import React, { Component } from 'react';
import MUIDataTable from 'mui-datatables';
import ToiminnotAdd from "./ToiminnotAdd";
import ToiminnotEdit from "./ToiminnotEdit";
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import cloneDeep from 'lodash.clonedeep';
import Switch from '@mui/material/Switch';
import SortColButton from "./SortColButton";
import ErrorDialog from './ErrorDialog';
import FileCopyIcon from "@mui/icons-material/FileCopy";

import { authFetch, authPost } from "./../authProvider";
import { LanguageContext } from './LanguageContext';
import moment from 'moment';

/* Näkymäkohtaiset muuttujat ja vakiot */
const API_PREFIX = 'api/Toiminnot';

/*
public int RiviAvain { get; set; }
public string Paketti { get; set; }
public string Toiminto { get; set; }
public bool Aktivoitu { get; set; }
public DateTime? Created { get; set; }
public DateTime? Updated { get; set; }
public string Username { get; set; }
public bool? Active { get; set; }
*/

var default_columns = [
    {
        label: "RiviAvain",
        name: "riviAvain",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Paketti",
        name: "paketti",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "Toiminto",
        name: "toiminto",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "Aktivoitu",
        name: "aktivoitu",
        options: {
            filter: false,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <Switch
                        checked={value}
                        onChange={(e) => {
                            itemActivation(tableMeta.rowData, e.target.checked, that);
                        }
                        }
                        color="primary"
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                );
            }
        }
    },
    {
        label: "Luotu",
        name: "created",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Muokattu",
        name: "updated",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Muokkaaja",
        name: "username",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Käytössä",
        name: "active",
        options: {
            filter: false,
            display: false
        }
    },
];


/* Perusmuuttujat ja vakiot */
const PROFIILI_GET = 'api/Profiili/Read';
const PROFIILI_PUT = 'api/Profiili/Update';

var selectedRows = [];
var rowId;
var items = [];
var that;

/* Luokka */
export class Toiminnot extends Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        // State alustukset
        this.state = {
            rowsSelected: [],
            loading: true
        };

        //Bindit
        this.swapCols = this.swapCols.bind(this);
        this.addNewItem = this.addNewItem.bind(this);
    };

    componentDidMount() {
        that = this;

        //Items
        authFetch(this.props.pca, API_PREFIX + '/Read')
            .then(response => response.json())
            .then(data => {
                items = data

                //Profiili
                authFetch(this.props.pca, PROFIILI_GET)
                    .then(response => response.json())
                    .then(data => {
                        var cols = (((JSON.parse(data.uI_Settings) || {}).columns || {}).toiminnot || []); // TODO: muuta avain
                        if (cols.length > 0) cols = JSON.parse(cols);
                        else cols = null;

                        // hidden cols
                        var hidden_cols = (((JSON.parse(data.uI_Settings) || {}).hiddencolumns || {}).toiminnot || []); // TODO: muuta avain
                        if (hidden_cols.length > 0) hidden_cols = JSON.parse(hidden_cols);
                        else hidden_cols = null;

                        // rowNum
                        var rowNum = (((JSON.parse(data.uI_Settings) || {}).rownum || {}).toiminnot || []); // TODO: muuta avain
                        if (rowNum.length > 0) rowNum = JSON.parse(rowNum);
                        else rowNum = 20;

                        var columns = get_ordered_columns(cols, hidden_cols);

                        that.setState({
                            columns: columns,
                            data: items,
                            rowNum: rowNum,
                            loading: false
                        });
                    });
            });
    };

    swapCols = (index) => {
        if (index > 1) {
            var cols = cloneDeep(this.state.columns);
            var d = this.state.data;
            [cols[index - 1], cols[index]] = [cols[index], cols[index - 1]];
            this.setState({ columns: cols });
            var setting = { "key": "columns.toiminnot", "value": JSON.stringify(cols.map(function (d) { return d.name; })).split('"').join('""') }; // TODO: muuta avain
            authPost(this.props.pca, PROFIILI_PUT, {
                body: JSON.stringify(setting)
            }).then(res => console.log(res));
        }
    };

    changeRownum = (num) => {
        this.setState({ rowNum: num })

        var setting = { "key": "rownum.toiminnot", "value": JSON.stringify(num).split('"').join('""') }; // TODO: muuta avain
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
        var setting = { "key": "hiddencolumns.toiminnot", "value": (hidden.length > 0 ? JSON.stringify(hidden).split('"').join('""') : "[]") }; // TODO: muuta avain
        authPost(this.props.pca, PROFIILI_PUT, {
            body: JSON.stringify(setting)
        })
    };

    addNewItem = (newrow) => {
        authPost(this.props.pca, API_PREFIX + '/Create', {
            body: JSON.stringify(newrow)
        })
            .then(response => response.json())
            .then(data => {
                if ((data || {}).error) {
                    this.handleError(data.error);
                } else {
                    authFetch(this.props.pca, API_PREFIX + '/Read')
                        .then(response => response.json())
                        .then(data => {
                            this.setState({ data: data })
                        });
                }
            });
    };

    editItem = (newrow) => {
        // EDIT
        authPost(this.props.pca, API_PREFIX + '/Update', {
            body: JSON.stringify(newrow)
        })
            .then(response => response.json())
            .then(data => {
                if ((data || {}).error) {
                    this.handleError(data.error);
                } else {
                    authFetch(this.props.pca, API_PREFIX + '/Read')
                        .then(response => response.json())
                        .then(data => {
                            this.setState({ data: data })
                        });
                }
            });
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

    render() {
        const { userLanguage, dictionary } = this.context;
        const { errorShow, errorTitle, errorBody } = this.state;

        var cols = cloneDeep(this.state.columns);
        if ((cols || []).length > 0) {
            for (var i = 0; i < default_columns.length; i++) {
                for (var j = 0; j < cols.length; j++) {
                    if (cols[j].label == default_columns[i].label) {
                        cols[j].label = dictionary.Toiminnot.Columns[i]
                    }
                }
            }
        }

        var options = {
            textLabels: dictionary.DataTableLabels,
            selectableRowsHeader: true,
            selectableRowsOnClick: false,
            selectableRows: "single",
            filterType: 'dropdown',
            responsive: "standard",
            rowsPerPageOptions: [5, 10, 25, 50, 100],
            rowsPerPage: this.state.rowNum,
            jumpToPage: true,
            tableBodyHeight: "calc(100vh - 180px)",
            rowsSelected: this.state.rowsSelected,
            onViewColumnsChange: (changedColumn, action) => {
                this.hiddenCols(changedColumn, action);
            },
            onRowSelectionChange: (currentRowsSelected, allRows, rowsSelected) => {
                const { data } = this.state;
                rowId = null;
                if (rowsSelected.length > 0) {
                    rowId = data[rowsSelected[0]].riviAvain; //TODO: Muuta avain
                    console.log(rowsSelected, rowId);
                }
                this.setState({ rowsSelected: rowsSelected });
            },
            onChangeRowsPerPage: (num) => {
                this.changeRownum(num);
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
                    rowId = data[selectedRows[0]].riviAvain; //TODO: Muuta avain
                }

                var handleDelete = () => {
                    var data = cloneDeep(this.state.data);

                    if (window.confirm(dictionary.Toolbar.Confirmation + selectedRows.map(d => data[d].riviAvain).join(", "))) { //TODO: Muuta avain
                        var requests = []
                        for (var i = 0; i < selectedRows.length; i++) {
                            requests.push(
                                authPost(this.props.pca, API_PREFIX + '/Delete/' + data[selectedRows[i]].riviAvain, { method: 'delete' }) //TODO: Muuta avain
                            );
                        }
                        Promise.all(requests)
                            .then(() => {
                                setSelectedRows([]);
                                authFetch(this.props.pca, API_PREFIX + '/Read')
                                    .then(response => response.json())
                                    .then(data => {
                                        this.setState({ data: data, rowsSelected: [] });
                                    });
                            });
                    }
                }

                // TODO: Edit kohtaan oma toiminto
                return (
                    <div className={"custom-toolbar-select"}>
                        {(selectedRows.length < 2) ? (
                            <React.Fragment>
                                <div className={"custom-toolbar-select"}>
                                    <ToiminnotEdit onEditRow={this.editItem} Daatta={this.state.data} rowId={rowId} />
                                    <Tooltip title={dictionary.Toolbar.Delete}>
                                        <IconButton onClick={handleDelete}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <Tooltip title={dictionary.Toolbar.Delete}>
                                    <IconButton onClick={handleDelete}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </React.Fragment>
                        )}
                    </div>
                );
            },
            customToolbar: () => {
                return (
                    <React.Fragment>
                        <ToiminnotAdd onAddNewRow={this.addNewItem} Daatta={this.state.data} />
                    </React.Fragment>
                );
            }
        };
        return (
            <div className="Cont">
                <div>
                    {(this.state.loading) ? (
                        <CircularProgress />
                    ) : (
                        <MUIDataTable
                            title={dictionary.Toiminnot.Title}
                            data={this.state.data}
                            columns={cols}
                            options={options}
                        />
                    )
                    }
                </div>
                <ErrorDialog open={errorShow} title={errorTitle} body={errorBody} onClose={this.handleErrorClose} />
            </div>
        );
    }
}

function itemActivation(rowdata, value, that) {
    var data = {
        RiviAvain: rowdata[0],
        Paketti: rowdata[1],
        Toiminto: rowdata[2],
        Aktivoitu: value,
        Created: rowdata[4],
        Updated: rowdata[5],
        Username: rowdata[6],
        Active: rowdata[7]
    };

    that.editItem(data);
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