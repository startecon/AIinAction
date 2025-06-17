import React from "react";
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
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

class AdminProfiiliAdd extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            ProfiiliId: null,
            Username: null,
            UI_Settings: null
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
                <Tooltip title={dictionary.Toolbar.NewRow}>
                    <IconButton className={classes.iconButton} onClick={handleClickOpen}>
                        <AddIcon className={classes.deleteIcon} />
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

export default withStyles(defaultToolbarStyles, { name: "AdminProfiiliAdd" })(AdminProfiiliAdd);
