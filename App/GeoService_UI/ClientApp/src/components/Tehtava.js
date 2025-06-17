import React from 'react';
import MUIDataTable from 'mui-datatables';
import TehtavaAdd from "./TehtavaAdd";
import TehtavaEdit from "./TehtavaEdit";
import TehtavaPreview from "./TehtavaPreview";
import TehtavaSchedule from "./TehtavaSchedule";
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import cloneDeep from 'lodash.clonedeep';
import SortColButton from "./SortColButton";

import { authFetch, authPost } from "./../authProvider";
import { LanguageContext } from './LanguageContext';

/* Näkymäkohtaiset muuttujat ja vakiot */
const API_PREFIX = 'api/Tehtava';
const API_KOODIT_PREFIX = 'api/Koodi';
const API_PROJEKTIT_PREFIX = 'api/Projekti';
const API_TILAT_PREFIX = 'api/Tila';
const API_AJO_PREFIX = 'api/Ajo';

Object.defineProperty(Date.prototype, 'YYYYMMDDHHMMSS', {
    value: function () {
        function pad2(n) {  // always returns a string
            return (n < 10 ? '0' : '') + n;
        }

        return this.getFullYear() +
            pad2(this.getMonth() + 1) +
            pad2(this.getDate()) +
            pad2(this.getHours()) +
            pad2(this.getMinutes()) +
            pad2(this.getSeconds());
    }
});

var default_columns = [
    {
        label: "Rivi",
        name: "riviAvain",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Projekti",
        name: "projektiAvain",
        options: {
            filter: true,
            customBodyRender: function (value, tableMeta, updateValue) {
                return projektit[value];
            },
            lookuplist: 'projektit'
        }
    },
    {
        label: "Tehtävä",
        name: "tehtavaNimi",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "Malli",
        name: "malli",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Tila",
        name: "tilaAvain",
        options: {
            filter: true,
            customBodyRender: function (value, tableMeta, updateValue) {
                return tilat[value];
            },
            lookuplist: 'tilat'
        }
    },
    {
        label: "Rivitila",
        name: "riviTilaAvain",
        options: {
            filter: true,
            customBodyRender: function (value, tableMeta, updateValue) {
                return rivitilat[value];
            },
            lookuplist: 'rivitilat'
        }
    },
    {
        label: "Selite",
        name: "selite",
        options: {
            filter: true,
            display: true
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
            filter: true,
            display: false
        }
    },
    {
        label: "Käytössä",
        name: "active",
        options: {
            filter: true,
            display: false
        }
    },
];


/* Perusmuuttujat ja vakiot */
const PROFIILI_GET = 'api/Profiili/Read';
const PROFIILI_PUT = 'api/Profiili/Update';

var rowId;
var items = [];
var koodit = {};
var rivitilat = {};
var projektit = {};
var tilat = {};
var selectedRows = [];

/* Luokka */
export class Tehtava extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        // State alustukset
        this.state = {
            lookupLists: {
                koodit: koodit,
                rivitilat: rivitilat,
                projektit: projektit,
                tilat: tilat
            },
            loading: true
        };

        //Bindit
        this.swapCols = this.swapCols.bind(this);
        this.addNewItem = this.addNewItem.bind(this);
        this.editItem = this.editItem.bind(this);
        this.addNewLookupItem = this.addNewLookupItem.bind(this);
        this.closeItem = this.closeItem.bind(this);
    };

    componentDidMount() {
        var that = this;

        //projektit
        authFetch(this.props.pca, API_PROJEKTIT_PREFIX + '/Read')
            .then(response => response.json())
            .then(data => {
                data.forEach(function (d, i) {
                    projektit[d.riviAvain] = (d.projektiNimi || 'ei tietoja');
                });
                //tilat
                authFetch(this.props.pca, API_TILAT_PREFIX + '/Read')
                    .then(response => response.json())
                    .then(data => {
                        data.forEach(function (d, i) {
                            tilat[d.tilaAvain] = (d.tilanimi || 'ei tietoja');
                        });
                        //koodit
                        authFetch(this.props.pca, API_KOODIT_PREFIX + '/Read')
                            .then(response => response.json())
                            .then(data => {

                                data.forEach(function (d, i) {
                                    koodit[d.koodiAvain] = (d.koodiNimi || 'ei tietoja');

                                    if (d.koodiryhmaAvain == 1) rivitilat[d.koodiAvain] = koodit[d.koodiAvain];
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
                                                // ordering
                                                var cols = (((JSON.parse(data.uI_Settings) || {}).columns || {}).tehtava || []); // TODO: Muuta avain
                                                if (cols.length > 0) cols = JSON.parse(cols);
                                                else cols = null;

                                                // hidden cols
                                                var hidden_cols = (((JSON.parse(data.uI_Settings) || {}).hiddencolumns || {}).tehtava || []); // TODO: Muuta avain
                                                if (hidden_cols.length > 0) hidden_cols = JSON.parse(hidden_cols);
                                                else hidden_cols = null;

                                                // rowNum
                                                var rowNum = (((JSON.parse(data.uI_Settings) || {}).rownum || {}).tehtava || []); // TODO: Muuta avain
                                                if (rowNum.length > 0) rowNum = JSON.parse(rowNum);
                                                else rowNum = 20;

                                                var columns = get_ordered_columns(cols, hidden_cols);

                                                that.setState({
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
    };

    updateData = () => {
        authFetch(this.props.pca, API_PREFIX + '/Read')
            .then(response => response.json())
            .then(data => {
                this.setState({ data: data })
            });
    }

    swapCols = (index) => {
        if (index > 1) {
            var cols = cloneDeep(this.state.columns);
            var d = this.state.data;
            [cols[index - 1], cols[index]] = [cols[index], cols[index - 1]];
            this.setState({ columns: cols });
            var setting = { "key": "columns.tehtava", "value": JSON.stringify(cols.map(function (d) { return d.name; })).split('"').join('""') }; // TODO: Muuta avain
            authPost(this.props.pca, PROFIILI_PUT, {
                body: JSON.stringify(setting)
            }).then(res => console.log(res));
        }
    };

    changeRownum = (num) => {
        this.setState({ rowNum: num })

        var setting = { "key": "rownum.tehtava", "value": JSON.stringify(num).split('"').join('""') }; // TODO: Muuta avain
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
        var setting = { "key": "hiddencolumns.tehtava", "value": (hidden.length > 0 ? JSON.stringify(hidden).split('"').join('""') : "[]") }; // TODO: Muuta avain
        authPost(this.props.pca, PROFIILI_PUT, {
            body: JSON.stringify(setting)
        })
    };

    addNewItem = (newrow) => {
        // ADD
        authPost(this.props.pca, API_PREFIX + '/Create', {
            body: JSON.stringify(newrow)
        })
    };

    editItem = (newrow) => {
        // EDIT
        authPost(this.props.pca, API_PREFIX + '/Update', {
            body: JSON.stringify(newrow)
        })
    };

    closeItem = (itemChanged) => {
        if (itemChanged) {
            this.updateData();
        }
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
            //TODO: Identity_insert on ja id mukaan
            if (list === "koodit") {
                authPost(this.props.pca, API_KOODIT_PREFIX + '/CreateAddHoc', options);
            }
            if (list === "tilat") {
                authPost(this.props.pca, API_TILAT_PREFIX + '/Create', options);
            }
            if (list === "projektit") {
                authPost(this.props.pca, API_PROJEKTIT_PREFIX + '/CreateAddHoc', options);
            }
        }
    };

    runJob = () => {
        authFetch(this.props.pca, API_AJO_PREFIX + '/Kaynnista/' + rowId)
            .then(() => alert("Ajo käynnistetty"));
    }

    cancelJob = () => {
        authFetch(this.props.pca, API_AJO_PREFIX + '/Peruuta/' + rowId)
            .then(() => alert("Ajo pysäytetty"));
    }

    scheduleJob = (item) => {
        if (!item.Toistuva) {
            item.Lopetus = null;
            item.Aikavali = null;
        }
        if (item.Aloitus) {
            authFetch(this.props.pca, API_AJO_PREFIX + '/Ajasta/' + rowId + '/' + item.Aloitus + '/' + (item.Aikavali || 0) + '/' + (item.Lopetus || 0))
                .then(() => alert("Ajo ajastettu"));
        } else {
            alert("Ajastus epäonnistui");
        }
    }

    render() {
        const { dictionary } = this.context;
        var options = {
            selectableRowsHeader: true,
            selectableRowsOnClick: true,
            selectableRows: "multiple",
            //selectToolbarPlacement: 'above',
            filterType: 'dropdown',
            responsive: "vertical",
            onChangeRowsPerPage: (num) => {
                this.changeRownum(num);
            },
            rowsPerPage: (this.state.rowNum || 5),
            rowsPerPageOptions: [5, 10, 20, 50, 100, 200],
            onViewColumnsChange: (changedColumn, action) => {
                this.hiddenCols(changedColumn, action);
            },
            onRowSelectionChange: (currentRowsSelected, allRows, rowsSelected) => {
                const { data } = this.state;
                rowId = null;
                if (rowsSelected.length > 0) {
                    rowId = data[rowsSelected[0]].riviAvain; //TODO: Muuta avain
                }
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
                    rowId = data[selectedRows[0]].riviAvain;
                }

                var handleDelete = () => {
                    var data = cloneDeep(this.state.data);

                    if (window.confirm(dictionary.Toolbar.Confirmation)) {
                        var requests = []
                        for (var i = 0; i < selectedRows.length; i++) {
                            requests.push(
                                authPost(this.props.pca, API_PREFIX + '/Delete/' + data[selectedRows[i]].riviAvain, { method: 'delete' }) //TODO: Muuta avain
                            );
                        }
                        Promise.all(requests)
                            .then(() => {
                                setSelectedRows([]);
                                this.updateData();
                            });
                    }
                }

                var handleCopy = () => {
                    const { data } = this.state;
                    var requests = []
                    for (var i = 0; i < selectedRows.length; i++) {
                        const row = data[selectedRows[i]];
                        var newrow = {
                            RiviAvain: 1, //dummy-arvo
                            ProjektiAvain: row.projektiAvain,
                            TehtavaNimi: row.tehtavaNimi + '-kopio',
                            Malli: row.malli,
                            TilaAvain: 1,
                            RiviTilaAvain: 1,
                            Selite: 'Kopio tehtävästä ' + row.tehtavaNimi,
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
                            setSelectedRows([]);
                            this.updateData();
                        });
                }


                return (
                    <div className={"custom-toolbar-select"}>
                        {(selectedRows.length < 2) ? (
                            <React.Fragment>
                                <Tooltip title={dictionary.Tehtava.Tooltip1}>
                                    <IconButton onClick={this.runJob}>
                                        <PlayArrowIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={dictionary.Tehtava.Tooltip2}>
                                    <IconButton onClick={this.cancelJob}>
                                        <StopIcon />
                                    </IconButton>
                                </Tooltip>
                                <TehtavaSchedule onScheduleRow={this.scheduleJob} rowId={rowId} />
                                <TehtavaPreview Daatta={this.state.data} lookupLists={this.state.lookupLists} rowId={rowId} />
                                <TehtavaEdit onEditRow={this.editItem} onClose={this.closeItem} lookupLists={this.state.lookupLists} onLookupListChange={this.addNewLookupItem} Daatta={this.state.data} rowId={rowId} />
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
                        <TehtavaAdd onAddNewRow={this.addNewItem} onClose={this.closeItem} lookupLists={this.state.lookupLists} onLookupListChange={this.addNewLookupItem} />
                        <SortColButton columns={this.state.columns} onOrderChange={this.swapCols} />
                        <Tooltip title={dictionary.Toolbar.Update}>
                            <IconButton onClick={this.updateData}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
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
                            title={dictionary.Tehtava.Title}
                            data={this.state.data}
                            columns={this.state.columns}
                            options={options}
                        />
                    )
                }
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