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

var iniKoodiryhma;

/*
public int KoodiAvain { get; set; }
public int KoodiryhmaAvain { get; set; }
public string KoodiNimi { get; set; }
public string KoodiKuvaus { get; set; }
public DateTime? Created { get; set; }
public DateTime? Updated { get; set; }
public string Username { get; set; }
public bool? Active { get; set; }
*/

class KoodiPreview extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.koodiAvain == props.rowId;
        });

        this.state = {
            open: false,
            KoodiAvain: data[0].koodiAvain,
            KoodiryhmaAvain: data[0].koodiryhmaAvain,
            KoodiNimi: data[0].koodiNimi,
            KoodiKuvaus: data[0].koodiKuvaus,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active,
            koodiryhmat: (Object.keys(props.lookupLists.koodiryhmat).map(function (d) { return { value: d, label: props.lookupLists.koodiryhmat[d] }; }) || []),
            filteredkoodiryhmat: (Object.keys(props.lookupLists.koodiryhmat).map(function (d) { return { value: d, label: props.lookupLists.koodiryhmat[d] }; }) || [])
        };
    }

    componentWillMount() {
        var k = this.state.KoodiryhmaAvain
        iniKoodiryhma = this.state.koodiryhmat.find(({ value }) => value === k.toString());
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
                    <DialogTitle id="form-dialog-title">{dictionary.Koodi.Title}</DialogTitle>
                    <DialogContent style={{ width: "450px" }}>
                        <div>
                            <InputLabel>{dictionary.Koodi.Columns[0]}</InputLabel>
                            <p className="teksti" >{this.state.KoodiAvain}</p>
                            <br />
                            <InputLabel>{dictionary.Koodi.Columns[1]}</InputLabel>
                            <p className="teksti" >{this.state.KoodiNimi}</p>
                            <br />
                            <InputLabel>{dictionary.Koodi.Columns[2]}</InputLabel>
                            <p className="teksti" >{(iniKoodiryhma || {}).label || dictionary.NoInfo}</p>
                            <br />
                            <InputLabel>{dictionary.Koodi.Columns[3]}</InputLabel>
                            <p className="teksti" >{this.state.KoodiKuvaus}</p>
                            <br />
                            <InputLabel>{dictionary.Koodi.Columns[4]}</InputLabel>
                            <p className="teksti" >{this.state.Created}</p>
                            <br />
                            <InputLabel>{dictionary.Koodi.Columns[5]}</InputLabel>
                            <p className="teksti" >{this.state.Updated}</p>
                            <br />
                            <InputLabel>{dictionary.Koodi.Columns[6]}</InputLabel>
                            <p className="teksti" >{this.state.Username}</p>
                            <br />
                            <InputLabel>{dictionary.Koodi.Columns[7]}</InputLabel>
                            <p className="teksti" >{this.state.Active}</p>
                            <br />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleSave} color="primary">
                            {dictionary.Koodi.Close}
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "KoodiPreview" })(KoodiPreview);
