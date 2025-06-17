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

var iniRiviTila;
var iniTehtava;

/*
public int RiviAvain { get; set; }
public int TehtavaAvain { get; set; }
public int Prioriteetti { get; set; }
public string AjoNimi { get; set; }
public DateTime? Aloitus { get; set; }
public DateTime? Lopetus { get; set; }
public bool? Ajastettu { get; set; }
public int RiviTilaAvain { get; set; }
public string Selite { get; set; }
public DateTime? Created { get; set; }
public DateTime? Updated { get; set; }
public string Username { get; set; }
public bool? Active { get; set; }
*/

class AjoPreview extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.riviAvain == props.rowId;
        });

        this.state = {
            open: false,
            RiviAvain: data[0].riviAvain,
            TehtavaAvain: data[0].tehtavaAvain,
            Prioriteetti: data[0].prioriteetti,
            AjoNimi: data[0].ajoNimi,
            Aloitus: data[0].aloitus,
            Lopetus: data[0].lopetus,
            Ajastettu: data[0].ajastettu,
            RiviTilaAvain: data[0].riviTilaAvain,
            Selite: data[0].selite,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active,
            koodit: (Object.keys(props.lookupLists.koodit).map(function (d) { return { value: d, label: props.lookupLists.koodit[d] }; }) || []),
            tehtavat: (Object.keys(props.lookupLists.tehtavat).map(function (d) { return { value: d, label: props.lookupLists.tehtavat[d] }; }) || [])
        };
    }

    componentWillMount() {
        iniRiviTila = this.state.koodit.find(({ value }) => value === (this.state.RiviTilaAvain || '').toString());
        iniTehtava = this.state.tehtavat.find(({ value }) => value === (this.state.TehtavaAvain || '').toString());
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
                    <DialogTitle id="form-dialog-title">Koodi</DialogTitle>
                    <DialogContent style={{ width: "450px" }}>
                        <div>
                            <InputLabel>RiviAvain</InputLabel>
                            <p className="teksti" >{this.state.RiviAvain}</p>
                            <br />
                            <InputLabel>Tehtävä</InputLabel>
                            <p className="teksti" >{(iniTehtava || {}).label || 'ei tietoja'}</p>
                            <br />
                            <InputLabel>Prioriteetti</InputLabel>
                            <p className="teksti" >{this.state.Prioriteetti}</p>
                            <br />
                            <InputLabel>AjoNimi</InputLabel>
                            <p className="teksti" >{this.state.AjoNimi}</p>
                            <br />
                            <InputLabel>Aloitus</InputLabel>
                            <p className="teksti" >{this.state.Aloitus}</p>
                            <br />
                            <InputLabel>Lopetus</InputLabel>
                            <p className="teksti" >{this.state.Lopetus}</p>
                            <br />
                            <InputLabel>Ajastettu</InputLabel>
                            <p className="teksti" >{this.state.Ajastettu}</p>
                            <br />
                            <InputLabel>RiviTilaAvain</InputLabel>
                            <p className="teksti" >{(iniRiviTila || {}).label || 'ei tietoja'}</p>
                            <br />
                            <InputLabel>Selite</InputLabel>
                            <p className="teksti" >{this.state.Selite}</p>
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

export default withStyles(defaultToolbarStyles, { name: "AjoPreview" })(AjoPreview);
