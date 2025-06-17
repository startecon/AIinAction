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

var iniProjekti;
var iniTyyppi;
var iniKayttis;
var iniCPU;
var iniGPU;

/*
public int RiviAvain { get; set; }
public int ProjektiAvain { get; set; }
public int TyyppiAvain { get; set; }
public string AgenttiNimi { get; set; }
public int OSAvain { get; set; }
public int CPU { get; set; }
public int CPUAvain { get; set; }
public int Muisti { get; set; }
public int Levykoko { get; set; }
public int GPU { get; set; }
public int GPUAvain { get; set; }
public string Kuvaus { get; set; }
public string RekisterointiAvain { get; set; }
public DateTime? Syke { get; set; }
public DateTime? Created { get; set; }
public DateTime? Updated { get; set; }
public string Username { get; set; }
public bool? Active { get; set; }
*/

class AgenttiPreview extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.riviAvain == props.rowId;
        });

        this.state = {
            open: false,
            RiviAvain: data[0].riviAvain,
            ProjektiAvain: data[0].projektiAvain,
            TyyppiAvain: data[0].tyyppiAvain,
            AgenttiNimi: data[0].agenttiNimi,
            OSAvain: data[0].osAvain,
            CPU: data[0].cpu,
            CPUAvain: data[0].cpuAvain,
            Muisti: data[0].muisti,
            Levykoko: data[0].levykoko,
            GPU: data[0].gpu,
            GPUAvain: data[0].gpuAvain,
            Kuvaus: data[0].kuvaus,
            RekisterointiAvain: data[0].rekisterointiAvain,
            Syke: data[0].syke,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active,
            koodit: (Object.keys(props.lookupLists.koodit).map(function (d) { return { value: d, label: props.lookupLists.koodit[d] }; }) || []),
            projektit: (Object.keys(props.lookupLists.projektit).map(function (d) { return { value: d, label: props.lookupLists.projektit[d] }; }) || [])
        };
    }

    componentWillMount() {
        iniProjekti = this.state.projektit.find(({ value }) => value === (this.state.ProjektiAvain || '').toString());
        iniTyyppi = this.state.koodit.find(({ value }) => value === (this.state.TyyppiAvain || '').toString());
        iniKayttis = this.state.koodit.find(({ value }) => value === (this.state.OSAvain || '').toString());
        iniCPU = this.state.koodit.find(({ value }) => value === (this.state.CPUAvain || '').toString());
        iniGPU = this.state.koodit.find(({ value }) => value === (this.state.GPUAvain || '').toString());
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
                            <InputLabel>Riviavain</InputLabel>
                            <p className="teksti" >{this.state.RiviAvain}</p>
                            <br />
                            <InputLabel>Projekti</InputLabel>
                            <p className="teksti" >{(iniProjekti || {}).label || 'ei tietoja'}</p>
                            <br />
                            <InputLabel>Resurssityyppi</InputLabel>
                            <p className="teksti" >{(iniTyyppi || {}).label || 'ei tietoja'}</p>
                            <br />
                            <InputLabel>AgenttiNimi</InputLabel>
                            <p className="teksti" >{this.state.AgenttiNimi}</p>
                            <br />
                            <InputLabel>Käyttöjärjestelmä</InputLabel>
                            <p className="teksti" >{(iniKayttis || {}).label || 'ei tietoja'}</p>
                            <br />
                            <InputLabel>Prosessoriytimet</InputLabel>
                            <p className="teksti" >{this.state.CPU}</p>
                            <br />
                            <InputLabel>Prosessorityyppi</InputLabel>
                            <p className="teksti" >{(iniCPU || {}).label || 'ei tietoja'}</p>
                            <br />
                            <InputLabel>Muisti</InputLabel>
                            <p className="teksti" >{this.state.Muisti}</p>
                            <br />
                            <InputLabel>Levykoko</InputLabel>
                            <p className="teksti" >{this.state.Levykoko}</p>
                            <br />
                            <InputLabel>GPU-prosessorit</InputLabel>
                            <p className="teksti" >{this.state.GPU}</p>
                            <br />
                            <InputLabel>GPU-tyyppi</InputLabel>
                            <p className="teksti" >{(iniGPU || {}).label || 'ei tietoja'}</p>
                            <br />
                            <InputLabel>Kuvaus</InputLabel>
                            <p className="teksti" >{this.state.Kuvaus}</p>
                            <br />
                            <InputLabel>Rekisteröintiavain</InputLabel>
                            <p className="teksti" >{this.state.RekisterointiAvain}</p>
                            <br />
                            <InputLabel>Syke</InputLabel>
                            <p className="teksti" >{this.state.Syke}</p>
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

export default withStyles(defaultToolbarStyles, { name: "AgenttiPreview" })(AgenttiPreview);
