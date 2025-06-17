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

var koodiryhma;

/*
public int RiviAvain { get; set; }
public int TehtavaAvain { get; set; }
public int Prioriteetti { get; set; }
public string AjoNimi { get; set; }
public DateTime? Aloitus { get; set; }
public DateTime? Lopetus { get; set; }
public bool? Ajastettu { get; set; }
public int RiviTilaAvain { get; set; }
public string Selite { get; set; }
public DateTime? Created { get; set; }
public DateTime? Updated { get; set; }
public string Username { get; set; }
public bool? Active { get; set; }
*/

class AjoAdd extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        this.modelRef = React.createRef();

        this.state = {
            open: false,
            RiviAvain: null,
            TehtavaAvain: null,
            Prioriteetti: null,
            AjoNimi: null,
            Aloitus: null,
            Lopetus: null,
            Ajastettu: null,
            RiviTilaAvain: null, 
            Selite: null,
            Created: null,
            Updated: null,
            Username: null,
            Active: null,

            tehtavat: (Object.keys(props.lookupLists.tehtavat).map(function (d) { return { value: d, label: props.lookupLists.tehtavat[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            rivitilat: (Object.keys(props.lookupLists.rivitilat).map(function (d) { return { value: d, label: props.lookupLists.rivitilat[d] }; }) || []),

            filteredtehtavat: (Object.keys(props.lookupLists.tehtavat).map(function (d) { return { value: d, label: props.lookupLists.tehtavat[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            filteredrivitilat: (Object.keys(props.lookupLists.rivitilat).map(function (d) { return { value: d, label: props.lookupLists.rivitilat[d] }; }) || [])
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
            RiviAvain: 1, //dummy-arvo
            TehtavaAvain: this.state.TehtavaAvain,
            Prioriteetti: this.state.Prioriteetti,
            AjoNimi: this.state.AjoNimi,
            Aloitus: this.state.Aloitus,
            Lopetus: this.state.Lopetus,
            Ajastettu: this.state.Ajastettu,
            RiviTilaAvain: this.state.RiviTilaAvain,
            Selite: this.state.Selite,
            Created: this.state.Created,
            Updated: this.state.Updated,
            Username: this.state.Username,
            Active: this.state.Active
        });
        this.setState({ open: false });
    };

    addNewItem = (list, item) => {
        if (list == 'koodit') {
            this.props.onLookupListChange(list, item + ";" + koodiryhma);
        } else {
            this.props.onLookupListChange(list, item);
        }
    };

    closeDialog = (list) => {
        var name = 'open' + list;
        this.setState({ [name]: false })
    };

    render() {
        const { dictionary } = this.context;
        const { classes, lookupLists } = this.props;
        const { rivitilat, tehtavat } = this.state;

        const handleChange = name => event => {
            this.setState({ [name]: event.target.value });
        };

        const handleSelectionChange = name => selection => {
            if (selection)
                this.setState({ [name]: selection.value });
        };

        var handleClickOpen = () => {
            this.setState({
                open: true,
                filteredrivitilat: this.state.rivitilat,
                filteredtehtavat: this.state.tehtavat
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

        const handleNewItemOpen = (name, id, _koodiryhma) => {
            koodiryhma = _koodiryhma;
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
                    <DialogTitle id="form-dialog-title">{dictionary.Ajo.Title}</DialogTitle>
                    <form onSubmit={this.handleSave}>
                        <DialogContent style={{ width: "500px" }}>
                            <input type="hidden" value={this.state.RiviAvain} />

                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'TehtavaAvain') }}
                                    onInputChange={() => { handleListStateChange('tehtavat') }}
                                    id="controllable-states-demo"
                                    options={tehtavat}
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: 400 }}
                                    renderInput={(params) => <TextField  {...params} required={true} variant="standard" label={dictionary.Ajo.Columns[1]} />}
                                />
                            </div>

                            <TextField margin="dense" id="Prioriteetti" label="Prioriteetti" type="text" multiline fullWidth value={this.state.Prioriteetti} onChange={handleChange('Prioriteetti')} />
                            <TextField margin="dense" id="AjoNimi" label="AjoNimi" type="text" multiline fullWidth value={this.state.AjoNimi} onChange={handleChange('AjoNimi')} />
                            <TextField margin="dense" id="Aloitus" label="Aloitus" type="text" multiline fullWidth value={this.state.Aloitus} onChange={handleChange('Aloitus')} />
                            <TextField margin="dense" id="Lopetus" label="Lopetus" type="text" multiline fullWidth value={this.state.Lopetus} onChange={handleChange('Lopetus')} />
                            <TextField margin="dense" id="Ajastettu" label="Ajastettu" type="text" multiline fullWidth value={this.state.Ajastettu} onChange={handleChange('Ajastettu')} />

                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'RiviTilaAvain') }}
                                    onInputChange={() => { handleListStateChange('rivitilat') }}
                                    id="controllable-states-demo"
                                    options={rivitilat}
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: 400 }}
                                    renderInput={(params) => <TextField  {...params} required={true} variant="standard" label={dictionary.Ajo.Columns[1]} />}
                                />
                                <Tooltip title={"Uusi koodi"}>
                                    <IconButton className={classes.iconButton} onClick={() => { handleNewItemOpen('openkoodit', 'KoodiAvain', 1) }}>
                                        <AddIcon className={classes.deleteIcon} />
                                    </IconButton>
                                </Tooltip>
                            </div>

                            <TextField margin="dense" id="Selite" label="Selite" type="text" multiline fullWidth value={this.state.Selite} onChange={handleChange('Selite')} />

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleSave} color="primary">
                                {dictionary.Ok}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
                <AddItem onAddNewItem={this.addNewItem} open={this.state.openkoodit} closeDialog={this.closeDialog} list={'koodit'} title={'Koodi'} />
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "AjoAdd" })(AjoAdd);
