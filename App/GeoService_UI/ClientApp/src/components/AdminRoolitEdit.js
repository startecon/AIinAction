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
import Autocomplete from '@mui/lab/Autocomplete';
import { LanguageContext } from './LanguageContext';

const defaultToolbarStyles = {
    iconButton: {
    },
};

var iniRooli;
var iniKayttaja;

class AdminRoolitEdit extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.roolitId === props.rowId;
        });

        this.state = {
            open: false,
            RoolitId: data[0].roolitId,
            Rooli_Id: data[0].rooli_Id,
            Profiili_Id: data[0].profiili_Id,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active,
            roolit: (Object.keys(props.lookupLists.roolit).map(function (d) { return { value: d, label: props.lookupLists.roolit[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            filteredroolit: (Object.keys(props.lookupLists.roolit).map(function (d) { return { value: d, label: props.lookupLists.roolit[d] }; }) || []),
            kayttajat: (Object.keys(props.lookupLists.kayttajat).map(function (d) { return { value: d, label: props.lookupLists.kayttajat[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            filteredkayttajat: (Object.keys(props.lookupLists.kayttajat).map(function (d) { return { value: d, label: props.lookupLists.kayttajat[d] }; }) || [])
        };

    }

    componentWillMount() {
        var r = this.state.Rooli_Id
        var k = this.state.Profiili_Id
        iniRooli = this.state.roolit.find(({ value }) => value === r.toString());
        iniKayttaja = this.state.kayttajat.find(({ value }) => value === k.toString());
    }

    static propTypes = {
        onEditRow: PropTypes.func,
        onLookupListChange: PropTypes.func,
        classes: PropTypes.object,
        blurOnSelect: PropTypes.bool
    };

    handleSave = () => {
        this.props.onEditRow({
            RoolitId: this.state.RoolitId,
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
                <Tooltip title={dictionary.Toolbar.Edit}>
                    <IconButton className={classes.iconButton} onClick={handleClickOpen}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>

                <Dialog open={this.state.open} onClose={handleClose} maxWidth={false} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">{dictionary.AdminRoolit.Title}</DialogTitle>
                    <form onSubmit={this.handleSave}>
                        <DialogContent style={{ width: "500px" }}>
                            <input type="hidden" value={this.state.RoolitId} />

                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    options={kayttajat}
                                    defaultValue={iniKayttaja}
                                    disableCloseOnSelect
                                    filterSelectedOptions
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: '100%' }}
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'Profiili_Id') }}
                                    onInputChange={() => { handleListStateChange('kayttajat') }}
                                    renderInput={(params) => (
                                        <TextField {...params} required={true} variant="standard" label={dictionary.AdminRoolit.Columns[2]} placeholder={dictionary.TextBoxLabel} />
                                    )}
                                />
                                <Tooltip title={dictionary.New}>
                                    <IconButton className={classes.iconButton} onClick={() => { handleNewItemOpen('openkayttajat', 'Profiili_Id') }}>
                                        <AddIcon className={classes.deleteIcon} />
                                    </IconButton>
                                </Tooltip>
                            </div>

                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    options={roolit}
                                    defaultValue={iniRooli}
                                    disableCloseOnSelect
                                    filterSelectedOptions
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: '100%' }}
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'Rooli_Id') }}
                                    onInputChange={() => { handleListStateChange('roolit') }}
                                    renderInput={(params) => (
                                        <TextField {...params} required={true} variant="standard" label={dictionary.AdminRoolit.Columns[1]} placeholder={dictionary.TextBoxLabel} />
                                    )}
                                />
                                <Tooltip title={dictionary.New}>
                                    <IconButton className={classes.iconButton} onClick={() => { handleNewItemOpen('openroolit', 'Rooli_Id') }}>
                                        <AddIcon className={classes.deleteIcon} />
                                    </IconButton>
                                </Tooltip>
                            </div>

                            <TextField
                                required={true}
                                margin="dense"
                                id="Active"
                                InputLabelProps={{
                                    style: { color: '#7030a0' },
                                }}
                                label={dictionary.AdminRoolit.Columns[6]}
                                type="text"
                                fullWidth
                                value={this.state.Active}
                                onChange={handleChange('Active')}
                            />
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

export default withStyles(defaultToolbarStyles, { name: "AdminRoolitEdit" })(AdminRoolitEdit);
