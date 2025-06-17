import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

class AddItem extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);
        this.state = {
            item: ""
        };
    }

    static propTypes = {
        onAddNewItem: PropTypes.func,
        classes: PropTypes.object,
        blurOnSelect: PropTypes.bool,
        open: PropTypes.bool,
        list: PropTypes.string
    };

    render() {
        const { dictionary } = this.context;
        const { classes, list, title } = this.props;
      
        const handleChange = name => event => {
            this.setState({ [name]: event.target.value });
        };

        const handleSave = () => {
            this.props.onAddNewItem(list, this.state.item);
            this.props.closeDialog(list);
        };
        const handleClose = () => {
            this.props.closeDialog(list);
        };

        const obj = title.toString().toLowerCase();

        return (
            <React.Fragment>
                <Dialog open={this.props.open} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">{dictionary.New} {obj}</DialogTitle>
                    <DialogContent>
                        <TextField
                            id="item"
                            label={title}
                            name="item"
                            type="text"
                            onChange={handleChange('item')}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            {dictionary.Cancel}
                        </Button>
                        <Button onClick={handleSave} color="primary">
                            {dictionary.Ok}
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "AddItem" })(AddItem);