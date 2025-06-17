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
public int KoodiryhmaAvain { get; set; }
public string KoodiryhmaNimi { get; set; }
public DateTime? Created { get; set; }
public DateTime? Updated { get; set; }
public string Username { get; set; }
public bool? Active { get; set; }
*/

class KoodiryhmaEdit extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.koodiryhmaAvain == props.rowId;
        });

        this.state = {
            open: false,
            KoodiryhmaAvain: data[0].koodiryhmaAvain,
            KoodiryhmaNimi: data[0].koodiryhmaNimi,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active
        };

    }

    static propTypes = {
        onEditRow: PropTypes.func,
        classes: PropTypes.object,
        rowId: PropTypes.object,
        blurOnSelect: PropTypes.bool
    };

    handleSave = () => {
        this.props.onEditRow({
            KoodiryhmaAvain: this.state.KoodiryhmaAvain,
            KoodiryhmaNimi: this.state.KoodiryhmaNimi,
            Created: this.state.Created,
            Updated: this.state.Updated,
            Username: this.state.Username,
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
                    <DialogTitle id="form-dialog-title">{dictionary.Koodiryhma.Title}</DialogTitle>
                    <form onSubmit={this.handleSave}>
                        <DialogContent style={{ width: "500px" }}>
                            <TextField
                                required={true}
                                margin="dense"
                                id="KoodiryhmaAvain"
                                label={dictionary.Koodiryhma.Columns[0]}
                                type="text"
                                fullWidth
                                value={this.state.KoodiryhmaAvain}
                                readonly
                            />
                            <TextField
                                required={true}
                                margin="dense"
                                id="KoodiryhmaNimi"
                                label={dictionary.Koodiryhma.Columns[1]}
                                type="text"
                                fullWidth
                                value={this.state.KoodiryhmaNimi}
                                onChange={handleChange('KoodiryhmaNimi')}
                            />
                            <TextField
                                required={true}
                                margin="dense"
                                id="Active"
                                label={dictionary.Koodiryhma.Columns[5]}
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

export default withStyles(defaultToolbarStyles, { name: "KoodiryhmaEdit" })(KoodiryhmaEdit);
