import React from "react";
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import Button from '@mui/material/Button';
import PageviewIcon from '@mui/icons-material/Pageview';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { withStyles } from "@mui/styles";
import { LanguageContext } from './LanguageContext';



const defaultToolbarStyles = {
    iconButton: {
    },
};

class AdminRooliPreview extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.rooliId == props.rowId;
        });

        this.state = {
            open: false,
            RooliId: data[0].rooliId,
            RooliNimi: data[0].rooliNimi,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active
        };
    }

    static propTypes = {
        onAddNewRow: PropTypes.func,
        onLookupListChange: PropTypes.func,
        classes: PropTypes.object,
        Daatta: PropTypes.object,
        rowId: PropTypes.object,
        blurOnSelect: PropTypes.bool
    };

    handleSave = () => {
        this.setState({ open: false });
    }

    render() {
        const { dictionary } = this.context;
        const { classes, lookupLists } = this.props;
        const handleChange = name => event => {
            this.setState({ [name]: event.target.value });
        };

        const handleClickOpen = () => {
            this.setState({ open: true });
        }

        const handleClose = () => {
            this.setState({ open: false });
        }

        return (
            <React.Fragment>
                <Tooltip title={dictionary.Preview}>
                    <IconButton className={classes.iconButton} onClick={handleClickOpen}>
                        <PageviewIcon />
                    </IconButton>
                </Tooltip>

                <Dialog open={this.state.open} onClose={handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">{this.state.Username}</DialogTitle>
                    <DialogContent style={{ width: "450px" }}>
                        <div>
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRooli.Columns[0]}</InputLabel>
                            <p className="teksti" >{this.state.RooliId}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRooli.Columns[1]}</InputLabel>
                            <p className="teksti" >{this.state.RooliNimi}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRooli.Columns[2]}</InputLabel>
                            <p className="teksti" >{this.state.Created}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRooli.Columns[3]}</InputLabel>
                            <p className="teksti" >{this.state.Updated}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRooli.Columns[4]}</InputLabel>
                            <p className="teksti" >{this.state.Username}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRooli.Columns[5]}</InputLabel>
                            <p className="teksti" >{this.state.Active}</p>
                            <br />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleSave} color="primary">
                           {dictionary.Close}
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "AdminRooliPreview" })(AdminRooliPreview);
