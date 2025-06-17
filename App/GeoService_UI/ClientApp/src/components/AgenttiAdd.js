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

class AgenttiAdd extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        this.modelRef = React.createRef();

        this.state = {
            open: false,
            RiviAvain: null,
            ProjektiAvain: null,
            TyyppiAvain: null,
            AgenttiNimi: null,
            OSAvain: null,
            CPU: null,
            CPUAvain: null,
            Muisti: null,
            Levykoko: null,
            GPU: null,
            GPUAvain: null,
            Kuvaus: null,
            RekisterointiAvain: null,
            Syke: null,
            Created: null,
            Updated: null,
            Username: null,
            Active: null,

            projektit: (Object.keys(props.lookupLists.projektit).map(function (d) { return { value: d, label: props.lookupLists.projektit[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            tyypit: (Object.keys(props.lookupLists.tyypit).map(function (d) { return { value: d, label: props.lookupLists.tyypit[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            kayttikset: (Object.keys(props.lookupLists.kayttikset).map(function (d) { return { value: d, label: props.lookupLists.kayttikset[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            cput: (Object.keys(props.lookupLists.cput).map(function (d) { return { value: d, label: props.lookupLists.cput[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            gput: (Object.keys(props.lookupLists.gput).map(function (d) { return { value: d, label: props.lookupLists.gput[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),

            filteredprojektit: (Object.keys(props.lookupLists.projektit).map(function (d) { return { value: d, label: props.lookupLists.projektit[d] }; }) || []),
            filteredtyypit: (Object.keys(props.lookupLists.tyypit).map(function (d) { return { value: d, label: props.lookupLists.tyypit[d] }; }) || []),
            filteredkayttikset: (Object.keys(props.lookupLists.kayttikset).map(function (d) { return { value: d, label: props.lookupLists.kayttikset[d] }; }) || []),
            filteredcput: (Object.keys(props.lookupLists.cput).map(function (d) { return { value: d, label: props.lookupLists.cput[d] }; }) || []),
            filteredgput: (Object.keys(props.lookupLists.gput).map(function (d) { return { value: d, label: props.lookupLists.gput[d] }; }) || [])
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
            ProjektiAvain: this.state.ProjektiAvain,
            TyyppiAvain: this.state.TyyppiAvain,
            AgenttiNimi: this.state.AgenttiNimi,
            OSAvain: this.state.OSAvain,
            CPU: this.state.CPU,
            CPUAvain: this.state.CPUAvain,
            Muisti: this.state.Muisti,
            Levykoko: this.state.Levykoko,
            GPU: this.state.GPU,
            GPUAvain: this.state.GPUAvain,
            Kuvaus: this.state.Kuvaus,
            RekisterointiAvain: this.state.RekisterointiAvain,
            Syke: this.state.Syke,
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
        const { projektit, tyypit, kayttikset, cput, gput } = this.state;

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
                filteredprojektit: this.state.projektit,
                filteredtyypit: this.state.tyypit,
                filteredkayttikset: this.state.kayttikset,
                filteredcput: this.state.cput,
                filteredgput: this.state.gput
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
                <Tooltip title={dictionary.NewRow}>
                    <IconButton className={classes.iconButton} onClick={handleClickOpen}>
                        <AddIcon className={classes.deleteIcon} />
                    </IconButton>
                </Tooltip>

                <Dialog open={this.state.open} onClose={handleClose} maxWidth={false} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">{dictionary.Agentti.Title}</DialogTitle>
                    <form onSubmit={this.handleSave}>
                        <DialogContent style={{ width: "500px" }}>
                            <input type="hidden" value={this.state.RiviAvain} />

                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'ProjektiAvain') }}
                                    onInputChange={() => { handleListStateChange('projektit') }}
                                    id="controllable-states-demo"
                                    options={projektit}
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: 400 }}
                                    renderInput={(params) => <TextField  {...params} required={true} variant="standard" label={dictionary.Agentti.Columns[1]} />}
                                />
                            </div>


                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'TyyppiAvain') }}
                                    onInputChange={() => { handleListStateChange('tyypit') }}
                                    id="controllable-states-demo"
                                    options={tyypit}
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: 400 }}
                                    renderInput={(params) => <TextField  {...params} required={true} variant="standard" label={dictionary.Agentti.Columns[2]} />}
                                />
                                <Tooltip title={dictionary.New}>
                                    <IconButton className={classes.iconButton} onClick={() => { handleNewItemOpen('openkoodit', 'KoodiAvain', 4) }}>
                                        <AddIcon className={classes.deleteIcon} />
                                    </IconButton>
                                </Tooltip>
                            </div>

                            <TextField margin="dense" id="AgenttiNimi" label={dictionary.Agentti.Columns[3]} type="text" fullWidth value={this.state.AgenttiNimi} onChange={handleChange('AgenttiNimi')} />

                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'OSAvain') }}
                                    onInputChange={() => { handleListStateChange('kayttikset') }}
                                    id="controllable-states-demo"
                                    options={kayttikset}
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: 400 }}
                                    renderInput={(params) => <TextField  {...params} required={true} variant="standard" label={dictionary.Agentti.Columns[4]} />}
                                />
                                <Tooltip title={dictionary.New}>
                                    <IconButton className={classes.iconButton} onClick={() => { handleNewItemOpen('openkoodit', 'KoodiAvain', 5) }}>
                                        <AddIcon className={classes.deleteIcon} />
                                    </IconButton>
                                </Tooltip>
                            </div>

                            <TextField required={true} margin="dense" id="CPU" label={dictionary.Agentti.Columns[5]} type="number" fullWidth value={this.state.CPU} onChange={handleChange('CPU')} />

                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'CPUAvain') }}
                                    onInputChange={() => { handleListStateChange('cput') }}
                                    id="controllable-states-demo"
                                    options={cput}
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: 400 }}
                                    renderInput={(params) => <TextField  {...params} required={true} variant="standard" label={dictionary.Agentti.Columns[6]} />}
                                />
                                <Tooltip title={dictionary.New}>
                                    <IconButton className={classes.iconButton} onClick={() => { handleNewItemOpen('openkoodit', 'KoodiAvain', 2) }}>
                                        <AddIcon className={classes.deleteIcon} />
                                    </IconButton>
                                </Tooltip>
                            </div>

                            <TextField required={true} margin="dense" id="Muisti" label={dictionary.Agentti.Columns[7]} type="number" fullWidth value={this.state.Muisti} onChange={handleChange('Muisti')} />
                            <TextField required={true} margin="dense" id="Levykoko" label={dictionary.Agentti.Columns[8]} type="number" fullWidth value={this.state.Levykoko} onChange={handleChange('Levykoko')} />
                            <TextField required={true} margin="dense" id="GPU" label={dictionary.Agentti.Columns[9]} type="number" fullWidth value={this.state.GPU} onChange={handleChange('GPU')} />

                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'GPUAvain') }}
                                    onInputChange={() => { handleListStateChange('gput') }}
                                    id="controllable-states-demo"
                                    options={gput}
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: 400 }}
                                    renderInput={(params) => <TextField  {...params} required={true} variant="standard" label={dictionary.Agentti.Columns[10]} />}
                                />
                                <Tooltip title={dictionary.New}>
                                    <IconButton className={classes.iconButton} onClick={() => { handleNewItemOpen('openkoodit', 'KoodiAvain', 3) }}>
                                        <AddIcon className={classes.deleteIcon} />
                                    </IconButton>
                                </Tooltip>
                            </div>

                            <TextField margin="dense" id="Kuvaus" label={dictionary.Agentti.Columns[11]} type="text" multiline fullWidth value={this.state.Kuvaus} onChange={handleChange('Kuvaus')} />

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleSave} color="primary">
                                {dictionary.Ok}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
                <AddItem onAddNewItem={this.addNewItem} open={this.state.openkoodit} closeDialog={this.closeDialog} list={'koodit'} title={dictionary.Koodi.Title} />
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "AgenttiAdd" })(AgenttiAdd);
