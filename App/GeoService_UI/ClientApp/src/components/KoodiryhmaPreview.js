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

/*
public int KoodiryhmaAvain { get; set; }
public string KoodiryhmaNimi { get; set; }
public DateTime? Created { get; set; }
public DateTime? Updated { get; set; }
public string Username { get; set; }
public bool? Active { get; set; }
*/

class KoodiryhmaPreview extends React.Component {
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
                    <DialogTitle id="form-dialog-title">{this.state.KoodiryhmaNimi}</DialogTitle>
                    <DialogContent style={{ width: "450px" }}>
                        <div>
                            <InputLabel>Koodiryhmä Avain</InputLabel>
                            <p className="teksti" >{this.state.KoodiryhmaAvain}</p>
                            <br />
                            <InputLabel>Koodiryhmä</InputLabel>
                            <p className="teksti" >{this.state.KoodiryhmaNimi}</p>
                            <br />
                            <InputLabel>Luotu</InputLabel>
                            <p className="teksti" >{this.state.Created}</p>
                            <br />
                            <InputLabel>Muokattu</InputLabel>
                            <p className="teksti" >{this.state.Updated}</p>
                            <br />
                            <InputLabel>Muokkaaja</InputLabel>
                            <p className="teksti" >{this.state.Username}</p>
                            <br />
                            <InputLabel>Käytössä</InputLabel>
                            <p className="teksti" >{this.state.Active}</p>
                            <br />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleSave} color="primary">
                            Sulje
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "KoodiryhmaPreview" })(KoodiryhmaPreview);
