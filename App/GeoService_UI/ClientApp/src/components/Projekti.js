import React, { Component } from 'react';
import MUIDataTable from 'mui-datatables';
import ProjektiAdd from "./ProjektiAdd";
import ProjektiEdit from "./ProjektiEdit";
import ProjektiPreview from "./ProjektiPreview";
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import cloneDeep from 'lodash.clonedeep';
import SortColButton from "./SortColButton";

import { authFetch, authPost } from "./../authProvider";
import { LanguageContext } from './LanguageContext';

/* Näkymäkohtaiset muuttujat ja vakiot */
const API_PREFIX = 'api/Projekti';
const API_ASIAKKAAT_PREFIX = 'api/Asiakas';

/* 
public int RiviAvain { get; set; }
public int AsiakasAvain { get; set; }
public string ProjektiNimi { get; set; }
public DateTime? Created { get; set; }
public DateTime? Updated { get; set; }
public string Username { get; set; }
public bool? Active { get; set; }
*/

var default_columns = [
    {
        label: "Projekti Avain",
        name: "riviAvain",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Asiakas",
        name: "asiakasAvain",
        options: {
            filter: true,
            customBodyRender: function (value, tableMeta, updateValue) {
                return asiakkaat[value];
            }
        }
    },
    {
        label: "Projekti",
        name: "projektiNimi",
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
var asiakkaat = {};

/* Luokka */
export class Projekti extends Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        // State alustukset
        this.state = {
            lookupLists: {
                asiakkaat: asiakkaat
            },
            loading: true
        };

        //Bindit
        this.swapCols = this.swapCols.bind(this);
        this.addNewItem = this.addNewItem.bind(this);
    };

    componentDidMount() {
        var that = this;

        //Asiakkaat
        authFetch(this.props.pca, API_ASIAKKAAT_PREFIX + '/Read')
            .then(response => response.json())
            .then(data => {
                data.forEach(function (d, i) {
                    asiakkaat[d.riviAvain] = (d.asiakasNimi || 'ei tietoja');
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
                                console.log(data);
                                var cols = (((JSON.parse(data.uI_Settings) || {}).columns || {}).projekti || []); // TODO: muuta avain
                                if (cols.length > 0) cols = JSON.parse(cols);
                                else cols = null;
                                var columns = get_ordered_columns(cols);
                                that.setState({
                                    lookupLists: {
                                        asiakkaat: asiakkaat
                                    },
                                    columns: columns,
                                    data: items,
                                    loading: false
                                });
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
            var setting = { "key": "columns.projekti", "value": JSON.stringify(cols.map(function (d) { return d.name; })).split('"').join('""') }; // TODO: muuta avain
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
    };

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
    };

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
            //TODO: Identity_insert on ja id mukaan
            if (list === "asiakkaat") {
                authPost(this.props.pca, API_ASIAKKAAT_PREFIX + '/Create', options);
            }
        }
    };

    render() {
        const { dictionary } = this.context;
        var options = {
            selectableRows: "single",
            filterType: 'dropdown',
           responsive: "standard",
            rowsPerPageOptions: [5, 10, 25, 50, 100],
            rowsPerPage: 10,
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
                        <ProjektiPreview Daatta={this.state.data} lookupLists={this.state.lookupLists} rowId={rowId} />
                        <ProjektiEdit onEditRow={this.editItem} lookupLists={this.state.lookupLists} onLookupListChange={this.addNewLookupItem} Daatta={this.state.data} rowId={rowId} />
                        <Tooltip title={dictionary.Toolbar.Delete}>
                            <IconButton onClick={handleDelete}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                );
            },
            customToolbar: () => {
                return (
                    <React.Fragment>
                        <ProjektiAdd onAddNewRow={this.addNewItem} lookupLists={this.state.lookupLists} onLookupListChange={this.addNewLookupItem} />
                        <SortColButton columns={this.state.columns} onOrderChange={this.swapCols} />
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
                                title={dictionary.Projekti.Title}
                                data={this.state.data}
                                columns={this.state.columns}
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