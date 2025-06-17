import React from "react";
import PropTypes from 'prop-types';
import IconButton from "@mui/material/IconButton";
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

class AdminTilaEdit extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.tilaAvain == props.rowId;
        });

        this.state = {
            open: false,
            TilaAvain: data[0].tilaAvain,
            Tilanimi: data[0].tilanimi,
            Active: data[0].active
        };

    }

    static propTypes = {
        onEditRow: PropTypes.func,
        classes: PropTypes.object,
        blurOnSelect: PropTypes.bool
    };

    //Note: Using this lifecycle method often leads to bugs and inconsistencies
    UNSAFE_componentWillReceiveProps(nextProps) {
        var ID = nextProps.rowId;
        if (this.props.rowId !== nextProps.rowId) {
            var data = this.props.Daatta.filter(function (d) {
                return d.tilaId == ID;
            });

            this.setState({
                TilaAvain: data[0].tilaAvain,
                Tilanimi: data[0].tilanimi,
                Active: data[0].active
            });
        }
    }

    handleSave = (e) => {
        e.preventDefault();
        this.props.onEditRow({
            TilaAvain: this.state.TilaAvain,
            Tilanimi: this.state.Tilanimi,
            Active: this.state.Active
        });
        this.setState({ open: false });
    }

    render() {
        const { dictionary } = this.context;
        const { classes } = this.props;

        const handleChange = name => event => {
            this.setState({ [name]: event.target.value });
        };

        var handleClickOpen = () => {
            this.setState({ open: true });
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
                    <DialogTitle id="form-dialog-title">{dictionary.AdminTila.Title}</DialogTitle>
                    <form onSubmit={this.handleSave}>
                        <DialogContent style={{ width: "500px" }}>
                            <input type="hidden" value={this.state.TilaAvain} />
                            <TextField
                                margin="dense"
                                id="Tilanimi"
                                label={dictionary.AdminTila.Columns[1]}
                                type="text"
                                defaultValue={this.state.Tilanimi}
                                onChange={handleChange('Tilanimi')}
                                fullWidth
                            />
                            <TextField margin="dense" id="Active" label={dictionary.AdminTila.Columns[3]} type="text" fullWidth value={this.state.Active} onChange={handleChange('Active')} defaultValue={this.state.Active} />
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

export default withStyles(defaultToolbarStyles, { name: "AdminTilaEdit" })(AdminTilaEdit);
