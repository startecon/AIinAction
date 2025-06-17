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

var iniAsiakas;

/*
public int RiviAvain { get; set; }
public int AsiakasAvain { get; set; }
public string ProjektiNimi { get; set; }
public DateTime? Created { get; set; }
public DateTime? Updated { get; set; }
public string Username { get; set; }
public bool? Active { get; set; }
*/

class ProjektiPreview extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.riviAvain == props.rowId;
        });

        this.state = {
            open: false,
            RiviAvain: data[0].riviAvain,
            AsiakasAvain: data[0].asiakasAvain,
            ProjektiNimi: data[0].projektiNimi,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active,
            asiakkaat: (Object.keys(props.lookupLists.asiakkaat).map(function (d) { return { value: d, label: props.lookupLists.asiakkaat[d] }; }) || []),
            filteredasiakkaat: (Object.keys(props.lookupLists.asiakkaat).map(function (d) { return { value: d, label: props.lookupLists.asiakkaat[d] }; }) || [])
        };
    }

    componentWillMount() {
        iniAsiakas = this.state.asiakkaat.find(({ value }) => value === (this.state.AsiakasAvain || '').toString());
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
                    <DialogTitle id="form-dialog-title">Projekti</DialogTitle>
                    <DialogContent style={{ width: "450px" }}>
                        <div>
                            <InputLabel>Projektiavain</InputLabel>
                            <p className="teksti" >{this.state.RiviAvain}</p>
                            <br />
                            <InputLabel>Asiakas</InputLabel>
                            <p className="teksti" >{(iniAsiakas || {}).label || dictionary.NoInfo}</p>
                            <br />
                            <InputLabel>Projekti</InputLabel>
                            <p className="teksti" >{this.state.ProjektiNimi}</p>
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

export default withStyles(defaultToolbarStyles, { name: "ProjektiPreview" })(ProjektiPreview);
