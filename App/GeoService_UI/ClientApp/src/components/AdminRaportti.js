import React, { Component } from 'react';
import MUIDataTable from 'mui-datatables';
import AdminRaporttiAdd from "./AdminRaporttiAdd";
import AdminRaporttiEdit from "./AdminRaporttiEdit";
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import cloneDeep from 'lodash.clonedeep';
import SortColButton from "./SortColButton";
import ErrorDialog from './ErrorDialog';

import { authFetch, authPost } from "./../authProvider";
import { LanguageContext } from './LanguageContext';
import moment from 'moment';

/* Näkymäkohtaiset muuttujat ja vakiot */
const API_PREFIX = 'api/Raportti';
const API_KOODIT_PREFIX = 'api/Koodi';

var default_columns = [
    {
        label: "RiviAvain",
        name: "riviAvain",
        options: {
            filter: true,
            display: false
        }
    },
    {
        label: "RyhmaAvain",
        name: "ryhmaAvain",
        options: {
            filter: true,
            customBodyRender: function (value, tableMeta, updateValue) {
                return ryhmat[value];
            }
        },
        lookuplist: 'ryhmat'
    },
    {
        label: "TyyppiAvain",
        name: "tyyppiAvain",
        options: {
            filter: true,
            customBodyRender: function (value, tableMeta, updateValue) {
                return tyypit[value];
            }
        },
        lookuplist: 'tyypit'
    },
    {
        label: "RaporttiAvain",
        name: "raporttiAvain",
        options: {
            filter: false,
            display: true
        }
    },
    {
        label: "Kieli",
        name: "kieli",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "RaporttiNimi",
        name: "raporttiNimi",
        options: {
            filter: false,
            display: true
        }
    },
    {
        label: "RaporttiTiedostoNimi",
        name: "raporttiTiedostoNimi",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "RaporttiKuvaus",
        name: "raporttiKuvaus",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "RaporttiTunnus",
        name: "raporttiTunnus",
        options: {
            filter: false,
            display: true
        }
    },
    {
        label: "Parametrit",
        name: "parametrit",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Tietojoukko",
        name: "tietojoukko",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Sivu",
        name: "sivu",
        options: {
            filter: false,
            display: true
        }
    },
    {
        label: "Suodattimet",
        name: "suodattimet",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "Raporttisivut",
        name: "raporttisivut",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "Kirjanmerkit",
        name: "kirjanmerkit",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "Asettelu",
        name: "asettelu",
        options: {
            filter: false,
            display: true
        }
    },
    {
        label: "Nosto",
        name: "nosto",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "Lisätiedot",
        name: "lisatiedot",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Luotu",
        name: "created",
        options: {
            filter: false,
            display: false,
            customBodyRender: function (value, tableMeta, updateValue) {
                var date = moment(value).format("D.M.YYYY, HH:mm");
                return moment(value).isValid() ? date : "";
            },
        }
    },
    {
        label: "Muokattu",
        name: "updated",
        options: {
            filter: false,
            display: false,
            customBodyRender: function (value, tableMeta, updateValue) {
                var date = moment(value).format("D.M.YYYY, HH:mm");
                return moment(value).isValid() ? date : "";
            },
        }
    },
    {
        label: "Username",
        name: "username",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Active",
        name: "active",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Kuva",
        name: "kuva",
        options: {
            filter: false,
            display: false
        }
    }
];

/* Perusmuuttujat ja vakiot */
const PROFIILI_GET = 'api/Profiili/Read';
const PROFIILI_PUT = 'api/Profiili/Update';

var rowId;
var selectedRows = [];
var items = [];
var koodit = {};
var ryhmat = {};
var tyypit = {};

/* Luokka */
export class AdminRaportti extends Component {
    static contextType = LanguageContext;

    constructor(props) {
        super(props);

        // State alustukset
        this.state = {
            rowsSelected: [],
            lookupLists: {
                koodit: koodit,
                ryhmat: ryhmat,
                tyypit: tyypit,
            },
            loading: true,
            rowNum: 25,
            errorShow: false,
            errorTitle: '',
            errorBody: '',
        };

        //Bindit
        this.swapCols = this.swapCols.bind(this);
        this.addNewItem = this.addNewItem.bind(this);

        //koodit
        authFetch(this.props.pca, API_KOODIT_PREFIX + '/Read')
            .then(response => response.json())
            .then(data => {
                data.forEach(function (d, i) {
                    koodit[d.koodiAvain] = (d.koodiNimi || 'ei tietoja');

                    /*
                    * TODO: Kovakoodatut arvot
                        Id	Koodiryhma
                        2	Raporttiryhmät
                        3	Tietopalvelut
                        4	Tyypit
                        5   Osiot
                    */

                    if (d.koodiryhmaAvain == 2) ryhmat[d.koodiAvain] = koodit[d.koodiAvain];
                    if (d.koodiryhmaAvain == 4) tyypit[d.koodiAvain] = koodit[d.koodiAvain];

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
                                var cols = (((JSON.parse(data.uI_Settings) || {}).columns || {}).raportti || []); // TODO: muuta avain
                                if (cols.length > 0) cols = JSON.parse(cols);
                                else cols = null;

                                // hidden cols
                                var hidden_cols = (((JSON.parse(data.uI_Settings) || {}).hiddencolumns || {}).raportti || []); // TODO: muuta avain
                                if (hidden_cols.length > 0) hidden_cols = JSON.parse(hidden_cols);
                                else hidden_cols = null;

                                // rowNum
                                var rowNum = (((JSON.parse(data.uI_Settings) || {}).rownum || {}).raportti || []); // TODO: muuta avain
                                if (rowNum.length > 0) rowNum = JSON.parse(rowNum);
                                else rowNum = 25;

                                var columns = get_ordered_columns(cols, hidden_cols);

                                this.setState({
                                    lookupLists: {
                                        koodit: koodit,
                                        ryhmat: ryhmat,
                                        tyypit: tyypit,
                                    },
                                    columns: columns,
                                    data: items,
                                    loading: false,
                                    rowNum: rowNum
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
            var setting = { "key": "columns.raportti", "value": JSON.stringify(cols.map(function (d) { return d.name; })).split('"').join('""') }; // TODO: muuta avain
            authPost(this.props.pca, PROFIILI_PUT, {
                body: JSON.stringify(setting)
            });
        }
    };

    changeRownum = (num) => {
        this.setState({ rowNum: num })

        var setting = { "key": "rownum.raportti", "value": JSON.stringify(num).split('"').join('""') }; // TODO: muuta avain
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
        var setting = { "key": "hiddencolumns.raportti", "value": (hidden.length > 0 ? JSON.stringify(hidden).split('"').join('""') : "[]") }; // TODO: muuta avain
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
    }

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
    }

    render() {
        const { dictionary } = this.context;
        const { errorShow, errorTitle, errorBody } = this.state;

        var cols = cloneDeep(this.state.columns);
        if ((cols || []).length > 0) {
            for (var i = 0; i < default_columns.length; i++) {
                for (var j = 0; j < cols.length; j++) {
                    if (cols[j].label == default_columns[i].label) {
                        cols[j].label = dictionary.AdminRaportti.Columns[i] //TODO: Muuta avain
                    }
                }
            }
        }

        var options = {
            textLabels: dictionary.MuiDataTable.textLabels,
            selectableRowsHeader: true,
            selectableRowsOnClick: true,
            selectableRows: "multiple",
            filterType: 'multiselect',
            responsive: "vertical",
            tableBodyHeight: "calc(100vh - 180px)",
            rowsPerPageOptions: [5, 10, 25, 50, 100],
            rowsPerPage: this.state.rowNum,
            jumpToPage: true,
            rowsSelected: this.state.rowsSelected,
            onViewColumnsChange: (changedColumn, action) => {
                this.hiddenCols(changedColumn, action);
            },
            onRowSelectionChange: (currentRowsSelected, allRows, rowsSelected) => {
                const { data } = this.state;
                rowId = null;
                if (rowsSelected.length > 0) {
                    rowId = data[rowsSelected[0]].riviAvain; //TODO: Muuta avain
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

                    if (window.confirm("Haluatko varmasti poistaa seuraavat kohteet: " + selectedRows.map(d => data[d].riviAvain).join(", "))) { //TODO: Muuta avain
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

                var handleCopy = () => {
                    const { data } = this.state;
                    if (window.confirm("Haluatko varmasti kopioida seuraavat kohteet: " + selectedRows.map(d => data[d].riviAvain).join(", "))) { //TODO: Muuta avain
                        var requests = []
                        for (var i = 0; i < selectedRows.length; i++) {
                            const row = data[selectedRows[i]];
                            var newrow = {
                                RiviAvain: 1, //dummy-arvo
                                RyhmaAvain: row.ryhmaAvain,
                                TyyppiAvain: row.tyyppiAvain,
                                RaporttiAvain: row.raporttiAvain,
                                Kieli: row.kieli,
                                RaporttiNimi: row.raporttiNimi + "-kopio",
                                RaporttiTiedostoNimi: row.raporttiTiedostoNimi,
                                RaporttiKuvaus: row.raporttiKuvaus,
                                RaporttiTunnus: row.raporttiTunnus,
                                Parametrit: row.parametrit,
                                Tietojoukko: row.tietojoukko,
                                Sivu: row.sivu,
                                Suodattimet: row.suodattimet,
                                Raporttisivut: row.raporttisivut,
                                Kirjanmerkit: row.kirjanmerkit,
                                Asettelu: row.asettelu,
                                Nosto: row.nosto,
                                Lisatiedot: row.lisatiedot,
                                Created: row.created,
                                Updated: row.updated,
                                Username: row.username,
                                Active: row.active,
                                Kuva: row.kuva
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
                                        this.setState({ data: data, rowsSelected: [] });
                                    });
                            });
                    }
                }

                return (
                    <div className={"custom-toolbar-select"}>
                        {(selectedRows.length < 2) ? (
                            <React.Fragment>
                                <div className={"custom-toolbar-select"}>
                                    <AdminRaporttiEdit onEditRow={this.editItem} lookupLists={this.state.lookupLists} onLookupListChange={this.addNewLookupItem} Daatta={this.state.data} rowId={rowId} />
                                    <Tooltip title={dictionary.Toolbar.Copy}>
                                        <IconButton onClick={handleCopy}>
                                            <FileCopyIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={dictionary.Toolbar.Delete}>
                                        <IconButton onClick={handleDelete}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <Tooltip title={dictionary.Toolbar.Copy}>
                                    <IconButton onClick={handleCopy}>
                                        <FileCopyIcon />
                                    </IconButton>
                                </Tooltip>
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
                        <AdminRaporttiAdd onAddNewRow={this.addNewItem} lookupLists={this.state.lookupLists} onLookupListChange={this.addNewLookupItem} Daatta={this.state.data} />
                        <SortColButton columns={this.state.columns} onOrderChange={this.swapCols} />
                    </React.Fragment>
                );
            }

        };

        //dictionary.<komponentin nimi>.Title
        return (
            <div style={{ padding: 10 }}>
                <div>
                    {(this.state.loading) ? (
                        <div style={{ width: "100%", height: "100vh" }}>
                            <CircularProgress />
                        </div>
                    ) : (
                        <MUIDataTable
                            title={dictionary.AdminRaportti.Title}
                            data={this.state.data}
                            columns={cols}
                            options={options}
                        />
                    )}
                </div>
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