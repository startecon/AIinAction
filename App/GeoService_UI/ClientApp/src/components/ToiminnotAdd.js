import React from "react";
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import AddItem from "./AddItem";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
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
public string Paketti { get; set; }
public string Toiminto { get; set; }
public bool Aktivoitu { get; set; }
public DateTime? Created { get; set; }
public DateTime? Updated { get; set; }
public string Username { get; set; }
public bool? Active { get; set; }
*/

class ToiminnotAdd extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            RiviAvain: null,
            Paketti: null,
            Toiminto: null,
            Aktivoitu: null,
            Created: null,
            Updated: null,
            Username: null,
            Active: null
        };
    }

    static propTypes = {
        onAddNewRow: PropTypes.func,
        classes: PropTypes.object,
        blurOnSelect: PropTypes.bool
    };

    handleSave = () => {
        this.props.onAddNewRow({
            RiviAvain: 1,
            Paketti: this.state.Paketti,
            Toiminto: this.state.Toiminto,
            Aktivoitu: this.state.Aktivoitu,
            Created: this.state.Created,
            Updated: this.state.Updated,
            Username: this.state.Username,
            Active: this.state.Active
        });
        this.setState({ open: false });
    };

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
                    <DialogTitle id="form-dialog-title">{dictionary.Toiminnot.Title}</DialogTitle>
                    <form onSubmit={this.handleSave}>
                        <DialogContent style={{ width: "500px" }}>
                            <input type="hidden" value={this.state.RiviAvain} />
                            <TextField
                                margin="dense"
                                id="Paketti"
                                label={dictionary.Toiminnot.Columns[1]}
                                type="text"
                                fullWidth
                                value={this.state.Paketti}
                                onChange={handleChange('Paketti')}
                            />
                            <TextField
                                margin="dense"
                                id="Toiminto"
                                label={dictionary.Toiminnot.Columns[2]}
                                type="text"
                                fullWidth
                                value={this.state.Toiminto}
                                onChange={handleChange('Toiminto')}
                            />
                            <Switch
                                checked={this.state.Aktivoitu}
                                onChange={(e) => this.setState({ Aktivoitu: e.target.checked }) }
                                color="primary"
                                inputProps={{ 'aria-label': 'primary checkbox' }}
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

export default withStyles(defaultToolbarStyles, { name: "ToiminnotAdd" })(ToiminnotAdd);
