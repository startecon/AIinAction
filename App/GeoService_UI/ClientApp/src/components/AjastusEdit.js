import React from "react";
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import IconButton from "@mui/material/IconButton";
import Autocomplete from '@mui/lab/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
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

var iniTehtava;

/*
public int RiviAvain { get; set; }
public int TehtavaAvain { get; set; }
public DateTime? Aloitus { get; set; }
public DateTime? Lopetus { get; set; }
public DateTime? Seuraava { get; set; }
public DateTime? Edellinen { get; set; }
public bool? Toistuva { get; set; }
public int? Aikavali { get; set; }
public DateTime? Created { get; set; }
public DateTime? Updated { get; set; }
public string Username { get; set; }
public bool? Active { get; set; }
*/

class AjastusEdit extends React.Component {
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
            Aloitus: data[0].aloitus,
            Lopetus: data[0].lopetus,
            Seuraava: data[0].seuraava,
            Edellinen: data[0].edellinen,
            Toistuva: data[0].toistuva,
            Aikavali: data[0].aikavali,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active,

            tehtavat: (Object.keys(props.lookupLists.tehtavat).map(function (d) { return { value: d, label: props.lookupLists.tehtavat[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            filteredtehtavat: (Object.keys(props.lookupLists.tehtavat).map(function (d) { return { value: d, label: props.lookupLists.tehtavat[d] }; }) || [])
        };

    }

    componentWillMount() {
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
            Aloitus: this.state.Aloitus,
            Lopetus: this.state.Lopetus,
            Seuraava: this.state.Seuraava,
            Edellinen: this.state.Edellinen,
            Toistuva: this.state.Toistuva,
            Aikavali: this.state.Aikavali,
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
        const { tehtavat } = this.state;

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
                    <DialogTitle id="form-dialog-title">{dictionary.Ajastus.Title}</DialogTitle>
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
                                        <TextField {...params} required={true} variant="standard" label={dictionary.Ajastus.Columns[1]} placeholder={dictionary.TextBoxLabel} />
                                    )}
                                />
                            </div>



                            <TextField
                                id="aloitus-datetime"
                                label={dictionary.Ajastus.Columns[2]}
                                type="datetime-local"
                                className={classes.textField}
                                value={this.state.Aloitus}
                                onChange={handleChange('Aloitus')}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <TextField
                                id="lopetus-datetime"
                                label={dictionary.Ajastus.Columns[3]}
                                type="datetime-local"
                                className={classes.textField}
                                value={this.state.Lopetus}
                                onChange={handleChange('Lopetus')}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <TextField
                                id="lopetus-datetime"
                                label={dictionary.Ajastus.Columns[4]}
                                type="datetime-local"
                                className={classes.textField}
                                value={this.state.Seuraava}
                                onChange={handleChange('Seuraava')}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <div>
                                <InputLabel id="toistuva-select-label">{dictionary.Ajastus.Columns[5]}</InputLabel>
                                <Select
                                    labelId="toistuva-select-label"
                                    id="toistuva-select"
                                    value={this.state.Toistuva}
                                    onChange={handleChange('Toistuva')}
                                >
                                    <MenuItem value={0}>{dictionary.Ajastus.Items1[0]}</MenuItem>
                                    <MenuItem value={1}>{dictionary.Ajastus.Items1[1]}</MenuItem>
                                </Select>
                            </div>
                            <div>
                                <InputLabel id="aikavali-select-label">{dictionary.Ajastus.Columns[6]}</InputLabel>
                                <Select
                                    labelId="aikavali-select-label"
                                    id="aikavali-select"
                                    value={this.state.Aikavali}
                                    onChange={handleChange('Aikavali')}
                                >
                                    <MenuItem value=""></MenuItem>
                                    <MenuItem value={10}>{dictionary.Ajastus.Items2[0]}</MenuItem>
                                    <MenuItem value={30}>{dictionary.Ajastus.Items2[1]}</MenuItem>
                                    <MenuItem value={60}>{dictionary.Ajastus.Items2[2]}</MenuItem>
                                    <MenuItem value={120}>{dictionary.Ajastus.Items2[3]}</MenuItem>
                                    <MenuItem value={360}>{dictionary.Ajastus.Items2[4]}</MenuItem>
                                    <MenuItem value={720}>{dictionary.Ajastus.Items2[5]}</MenuItem>
                                    <MenuItem value={1440}>{dictionary.Ajastus.Items2[6]}</MenuItem>
                                </Select>
                            </div>
                            <TextField margin="dense" id="Active" label="Active" type="text" fullWidth value={this.state.Active} onChange={handleChange('Active')} />

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

export default withStyles(defaultToolbarStyles, { name: "AjastusEdit" })(AjastusEdit);
