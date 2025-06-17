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

/*
public int KoodiAvain { get; set; }
public int KoodiryhmaAvain { get; set; }
public string KoodiNimi { get; set; }
public string KoodiKuvaus { get; set; }
public DateTime? Created { get; set; }
public DateTime? Updated { get; set; }
public string Username { get; set; }
public bool? Active { get; set; }
*/

class KoodiAdd extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            KoodiAvain: null,
            KoodiryhmaAvain: null,
            KoodiNimi: null,
            KoodiKuvaus: null,
            Created: null,
            Updated: null,
            Username: null,
            Active: null,
            koodiryhmat: (Object.keys(props.lookupLists.koodiryhmat).map(function (d) { return { value: d, label: props.lookupLists.koodiryhmat[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            filteredkoodiryhmat: (Object.keys(props.lookupLists.koodiryhmat).map(function (d) { return { value: d, label: props.lookupLists.koodiryhmat[d] }; }) || [])
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
            KoodiAvain: 1,
            KoodiryhmaAvain: this.state.KoodiryhmaAvain,
            KoodiNimi: this.state.KoodiNimi,
            KoodiKuvaus: this.state.KoodiKuvaus,
            Created: this.state.Created,
            Updated: this.state.Updated,
            Username: this.state.Username,
            Active: this.state.Active
        });
        this.setState({ open: false });
    };

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
        const { koodiryhmat } = this.state;

        const handleChange = name => event => {
            this.setState({ [name]: event.target.value });
        };

        var handleClickOpen = () => {
            this.setState({
                open: true,
                filteredkoodiryhmat: this.state.koodiryhmat
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
                    <DialogTitle id="form-dialog-title">{dictionary.Koodi.Title}</DialogTitle>
                    <form onSubmit={this.handleSave}>
                        <DialogContent style={{ width: "500px" }}>
                            <input type="hidden" value={this.state.KoodiAvain} />

                             <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'KoodiryhmaAvain') }}
                                    onInputChange={() => { handleListStateChange('koodiryhmat') }}
                                    id="controllable-states-demo"
                                    options={koodiryhmat}
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: 400 }}
                                    renderInput={(params) => <TextField  {...params} required={true} variant="standard" label={dictionary.Koodi.Columns[1]} />}
                                />

                                <Tooltip title={dictionary.New}>
                                    <IconButton className={classes.iconButton} onClick={() => { handleNewItemOpen('openkoodiryhmat', 'KoodiryhmaAvain') }}>
                                        <AddIcon className={classes.deleteIcon} />
                                    </IconButton>
                                </Tooltip>
                            </div>
                            <TextField
                                margin="dense"
                                id="KoodiNimi"
                                label={dictionary.Koodi.Columns[2]}
                                type="text"
                                fullWidth
                                value={this.state.KoodiNimi}
                                onChange={handleChange('KoodiNimi')}
                            />
                            <TextField
                                margin="dense"
                                id="KoodiKuvaus"
                                label={dictionary.Koodi.Columns[3]}
                                type="text"
                                fullWidth
                                value={this.state.KoodiKuvaus}
                                onChange={handleChange('KoodiKuvaus')}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button type="submit" color="primary">
                                {dictionary.Ok}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
                <AddItem onAddNewItem={this.addNewItem} open={this.state.openkoodiryhmat} closeDialog={this.closeDialog} list={'koodiryhmat'} title={dictionary.Koodi.Columns[1]} />
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "KoodiAdd" })(KoodiAdd);
