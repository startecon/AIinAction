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

import { LanguageContext } from './LanguageContext';

const defaultToolbarStyles = {
    iconButton: {
    },
};

class AdminProfiiliEdit extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.profiiliId == props.rowId;
        });

        this.state = {
            open: false,
            ProfiiliId: data[0].profiiliId,
            Username: data[0].username,
            UI_Settings: data[0].uI_Settings
        };

    }

    static propTypes = {
        onEditRow: PropTypes.func,
        onLookupListChange: PropTypes.func,
        classes: PropTypes.object,
        Daatta: PropTypes.object,
        rowId: PropTypes.object,
        blurOnSelect: PropTypes.bool
    };

    handleSave = () => {
        this.props.onEditRow({
            ProfiiliId: this.state.ProfiiliId,
            Username: this.state.Username,
            UI_Settings: this.state.UI_Settings
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
        const { classes } = this.props;

        const handleChange = name => event => {
            this.setState({ [name]: event.target.value });
        };

        var handleClickOpen = () => {
            this.setState({
                open: true
            });
        }

        var handleClose = () => {
            this.setState({ open: false });
        }

        return (
            <React.Fragment>
                <Tooltip title={dictionary.Toolbar.Edit}>
                    <IconButton className={classes.iconButton} onClick={handleClickOpen}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>

                <Dialog open={this.state.open} onClose={handleClose} maxWidth={false} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">{dictionary.AdminProfiili.Title}</DialogTitle>
                    <form onSubmit={this.handleSave}>
                        <DialogContent style={{ width: "500px" }}>
                            <input type="hidden" value={this.state.ProfiiliId} />
                            <TextField
                                required={true}
                                margin="dense"
                                id="Username"
                                InputLabelProps={{
                                    style: { color: '#7030a0' },
                                }}
                                label={dictionary.AdminProfiili.Columns[2]}
                                type="text"
                                fullWidth
                                value={this.state.Username}
                                onChange={handleChange('Username')}
                            />
                            <TextField
                                required={true}
                                margin="dense"
                                id="UI_Settings"
                                InputLabelProps={{
                                    style: { color: '#7030a0' },
                                }}                                
                                label={dictionary.AdminProfiili.Columns[1]}
                                type="text"
                                fullWidth
                                value={this.state.UI_Settings}
                                onChange={handleChange('UI_Settings')}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button type="submit" color="primary">
                                {dictionary.Ok}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "AdminProfiiliEdit" })(AdminProfiiliEdit);
