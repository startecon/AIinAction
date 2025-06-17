import React from "react";
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import IconButton from "@mui/material/IconButton";
import Autocomplete from '@mui/lab/Autocomplete';
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

const defaultToolbarStyles = {
    iconButton: {
    },
};

var iniRiviTila;
var iniTehtava;
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

class AjoEdit extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        this.modelRef = React.createRef();

        var data = props.Daatta.filter(function (d) {
            return d.riviAvain == props.rowId;
        });

        this.state = {
            open: false,
            RiviAvain: data[0].riviAvain,
            TehtavaAvain: data[0].tehtavaAvain,
            Prioriteetti: data[0].prioriteetti,
            AjoNimi: data[0].ajoNimi,
            Aloitus: data[0].aloitus,
            Lopetus: data[0].lopetus,
            Ajastettu: data[0].ajastettu,
            RiviTilaAvain: data[0].riviTilaAvain,
            Selite: data[0].selite,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active,

            tehtavat: (Object.keys(props.lookupLists.tehtavat).map(function (d) { return { value: d, label: props.lookupLists.tehtavat[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            rivitilat: (Object.keys(props.lookupLists.rivitilat).map(function (d) { return { value: d, label: props.lookupLists.rivitilat[d] }; }) || []),

            filteredtehtavat: (Object.keys(props.lookupLists.tehtavat).map(function (d) { return { value: d, label: props.lookupLists.tehtavat[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            filteredrivitilat: (Object.keys(props.lookupLists.rivitilat).map(function (d) { return { value: d, label: props.lookupLists.rivitilat[d] }; }) || [])
        };

    }

    componentWillMount() {
        iniRiviTila = this.state.rivitilat.find(({ value }) => value === (this.state.RiviTilaAvain || '').toString());
        iniTehtava = this.state.tehtavat.find(({ value }) => value === (this.state.TehtavaAvain || '').toString());
    }

    static propTypes = {
        onEditRow: PropTypes.func,
        onLookupListChange: PropTypes.func,
        classes: PropTypes.object,
        blurOnSelect: PropTypes.bool
    };

    handleSave = () => {
        this.props.onEditRow({
            RiviAvain: this.state.RiviAvain,
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
    }

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
                <Tooltip title={dictionary.Toolbar.Edit}>
                    <IconButton className={classes.iconButton} onClick={handleClickOpen}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>

                <Dialog open={this.state.open} onClose={handleClose} maxWidth={false} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">{dictionary.Ajo.Title}</DialogTitle>
                    <form onSubmit={this.handleSave}>
                        <DialogContent style={{ width: "500px" }}>
                            <input type="hidden" value={this.state.RiviAvain} />

                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    options={tehtavat}
                                    defaultValue={iniTehtava}
                                    disableCloseOnSelect
                                    filterSelectedOptions
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: '100%' }}
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'TehtavaAvain') }}
                                    onInputChange={() => { handleListStateChange('tehtavat') }}
                                    renderInput={(params) => (
                                        <TextField {...params} required={true} variant="standard" label={dictionary.Ajo.Columns[1]} placeholder={dictionary.TextBoxLabel} />
                                    )}
                                />
                            </div>

                            <TextField margin="dense" id="Prioriteetti" label={dictionary.Ajo.Columns[2]} type="text" multiline fullWidth value={this.state.Prioriteetti} onChange={handleChange('Prioriteetti')} />
                            <TextField margin="dense" id="AjoNimi" label={dictionary.Ajo.Columns[3]} type="text" multiline fullWidth value={this.state.AjoNimi} onChange={handleChange('AjoNimi')} />
                            <TextField margin="dense" id="Aloitus" label={dictionary.Ajo.Columns[4]} type="text" multiline fullWidth value={this.state.Aloitus} onChange={handleChange('Aloitus')} />
                            <TextField margin="dense" id="Lopetus" label={dictionary.Ajo.Columns[5]} type="text" multiline fullWidth value={this.state.Lopetus} onChange={handleChange('Lopetus')} />
                            <TextField margin="dense" id="Ajastettu" label={dictionary.Ajo.Columns[6]} type="text" multiline fullWidth value={this.state.Ajastettu} onChange={handleChange('Ajastettu')} />

                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    options={rivitilat}
                                    defaultValue={iniRiviTila}
                                    disableCloseOnSelect
                                    filterSelectedOptions
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: '100%' }}
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'RiviTilaAvain') }}
                                    onInputChange={() => { handleListStateChange('rivitilat') }}
                                    renderInput={(params) => (
                                        <TextField {...params} required={true} variant="standard" label={dictionary.Ajo.Columns[7]} placeholder={dictionary.TextBoxLabel} />
                                    )}
                                />
                                <Tooltip title={dictionary.New}>
                                    <IconButton className={classes.iconButton} onClick={() => { handleNewItemOpen('openkoodit', 'KoodiAvain', 1) }}>
                                        <AddIcon className={classes.deleteIcon} />
                                    </IconButton>
                                </Tooltip>
                            </div>

                            <TextField margin="dense" id="Selite" label={dictionary.Ajo.Columns[8]} type="text" multiline fullWidth value={this.state.Selite} onChange={handleChange('Selite')} />
                            <TextField margin="dense" id="Active" label={dictionary.Ajo.Columns[12]} type="text" fullWidth value={this.state.Active} onChange={handleChange('Active')} />

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

export default withStyles(defaultToolbarStyles, { name: "AjoEdit" })(AjoEdit);
