import React from "react";
import PropTypes from 'prop-types';
import IconButton from "@mui/material/IconButton";
import Autocomplete from '@mui/lab/Autocomplete';
import AddIcon from "@mui/icons-material/Add";
import AddItem from "./AddItem";
import Tooltip from "@mui/material/Tooltip";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import SaveIcon from '@mui/icons-material/Save';
import Grid from '@mui/material/Grid';

import { withStyles } from "@mui/styles";

import { LanguageContext } from './LanguageContext';

const defaultToolbarStyles = {
    iconButton: {
    },
};

var koodiryhma;
var itemChanged = false;

class TehtavaAdd extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        this.modelRef = React.createRef();

        this.state = {
            open: false,
            openprojektit: false,
            RiviAvain: null,
            ProjektiAvain: null,
            TehtavaNimi: "Uusi tehtävä",
            Malli: null,
            TilaAvain: 1, //uusi
            RiviTilaAvain: 1, //uusi
            Selite: null,
            Created: null,
            Updated: null,
            Username: null,
            Active: null,

            projektit: (Object.keys(props.lookupLists.projektit).map(function (d) { return { value: d, label: props.lookupLists.projektit[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            filteredprojektit: (Object.keys(props.lookupLists.projektit).map(function (d) { return { value: d, label: props.lookupLists.projektit[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
        };
    }

    static propTypes = {
        onAddNewRow: PropTypes.func,
        onClose: PropTypes.func,
        onLookupListChange: PropTypes.func,
        lookupLists: PropTypes.array,
        classes: PropTypes.object,
        blurOnSelect: PropTypes.bool
    };

    handleSave = () => {
        this.props.onAddNewRow({
            RiviAvain: 1, //dummy-arvo
            ProjektiAvain: this.state.ProjektiAvain,
            TehtavaNimi: this.state.TehtavaNimi,
            Malli: JSON.stringify(this.modelRef.current.state),
            TilaAvain: this.state.TilaAvain,
            RiviTilaAvain: this.state.RiviTilaAvain,
            Selite: this.state.Selite,
            Created: this.state.Created,
            Updated: this.state.Updated,
            Username: this.state.Username,
            Active: this.state.Active
        });
        itemChanged = true;
    };

    handleClose = () => {
        this.props.onClose(itemChanged);
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

    transSlideUp = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="up" ref={ref} {...props} />;
    });

    render() {
        const { dictionary } = this.context;
        const { lookupLists } = this.props;
        const { projektit } = this.state;

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
                filteredprojektit: this.state.projektit
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

        const handleNewItemOpen = (name, id, _koodiryhma) => {
            koodiryhma = _koodiryhma;
            this.setState({ [name]: true, [id]: null, });
        }

        return (
            <React.Fragment>
                <Tooltip title={dictionary.Toolbar.NewRow}>
                    <IconButton onClick={handleClickOpen}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>

                <Dialog fullScreen open={this.state.open} TransitionComponent={this.transSlideUp}>
                    <AppBar position="relative" color="inherit" >
                        <Toolbar>
                            <Grid
                                container
                                direction="row"
                                justify="space-between"
                                alignItems="flex-end"
                            >
                                <Grid item xs={8}>
                                    <div style={{ display: 'flex' }}>
                                        <IconButton edge="start" color="inherit" onClick={this.handleClose} aria-label="close">
                                            <CloseIcon />
                                        </IconButton>
                                        <TextField style={{ width: '80%' }} inputProps={{ style: { fontSize: 28 } }} id="TehtavaNimi" type="text" value={this.state.TehtavaNimi} onChange={handleChange('TehtavaNimi')} />
                                    </div>
                                </Grid>
                                <Grid item xs>
                                    <div style={{ display: 'flex', paddingTop: "10px" }} >
                                        <Autocomplete
                                            onChange={(event, newValue) => { handleListChange(event, newValue, 'ProjektiAvain') }}
                                            onInputChange={() => { handleListStateChange('projektit') }}
                                            id="controllable-states-demo"
                                            options={projektit}
                                            getOptionLabel={(option) => option.label}
                                            style={{ width: 400 }}
                                            renderInput={(params) => <TextField  {...params} required={true} variant="standard" label={dictionary.Tehtava.Columns[1]} />}
                                        />

                                        <Tooltip title={dictionary.New}>
                                            <IconButton onClick={() => { handleNewItemOpen('openprojektit', 'ProjektiAvain') }}>
                                                <AddIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </Grid>
                                <Grid item xs={1}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<SaveIcon />}
                                        color="primary"
                                        onClick={this.handleSave}
                                    >
                                        {dictionary.Ok}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </AppBar>
                    <DialogContent>

                    </DialogContent>
                </Dialog>
                <AddItem onAddNewItem={this.addNewItem} open={this.state.openprojektit} closeDialog={this.closeDialog} list={'projektit'} title={'Projekti'} />
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "TehtavaAdd" })(TehtavaAdd);