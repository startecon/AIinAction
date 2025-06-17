import React from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { withStyles } from "@mui/styles";

const defaultToolbarStyles = {
    iconButton: {
    },
};

class ErrorDialog extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { open, title, body, onClose } = this.props;

        return (
            <React.Fragment>
                <Dialog
                    open={open}
                    onClose={onClose}
                >
                    <DialogTitle>{title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {body}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} color="primary" autoFocus>
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "ErrorDialog" })(ErrorDialog);
