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

/*
public int RiviAvain { get; set; }
public string AsiakasNimi { get; set; }
public string TenantId { get; set; }
public DateTime? Created { get; set; }
public DateTime? Updated { get; set; }
public string Username { get; set; }
public bool? Active { get; set; }
*/

class AsiakasEdit extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.riviAvain == props.rowId;
        });

        this.state = {
            open: false,
            RiviAvain: data[0].riviAvain,
            AsiakasNimi: data[0].asiakasNimi,
            TenantId: data[0].tenantId,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active
        };

    }

    componentWillMount() { }

    static propTypes = {
        onEditRow: PropTypes.func,
        classes: PropTypes.object,
        blurOnSelect: PropTypes.bool
    };

    handleSave = () => {
        this.props.onEditRow({
            RiviAvain: this.state.RiviAvain,
            AsiakasNimi: this.state.AsiakasNimi,
            TenantId: this.state.TenantId,
            Created: this.state.Created,
            Updated: this.state.Updated,
            Username: this.state.Username,
            Active: this.state.Active
        });
        this.setState({ open: false });
    }

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
                    <DialogTitle id="form-dialog-title">{dictionary.Asiakas.Title}</DialogTitle>
                    <form onSubmit={this.handleSave}>
                        <DialogContent style={{ width: "500px" }}>
                            <input type="hidden" value={this.state.RiviAvain} />
                            <TextField
                                margin="dense"
                                id="AsiakasNimi"
                                label={dictionary.Koodi.Columns[1]}
                                type="text"
                                fullWidth
                                value={this.state.AsiakasNimi}
                                onChange={handleChange('AsiakasNimi')}
                            />
                            <TextField
                                margin="dense"
                                id="TenantId"
                                label={dictionary.Koodi.Columns[2]}
                                type="text"
                                fullWidth
                                value={this.state.TenantId}
                                onChange={handleChange('TenantId')}
                            />
                            <TextField
                                required={true}
                                margin="dense"
                                id="Active"
                                label={dictionary.Koodi.Columns[6]}
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
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "AsiakasEdit" })(AsiakasEdit);
