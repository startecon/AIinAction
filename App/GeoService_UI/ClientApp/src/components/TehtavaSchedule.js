import React from "react";
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import IconButton from "@mui/material/IconButton";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tooltip from "@mui/material/Tooltip";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import { withStyles } from "@mui/styles";

import { authFetch, authPost } from "./../authProvider";
import { LanguageContext } from './LanguageContext';

/* Näkymäkohtaiset muuttujat ja vakiot */
const API_PREFIX = 'api/Ajastus/Ajo';

const defaultToolbarStyles = {
    iconButton: {
    },
};

class TehtavaSchedule extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            aloitus: null,
            seuraava: null,
            lopetus: null,
            toistuva: null,
            aikavali: null
        };

    }

    componentWillMount() {
    }

    static propTypes = {
        onScheduleRow: PropTypes.func,
        rowId: PropTypes.number,
        classes: PropTypes.object,
        blurOnSelect: PropTypes.bool
    };

    handleSave = () => {
        this.props.onScheduleRow({
            Aloitus: this.state.aloitus,
            Lopetus: this.state.lopetus,
            Toistuva: this.state.toistuva,
            Aikavali: this.state.aikavali
        }, this.props.rowId);
        this.setState({ open: false });
    }

    render() {
        const { dictionary } = this.context;
        const { rowId } = this.props;

        const handleChange = name => event => {
            this.setState({ [name]: event.target.value });
        };

        var handleClickOpen = () => {
            //Items
            authFetch(this.props.pca, API_PREFIX + '/Read/' + rowId)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        this.setState({
                            open: true,
                            aloitus: (data[0].seuraava || data[0].aloitus || '').substring(0, 16),
                            lopetus: (data[0].lopetus || '').substring(0, 16),
                            toistuva: (data[0].toistuva ? 1 : 0),
                            aikavali: data[0].aikavali
                        });
                    } else {
                        this.setState({
                            open: true,
                            aloitus: null,
                            lopetus: null,
                            toistuva: null,
                            aikavali: null
                        });
                    }
                });
        }

        var handleClose = () => {
            this.setState({ open: false });
        }

        return (
            <React.Fragment>
                <Tooltip title={dictionary.Tehtava.Tooltip3}>
                    <IconButton onClick={handleClickOpen}>
                        <WatchLaterIcon />
                    </IconButton>
                </Tooltip>

                <Dialog open={this.state.open} onClose={handleClose} maxWidth={false} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Ajastus</DialogTitle>
                    <DialogContent style={{ width: "500px" }}>
                        <TextField
                            id="aloitus-datetime"
                            label={dictionary.Tehtava.Textfield1}
                            type="datetime-local"
                            value={this.state.aloitus}
                            onChange={handleChange('aloitus')}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            id="lopetus-datetime"
                            label={dictionary.Tehtava.Textfield2}
                            type="datetime-local"
                            value={this.state.lopetus}
                            onChange={handleChange('lopetus')}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <div>
                            <InputLabel id="toistuva-select-label">{dictionary.Tehtava.Items[0]}</InputLabel>
                            <Select
                                labelId="toistuva-select-label"
                                id="toistuva-select"
                                value={this.state.toistuva || 0}
                                onChange={handleChange('toistuva')}
                            >
                                <MenuItem value={0}>{dictionary.Tehtava.Items[1]}</MenuItem>
                                <MenuItem value={1}>{dictionary.Tehtava.Items[2]}</MenuItem>
                            </Select>
                        </div>
                        <div>
                            <InputLabel id="aikavali-select-label">{dictionary.Tehtava.Items[0]}</InputLabel>
                            <Select
                                labelId="aikavali-select-label"
                                id="aikavali-select"
                                value={this.state.aikavali}
                                onChange={handleChange('aikavali')}
                            >
                                <MenuItem value=""></MenuItem>
                                <MenuItem value={10}>{dictionary.Tehtava.Items[1]}</MenuItem>
                                <MenuItem value={30}>{dictionary.Tehtava.Items[2]}</MenuItem>
                                <MenuItem value={60}>{dictionary.Tehtava.Items[3]}</MenuItem>
                                <MenuItem value={120}>{dictionary.Tehtava.Items[4]}</MenuItem>
                                <MenuItem value={360}>{dictionary.Tehtava.Items[5]}</MenuItem>
                                <MenuItem value={720}>{dictionary.Tehtava.Items[6]}</MenuItem>
                                <MenuItem value={1440}>{dictionary.Tehtava.Items[7]}</MenuItem>
                            </Select>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button type="submit" color="primary" onClick={this.handleSave}>
                            {dictionary.Ok}
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "TehtavaSchedule" })(TehtavaSchedule);
