import React from "react";
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import AddItem from "./AddItem";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { withStyles } from "@mui/styles";

import { LanguageContext } from './LanguageContext';
import Autocomplete from '@mui/lab/Autocomplete';

const defaultToolbarStyles = {
    iconButton: {
    },
};

var iniPalvelupaketti;
var iniToiminnot;
var iniEntiteetti;

class AdminPalvelupakettiEdit extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.palvelupakettiSisaltoId == props.rowId;
        });

        this.state = {
            open: false,
            PalvelupakettiSisaltoId: data[0].palvelupakettiSisaltoId,
            Palvelupaketti_Id: data[0].palvelupaketti_Id,
            Toiminnot_Id: data[0].toiminnot_Id,
            Entiteetti_Id: data[0].entiteetti_Id,
            Maksimi: data[0].maksimi,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active,
            palvelupaketit: (Object.keys(props.lookupLists.palvelupaketit).map(function (d) { return { value: d, label: props.lookupLists.palvelupaketit[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            filteredpalvelupaketit: (Object.keys(props.lookupLists.palvelupaketit).map(function (d) { return { value: d, label: props.lookupLists.palvelupaketit[d] }; }) || []),
            toiminnot: (Object.keys(props.lookupLists.toiminnot).map(function (d) { return { value: d, label: props.lookupLists.toiminnot[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            filteredtoiminnot: (Object.keys(props.lookupLists.toiminnot).map(function (d) { return { value: d, label: props.lookupLists.toiminnot[d] }; }) || []),
            entiteetit: (Object.keys(props.lookupLists.entiteetit).map(function (d) { return { value: d, label: props.lookupLists.entiteetit[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            filteredentiteetit: (Object.keys(props.lookupLists.entiteetit).map(function (d) { return { value: d, label: props.lookupLists.entiteetit[d] }; }) || [])
        };

    }

    componentWillMount() {
        iniPalvelupaketti = this.state.palvelupaketit.find(({ value }) => value === (this.state.Palvelupaketti_Id || '').toString());
        iniToiminnot = this.state.toiminnot.find(({ value }) => value === (this.state.Toiminnot_Id || '').toString());
        iniEntiteetti = this.state.entiteetit.find(({ value }) => value === (this.state.Entiteetti_Id || '').toString());
    }

    static propTypes = {
        onEditRow: PropTypes.func,
        onLookupListChange: PropTypes.func,
        classes: PropTypes.object,
        blurOnSelect: PropTypes.bool
    };

    handleSave = (e) => {
        e.preventDefault();
        this.props.onEditRow({
            PalvelupakettiSisaltoId: this.state.PalvelupakettiSisaltoId,
            Palvelupaketti_Id: this.state.Palvelupaketti_Id,
            Toiminnot_Id: this.state.Toiminnot_Id,
            Entiteetti_Id: this.state.Entiteetti_Id,
            Maksimi: this.state.Maksimi,
            Created: this.state.Created,
            Updated: this.state.Updated,
            Username: this.state.Username,
            Active: this.state.Active
        });
        this.setState({ open: false });
    }

    closeDialog = (list) => {
        var name = 'open' + list;
        this.setState({ [name]: false })
    };

    render() {
        const { userLanguage, dictionary } = this.context;
        const { classes, lookupLists } = this.props;
        const { palvelupaketit, toiminnot, entiteetit } = this.state;

        const handleChange = name => event => {
            if (/^[0-9A-ZÅÖÄa-zåöä!@#$%&*()\s_\-+={[}\]|\:;"',.?\/\\~`]+[0-9A-ZÅÖÄa-zåöä!@#$%&*()\s_\-+={[}\]|\:;"'<,>.?\/\\~`]*$/g.test(event.target.value)) {
                this.setState({ [name]: event.target.value });
            }
            else {
                this.setState({ [name]: '' });
            }
        };

        var handleClickOpen = () => {
            this.setState({
                open: true,
                filteredpalvelupaketit: this.state.palvelupaketit,
                filteredtoiminnot: this.state.toiminnot,
                filteredentiteetit: this.state.entiteetit
            });
        }

        const handleListChange = (event, newValue, item) => {
            if (newValue != null) {
                this.setState({ [item]: newValue.value })
            }
            else {
                this.setState({ [item]: null })
            }
        }

        const handleListStateChange = list => {
            const data = (Object.keys(lookupLists[list]).map(function (d) { return { value: d, label: lookupLists[list][d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1)
            this.setState({ [list]: data })
        };


        var handleClose = () => {
            this.setState({ open: false });
        }

        const handleNewItemOpen = (name, id) => {
            this.setState({ [name]: true, [id]: null, });
        }

        return (
            <React.Fragment>
                <Tooltip title={dictionary.Toolbar.Edit}>
                    <IconButton className={classes.iconButton} onClick={handleClickOpen}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>

                <Dialog open={this.state.open} onClose={handleClose} maxWidth={false} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">{dictionary.Toolbar.Edit}</DialogTitle>
                    <form onSubmit={this.handleSave}>
                        <DialogContent style={{ width: "500px" }}>
                            <input type="hidden" value={this.state.PalvelupakettiSisaltoId} />
                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    options={palvelupaketit}
                                    defaultValue={iniPalvelupaketti}
                                    disableCloseOnSelect
                                    filterSelectedOptions
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: '100%' }}
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'Palvelupaketti_Id') }}
                                    onInputChange={() => { handleListStateChange('palvelupaketit') }}
                                    renderInput={(params) => (
                                        <TextField {...params} required={true} variant="standard" label={dictionary.Palvelupaketti.title} placeholder={dictionary.TextBoxLabel} />
                                    )}
                                />
                            </div>
                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    options={toiminnot}
                                    defaultValue={iniToiminnot}
                                    disableCloseOnSelect
                                    filterSelectedOptions
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: '100%' }}
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'Toiminnot_Id') }}
                                    onInputChange={() => { handleListStateChange('toiminnot') }}
                                    renderInput={(params) => (
                                        <TextField {...params} required={true} variant="standard" label={dictionary.Toiminnot.title} placeholder={dictionary.TextBoxLabel} />
                                    )}
                                />
                            </div>
                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    options={entiteetit}
                                    defaultValue={iniEntiteetti}
                                    disableCloseOnSelect
                                    filterSelectedOptions
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: '100%' }}
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'Entiteetti_Id') }}
                                    onInputChange={() => { handleListStateChange('entiteetit') }}
                                    renderInput={(params) => (
                                        <TextField {...params} required={true} variant="standard" label={dictionary.Palvelupaketti.Columns[3]} placeholder={dictionary.TextBoxLabel} />
                                    )}
                                />
                            </div>
                            <TextField
                                margin="dense"
                                id="Maksimi"
                                InputLabelProps={{
                                    style: { color: '#7030a0' },
                                }}
                                label={dictionary.Palvelupaketti.Columns[4]}
                                type="text"
                                fullWidth
                                value={this.state.Maksimi}
                                onChange={handleChange('Maksimi')}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button type="submit" color="primary">
                                {dictionary.Toolbar.Ok}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "AdminPalvelupakettiEdit" })(AdminPalvelupakettiEdit);
