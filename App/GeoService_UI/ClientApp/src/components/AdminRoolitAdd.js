import React from "react";
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import Autocomplete from '@mui/lab/Autocomplete';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import AddItem from "./AddItem";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { withStyles } from "@mui/styles";

import { LanguageContext } from './LanguageContext';

const defaultToolbarStyles = {
    iconButton: {
    },
};

class AdminRoolitAdd extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            RoolitId: null,
            Rooli_Id: null,
            Profiili_Id: null,
            Created: null,
            Updated: null,
            Username: null,
            Active: null,
            roolit: (Object.keys(props.lookupLists.roolit).map(function (d) { return { value: d, label: props.lookupLists.roolit[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            filteredroolit: (Object.keys(props.lookupLists.roolit).map(function (d) { return { value: d, label: props.lookupLists.roolit[d] }; }) || []),
            kayttajat: (Object.keys(props.lookupLists.kayttajat).map(function (d) { return { value: d, label: props.lookupLists.kayttajat[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            filteredkayttajat: (Object.keys(props.lookupLists.kayttajat).map(function (d) { return { value: d, label: props.lookupLists.kayttajat[d] }; }) || [])
        };
    }

    static propTypes = {
        onAddNewRow: PropTypes.func,
        onLookupListChange: PropTypes.func,
        classes: PropTypes.object,
        blurOnSelect: PropTypes.bool
    };

    handleSave = () => {
        this.props.onAddNewRow({
            RoolitId: 1, 
            Rooli_Id: this.state.Rooli_Id,
            Profiili_Id: this.state.Profiili_Id,
            Created: this.state.Created,
            Updated: this.state.Updated,
            Username: this.state.Username,
            Active: this.state.Active
        });
        this.setState({ open: false });
    }

    addNewItem = (list, item) => {
        this.props.onLookupListChange(list, item);
    };

    closeDialog = (list) => {
        var name = 'open' + list;
        this.setState({ [name]: false })
    };

    render() {
        const { dictionary } = this.context;
        const { classes, lookupLists } = this.props;
        const { roolit, kayttajat } = this.state;

        const handleChange = name => event => {
            this.setState({ [name]: event.target.value });
        };

        var handleClickOpen = () => {
            this.setState({
                open: true,
                filteredroolit: this.state.roolit,
                filteredkayttajat: this.state.kayttajat
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
                <Tooltip title={dictionary.Toolbar.NewRow}>
                    <IconButton className={classes.iconButton} onClick={handleClickOpen}>
                        <AddIcon className={classes.deleteIcon} />
                    </IconButton>
                </Tooltip>

                <Dialog open={this.state.open} onClose={handleClose} maxWidth={false} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">{dictionary.AdminRoolit.Title}</DialogTitle>
                    <form onSubmit={this.handleSave}>
                        <DialogContent style={{ width: "500px" }}>
                            <input type="hidden" value={this.state.RoolitId} />

                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'Profiili_Id') }}
                                    onInputChange={() => { handleListStateChange('kayttajat') }}
                                    id="controllable-states-demo"
                                    options={kayttajat}
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: 400 }}
                                    renderInput={(params) => <TextField  {...params} required={true} variant="standard" label={dictionary.AdminRoolit.Columns[2]} />}
                                />
                                <Tooltip title={dictionary.New}>
                                    <IconButton className={classes.iconButton} onClick={() => { handleNewItemOpen('openkayttajat', 'Profiili_Id') }}>
                                        <AddIcon className={classes.deleteIcon} />
                                    </IconButton>
                                </Tooltip>
                            </div>

                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'Rooli_Id') }}
                                    onInputChange={() => { handleListStateChange('roolit') }}
                                    id="controllable-states-demo"
                                    options={roolit}
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: 400 }}
                                    renderInput={(params) => <TextField  {...params} required={true} variant="standard" label={dictionary.AdminRoolit.Columns[1]} />}
                                />
                                <Tooltip title={dictionary.New}>
                                    <IconButton className={classes.iconButton} onClick={() => { handleNewItemOpen('openroolit', 'Rooli_Id') }}>
                                        <AddIcon className={classes.deleteIcon} />
                                    </IconButton>
                                </Tooltip>
                            </div>
                            
                        </DialogContent>
                        <DialogActions>
                            <Button type="submit" color="primary">
                                {dictionary.Ok}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
                <AddItem onAddNewItem={this.addNewItem} open={this.state.openroolit} closeDialog={this.closeDialog} list={'roolit'} title={dictionary.AdminRoolit.Columns[1]} />
                <AddItem onAddNewItem={this.addNewItem} open={this.state.openkayttajat} closeDialog={this.closeDialog} list={'kayttajat'} title={dictionary.AdminRoolit.Columns[2]} />
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "AdminRoolitAdd" })(AdminRoolitAdd);
