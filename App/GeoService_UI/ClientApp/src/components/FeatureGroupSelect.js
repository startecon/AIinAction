import React from "react";
import PropTypes from 'prop-types';
import MUIDataTable from 'mui-datatables';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { authFetch, authPost } from "./../authProvider";
import { withStyles } from "@mui/styles";

import { LanguageContext } from './LanguageContext';

const defaultToolbarStyles = {
    iconButton: {
    },
};

/* Näkymäkohtaiset muuttujat ja vakiot */
const API_PREFIX = 'api/FeatureGroup';

const columns = [
    {
        label: "MuuttujaryhmäAvain",
        name: "id",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "IsäntäAvain",
        name: "parent_feature_group_id",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Nimi",
        name: "name",
        options: {
            filter: false,
            display: true
        }
    },
    {
        label: "Lisätietoja",
        name: "description",
        options: {
            filter: false,
            display: true
        }
    },
    {
        label: "ProjektiAvain",
        name: "project_id",
        options: {
            filter: true,
            display: false
        }
    },
    {
        label: "Versio",
        name: "version",
        options: {
            filter: true,
            display: false
        }
    },
    {
        label: "Tyyppi",
        name: "type_id",
        options: {
            filter: false,
            display: false
        }
    },
    {
        label: "Muokannut",
        name: "modified",
        options: {
            filter: false,
            display: true
        }
    },
    {
        label: "Muokattu",
        name: "start_time",
        options: {
            filter: false,
            display: true
        }
    }
];

var rowId = null;

class FeatureGroupSelect extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            Salaisuus: null,
            columns: columns,
            data: null
        };
    }

    static propTypes = {
        onValue: PropTypes.func,
        name: PropTypes.object,
        classes: PropTypes.object,
        blurOnSelect: PropTypes.bool
    };

    handleSave = () => {
        this.props.onValue({
            Nimi: this.props.name,
            Avain: rowId
        });
        this.setState({ open: false });
    }

    closeDialog = (list) => {
        var name = 'open' + list;
        this.setState({ [name]: false })
    };

    render() {
        const { dictionary } = this.context;

        var options = {
            selectableRowsHeader: true,
            selectableRowsOnClick: true,
            selectableRows: "single",
            filterType: 'dropdown',
            responsive: "vertical",
            rowsPerPage: 5,
            download: false,
            print: false,
            onRowSelectionChange: (currentRowsSelected, allRows, rowsSelected) => {
                const { data } = this.state;
                rowId = null;
                if (rowsSelected.length > 0) {
                    rowId = data[rowsSelected[0]].id; //TODO: Muuta avain
                }
            },
            customToolbarSelect: (selRows, displayData, setSelectedRows) => { },
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

        var handleClickOpen = () => {
            // feature groups
            authFetch(this.props.pca, API_PREFIX + '/Read/' + (this.props.projectId || ''))
                .then(response => response.json())
                .then(data => {
                    console.log(data); //TODO

                    this.setState({
                        open: true,
                        data: data
                    });
                });
        }

        var handleClose = () => {
            this.setState({ open: false });
        }

        return (
            <React.Fragment>
                <Tooltip title={dictionary.FeatureGroup.Tooltip1}>
                    <IconButton onClick={handleClickOpen}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>

                <Dialog open={this.state.open} onClose={handleClose} maxWidth={false} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">{dictionary.FeatureGroup.Title2}</DialogTitle>
                    <DialogContent>
                        <div style={{ padding: "10px" }}>
                            {(this.state.loading) ? (
                                <CircularProgress />
                            ) : (
                                <MUIDataTable
                                    title={dictionary.FeatureGroup.Title}
                                    data={this.state.data}
                                    columns={this.state.columns}
                                    options={options}
                                />
                            )
                            }
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button type="submit" color="primary" onClick={this.handleSave}>
                            {dictionary.Ok}
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "FeatureGroupSelect" })(FeatureGroupSelect);
