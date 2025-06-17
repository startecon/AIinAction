import React from "react";
import PropTypes from 'prop-types';
import IconButton from "@mui/material/IconButton";
import Autocomplete from '@mui/lab/Autocomplete';
import AddIcon from "@mui/icons-material/Add";
import AddItem from "./AddItem";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from '@mui/icons-material/Edit';
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

import { authFetch, authPost } from "./../authProvider";
import { LanguageContext } from './LanguageContext';

/* Näkymäkohtaiset muuttujat ja vakiot */
const API_PREFIX = 'api/Tehtava';

const defaultToolbarStyles = {
    iconButton: {
    },
};

var that;
var koodiryhma;
var itemChanged = false;

class TehtavaEdit extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        this.modelRef = React.createRef();

        this.state = {
            open: false,
            openprojektit: false,

            //Tehtävä
            RiviAvain: null,
            ProjektiAvain: null,
            TehtavaNimi: null,
            Malli: null,
            TilaAvain: null,
            RiviTilaAvain: null,
            Selite: null,
            Created: null,
            Updated: null,
            Username: null,
            Active: null,

            projektit: [],
            filteredprojektit: [],
            iniProjekti: {}
        };

        that = this;
    }

    static propTypes = {
        onEditRow: PropTypes.func,
        onClose: PropTypes.func,
        lookupLists: PropTypes.object,
        onLookupListChange: PropTypes.func,
        classes: PropTypes.object,
        rowId: PropTypes.number,
        blurOnSelect: PropTypes.bool
    };

    handleSave = () => {
        this.props.onEditRow({
            RiviAvain: this.state.RiviAvain,
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
    }

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
        const { lookupLists, rowId } = this.props;
        const { projektit } = this.state;
        

        const handleChange = name => event => {
            this.setState({ [name]: event.target.value });
        };

        const handleSelectionChange = name => selection => {
            if (selection)
                this.setState({ [name]: selection.value });
        };

        var handleClickOpen = () => {
            const projektit = (Object.keys(lookupLists.projektit).map(function (d) { return { value: d, label: lookupLists.projektit[d] }; }) || []);

            //Items
            authFetch(this.props.pca, API_PREFIX + '/Read/' + rowId)
                .then(response => response.json())
                .then(data => {
                    this.setState({
                        open: true,
                        RiviAvain: data[0].riviAvain,
                        ProjektiAvain: data[0].projektiAvain,
                        TehtavaNimi: data[0].tehtavaNimi,
                        Malli: data[0].malli,
                        TilaAvain: data[0].tilaAvain,
                        RiviTilaAvain: data[0].riviTilaAvain,
                        Selite: data[0].selite,
                        Created: data[0].created,
                        Updated: data[0].updated,
                        Username: data[0].username,
                        Active: data[0].active,

                        projektit: projektit,
                        filteredprojektit: projektit,
                        iniProjekti: projektit.find(({ value }) => value === (data[0].projektiAvain || '').toString())
                    });
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
                <Tooltip title={dictionary.Toolbar.Edit}>
                    <IconButton onClick={handleClickOpen}>
                        <EditIcon />
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
                                            options={projektit}
                                            defaultValue={this.state.iniProjekti}
                                            disableCloseOnSelect
                                            filterSelectedOptions
                                            getOptionLabel={(option) => option.label}
                                            style={{ width: '100%' }}
                                            onChange={(event, newValue) => { handleListChange(event, newValue, 'ProjektiAvain') }}
                                            onInputChange={() => { handleListStateChange('projektit') }}
                                            renderInput={(params) => (
                                                <TextField {...params} required={true} variant="standard" label={dictionary.Projekti.Columns[1]} placeholder={dictionary.TextBoxLabel} />
                                            )}
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

export default withStyles(defaultToolbarStyles, { name: "TehtavaEdit" })(TehtavaEdit);