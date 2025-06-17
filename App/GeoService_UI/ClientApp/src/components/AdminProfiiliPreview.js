import React from "react";
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Button from '@mui/material/Button';
import PageviewIcon from '@mui/icons-material/Pageview';
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

class AdminProfiiliPreview extends React.Component {
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
        const { classes } = this.props;

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
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminProfiili.Columns[0]}</InputLabel>
                            <p className="teksti" >{this.state.ProfiiliId}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminProfiili.Columns[1]}</InputLabel>
                            <p className="teksti" >{this.state.UI_Settings}</p>
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

export default withStyles(defaultToolbarStyles, { name: "AdminProfiiliPreview" })(AdminProfiiliPreview);
