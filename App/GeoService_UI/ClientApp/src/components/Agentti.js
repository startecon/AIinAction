import React from 'react';
import MUIDataTable from 'mui-datatables';
import AgenttiAdd from "./AgenttiAdd";
import AgenttiEdit from "./AgenttiEdit";
import AgenttiPreview from "./AgenttiPreview";
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import cloneDeep from 'lodash.clonedeep';
import SortColButton from "./SortColButton";

import { authFetch, authPost } from "./../authProvider";
import { LanguageContext } from './LanguageContext';

/* Näkymäkohtaiset muuttujat ja vakiot */
const API_PREFIX = 'api/Agentti';
const API_KOODIT_PREFIX = 'api/Koodi';
const API_PROJEKTIT_PREFIX = 'api/Projekti';

/*
public int RiviAvain { get; set; }
public int ProjektiAvain { get; set; }
public int TyyppiAvain { get; set; }
public string AgenttiNimi { get; set; }
public int OSAvain { get; set; }
public int CPU { get; set; }
public int CPUAvain { get; set; }
public int Muisti { get; set; }
public int Levykoko { get; set; }
public int GPU { get; set; }
public int GPUAvain { get; set; }
public string Kuvaus { get; set; }
public string RekisterointiAvain { get; set; }
public DateTime? Syke { get; set; }
public DateTime? Created { get; set; }
public DateTime? Updated { get; set; }
public string Username { get; set; }
public bool? Active { get; set; }
*/

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
            }
        }
    },
    {
        label: "Resurssityyppi",
        name: "tyyppiAvain",
        options: {
            filter: true,
            customBodyRender: function (value, tableMeta, updateValue) {
                return tyypit[value];
            }
        }
    },
    {
        label: "Agenttinimi",
        name: "agenttiNimi",
        options: {
            filter: false,
            display: true
        }
    },
    {
        label: "Käyttöjärjestelmä",
        name: "osAvain",
        options: {
            filter: true,
            customBodyRender: function (value, tableMeta, updateValue) {
                return kayttikset[value];
            }
        }
    },
    {
        label: "Prosessoriytimet",
        name: "cpu",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "Prosessorityyppi",
        name: "cpuAvain",
        options: {
            filter: true,
            customBodyRender: function (value, tableMeta, updateValue) {
                return cput[value];
            }
        }
    },
    {
        label: "Muisti",
        name: "muisti",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "Levykoko",
        name: "levykoko",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "GPU-prosessorit",
        name: "gpu",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "GPU-tyyppi",
        name: "gpuAvain",
        options: {
            filter: true,
            customBodyRender: function (value, tableMeta, updateValue) {
                return gput[value];
            }
        }
    },
    {
        label: "Kuvaus",
        name: "kuvaus",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "RekisterointiAvain",
        name: "rekisterointiAvain",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "Syke",
        name: "syke",
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
var projektit = {};
var tyypit = {};
var kayttikset = {};
var cput = {};
var gput = {};

/* Luokka */
export class Agentti extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        // State alustukset
        this.state = {
            lookupLists: {
                koodit: koodit,
                projektit: projektit,
                tyypit: tyypit,
                kayttikset: kayttikset,
                cput: cput,
                gput: gput
            },
            loading: true
        };

        //Bindit
        this.swapCols = this.swapCols.bind(this);
        this.addNewItem = this.addNewItem.bind(this);
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
                //koodit
                authFetch(this.props.pca, API_KOODIT_PREFIX + '/Read')
                    .then(response => response.json())
                    .then(data => {
                
                        data.forEach(function (d, i) {
                            koodit[d.koodiAvain] = (d.koodiNimi || 'ei tietoja');

                            /*
                            * TODO: Kovakoodatut arvot
                                Id	Koodiryhma
                                1	RiviTila
                                2	CPU
                                3	GPU
                                4	Laskentaresurssi
                                5	Käyttöjärjestelmä
                            */

                            if (d.koodiryhmaAvain == 2) cput[d.koodiAvain] = koodit[d.koodiAvain];
                            if (d.koodiryhmaAvain == 3) gput[d.koodiAvain] = koodit[d.koodiAvain];
                            if (d.koodiryhmaAvain == 4) tyypit[d.koodiAvain] = koodit[d.koodiAvain];
                            if (d.koodiryhmaAvain == 5) kayttikset[d.koodiAvain] = koodit[d.koodiAvain];

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
                                        var cols = (((JSON.parse(data.uI_Settings) || {}).columns || {}).agentti || []); //TODO muuta avain
                                        if (cols.length > 0) cols = JSON.parse(cols);
                                        else cols = null;
                                        var columns = get_ordered_columns(cols);
                                        that.setState({
                                            lookupLists: {
                                                koodit: koodit,
                                                projektit: projektit,
                                                tyypit: tyypit,
                                                kayttikset: kayttikset,
                                                cput: cput,
                                                gput: gput
                                            },
                                            columns: columns,
                                            data: items,
                                            loading: false
                                        });
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
            var setting = { "key": "columns.agentti", "value": JSON.stringify(cols.map(function (d) { return d.name; })).split('"').join('""') }; //TODO muuta avain
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

            const options = {
                body: JSON.stringify(item)
            }
            
            //TODO: Identity_insert on ja id mukaan
            if (list === "koodit") {
                data[list][id] = item.split(';')[0];
                var koodiryhma = parseInt(item.split(';')[1]);
                /*
                            * TODO: Kovakoodatut arvot
                                Id	Koodiryhma
                                1	RiviTila
                                2	CPU
                                3	GPU
                                4	Laskentaresurssi
                                5	Käyttöjärjestelmä
                            */

                if (koodiryhma == 2) data.cput[id] = data[list][id];
                if (koodiryhma == 3) data.gput[id] = data[list][id];
                if (koodiryhma == 4) data.tyypit[id] = data[list][id];
                if (koodiryhma == 5) data.kayttikset[id] = data[list][id];

                authPost(this.props.pca, API_KOODIT_PREFIX + '/CreateAddHoc', options);

            } else if (list === "projektit") {
                authPost(this.props.pca, API_PROJEKTIT_PREFIX + '/Create', options); //TODO: pakolliset kentät puuttuu
                data[list][id] = item;

            } else {
                data[list][id] = item;
            }

            this.setState({ lookupLists: data });
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
                        <AgenttiPreview Daatta={this.state.data} lookupLists={this.state.lookupLists} rowId={rowId} />
                        <AgenttiEdit onEditRow={this.editItem} lookupLists={this.state.lookupLists} onLookupListChange={this.addNewLookupItem} Daatta={this.state.data} rowId={rowId} />
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
                        <AgenttiAdd onAddNewRow={this.addNewItem} lookupLists={this.state.lookupLists} onLookupListChange={this.addNewLookupItem} />
                        <SortColButton columns={this.state.columns} onOrderChange={this.swapCols} />
                    </React.Fragment>
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
            }
        };
        return (
            <div className="Cont">
                <div>
                    {(this.state.loading) ? (
                        <CircularProgress />
                    ) : (
                            <MUIDataTable
                                title={dictionary.Agentti.Title}
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