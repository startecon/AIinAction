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

var iniKoodiryhma;

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

class KoodiEdit extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.koodiAvain == props.rowId;
        });

        this.state = {
            open: false,
            KoodiAvain: data[0].koodiAvain,
            KoodiryhmaAvain: data[0].koodiryhmaAvain,
            KoodiNimi: data[0].koodiNimi,
            KoodiKuvaus: data[0].koodiKuvaus,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active,
            koodiryhmat: (Object.keys(props.lookupLists.koodiryhmat).map(function (d) { return { value: d, label: props.lookupLists.koodiryhmat[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            filteredkoodiryhmat: (Object.keys(props.lookupLists.koodiryhmat).map(function (d) { return { value: d, label: props.lookupLists.koodiryhmat[d] }; }) || [])
        };

    }

    componentWillMount() {
        var k = this.state.KoodiryhmaAvain
        iniKoodiryhma = this.state.koodiryhmat.find(({ value }) => value === k.toString());
    }

    static propTypes = {
        onEditRow: PropTypes.func,
        onLookupListChange: PropTypes.func,
        classes: PropTypes.object,
        blurOnSelect: PropTypes.bool
    };

    handleSave = () => {
        this.props.onEditRow({
            KoodiAvain: this.state.KoodiAvain,
            KoodiryhmaAvain: this.state.KoodiryhmaAvain,
            KoodiNimi: this.state.KoodiNimi,
            KoodiKuvaus: this.state.KoodiKuvaus,
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
                <Tooltip title={dictionary.Toolbar.Edit}>
                    <IconButton className={classes.iconButton} onClick={handleClickOpen}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>

                <Dialog open={this.state.open} onClose={handleClose} maxWidth={false} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">{dictionary.Koodi.Title}</DialogTitle>
                    <form onSubmit={this.handleSave}>
                        <DialogContent style={{ width: "500px" }}>
                            <input type="hidden" value={this.state.KoodiAvain} />
                            <div style={{ display: 'flex', paddingTop: "10px" }} >
                                <Autocomplete
                                    options={koodiryhmat}
                                    defaultValue={iniKoodiryhma}
                                    disableCloseOnSelect
                                    filterSelectedOptions
                                    getOptionLabel={(option) => option.label}
                                    style={{ width: '100%' }}
                                    onChange={(event, newValue) => { handleListChange(event, newValue, 'KoodiryhmaAvain') }}
                                    onInputChange={() => { handleListStateChange('koodiryhmat') }}
                                    renderInput={(params) => (
                                        <TextField {...params} required={true} variant="standard" label={dictionary.Koodi.Columns[1]} placeholder={dictionary.TextBoxLabel} />
                                    )}
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
                            <TextField
                                required={true}
                                margin="dense"
                                id="Active"
                                label={dictionary.Koodi.Columns[7]}
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
                <AddItem onAddNewItem={this.addNewItem} open={this.state.openkoodiryhmat} closeDialog={this.closeDialog} list={'koodiryhmat'} title={dictionary.Koodi.Columns[1]} />
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "KoodiEdit" })(KoodiEdit);
