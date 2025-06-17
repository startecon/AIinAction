import React from 'react';
import MUIDataTable from 'mui-datatables';
import CarbonAdd from "./CarbonAdd";
import CarbonEdit from "./CarbonEdit";
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import cloneDeep from 'lodash.clonedeep';
import SortColButton from "./SortColButton";

import { authFetch, authPost } from "./../authProvider";
import { LanguageContext } from './LanguageContext';

/* Näkymäkohtaiset muuttujat ja vakiot */
const API_PREFIX = 'api/Carbon';

/* 
public int RiviAvain { get; set; }
public string Source { get; set; }
public string FuelType { get; set; }
public string Amount { get; set; }
public string Unit { get; set; }
public string EmissionFactor { get; set; }
public string Username { get; set; }
public DateTime? Created { get; set; }
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
        label: "Source",
        name: "source",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "FuelType",
        name: "fuelType",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "Amount",
        name: "amount",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "Unit",
        name: "unit",
        options: {
            filter: true,
            display: true
        }
    },
    {
        label: "EmissionFactor",
        name: "emissionFactor",
        options: {
            filter: true,
            display: false
        }
    },
    {
        label: "Date",
        name: "date",
        options: {
            filter: false,
            display: true
        }
    },
    {
        label: "Username",
        name: "username",
        options: {
            filter: true,
            display: false
        }
    }
];


/* Perusmuuttujat ja vakiot */
const PROFIILI_GET = 'api/Profiili/Read';
const PROFIILI_PUT = 'api/Profiili/Update';

var rowId;
var items = [];

/* Luokka */
export class Carbon extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        // State alustukset
        this.state = {
            loading: true
        };

        //Bindit
        this.swapCols = this.swapCols.bind(this);
        this.addNewItem = this.addNewItem.bind(this);
    };

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
                        var cols = (((JSON.parse(data.uI_Settings) || {}).columns || {}).carbon || []); //TODO muuta avain
                        if (cols.length > 0) cols = JSON.parse(cols);
                        else cols = null;
                        var columns = get_ordered_columns(cols);
                        that.setState({
                            columns: columns,
                            data: items,
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
            var setting = { "key": "columns.carbon", "value": JSON.stringify(cols.map(function (d) { return d.name; })).split('"').join('""') }; //TODO muuta avain
            authPost(this.props.pca, PROFIILI_PUT, {
                method: "PUT",
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
    };

    render() {
        const { dictionary } = this.context;

        var cols = cloneDeep(this.state.columns);
        if ((cols || []).length > 0) {
            for (var i = 0; i < default_columns.length; i++) {
                for (var j = 0; j < cols.length; j++) {
                    if (cols[j].label == default_columns[i].label) {
                        cols[j].label = dictionary.Carbon.Columns[i]
                    }
                }
            }
        }

        var options = {
            selectableRowsHeader: true,
            selectableRowsOnClick: true,
            selectableRows: "multiple",
            filterType: 'multiselect',
            responsive: "vertical",
            tableBodyHeight: "calc(100vh - 140px)",
            rowsPerPageOptions: [5, 10, 25, 50, 100],
            rowsPerPage: 10,
            onRowSelectionChange: (currentRowsSelected, allRows, rowsSelected) => {
                const { data } = this.state;
                rowId = null;
                if (rowsSelected.length > 0) {
                    rowId = data[rowsSelected[0]].riviAvain; //TODO: Muuta avain
                }
                this.setState({ rowsSelected: rowsSelected });
            },
            customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
                rowId = displayData[selectedRows.data[0].index].data[0];
                var handleDelete = () => {
                    if (window.confirm(dictionary.Toolbar.Confirmation)) {
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
                        <CarbonEdit onEditRow={this.editItem} Daatta={this.state.data} rowId={rowId} />
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
                        <CarbonAdd onAddNewRow={this.addNewItem} />
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
                            title={dictionary.Carbon.Title}
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