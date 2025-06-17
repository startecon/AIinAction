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

var iniTehtava;

/*
public int RiviAvain { get; set; }
public int TehtavaAvain { get; set; }
public DateTime? Aloitus { get; set; }
public DateTime? Lopetus { get; set; }
public DateTime? Seuraava { get; set; }
public DateTime? Edellinen { get; set; }
public bool? Toistuva { get; set; }
public int? Aikavali { get; set; }
public DateTime? Created { get; set; }
public DateTime? Updated { get; set; }
public string Username { get; set; }
public bool? Active { get; set; }
*/

class AjastusPreview extends React.Component {
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
            Aloitus: data[0].aloitus,
            Lopetus: data[0].lopetus,
            Seuraava: data[0].seuraava,
            Edellinen: data[0].edellinen,
            Toistuva: data[0].toistuva,
            Aikavali: data[0].aikavali,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active,
            tehtavat: (Object.keys(props.lookupLists.tehtavat).map(function (d) { return { value: d, label: props.lookupLists.tehtavat[d] }; }) || [])
        };
    }

    componentWillMount() {
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
                            <InputLabel>Aloitus</InputLabel>
                            <p className="teksti" >{this.state.Aloitus}</p>
                            <br />
                            <InputLabel>Lopetus</InputLabel>
                            <p className="teksti" >{this.state.Lopetus}</p>
                            <br />
                            <InputLabel>Seuraava</InputLabel>
                            <p className="teksti" >{this.state.Seuraava}</p>
                            <br />
                            <InputLabel>Edellinen</InputLabel>
                            <p className="teksti" >{this.state.Edellinen}</p>
                            <br />
                            <InputLabel>Toistuva</InputLabel>
                            <p className="teksti" >{this.state.Toistuva}</p>
                            <br />
                            <InputLabel>Aikaväli</InputLabel>
                            <p className="teksti" >{this.state.Aikavali}</p>
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

export default withStyles(defaultToolbarStyles, { name: "AjastusPreview" })(AjastusPreview);
