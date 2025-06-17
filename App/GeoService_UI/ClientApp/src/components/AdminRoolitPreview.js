import React from "react";
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import Button from '@mui/material/Button';
import PageviewIcon from '@mui/icons-material/Pageview';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { withStyles } from "@mui/styles";
import { LanguageContext } from './LanguageContext';


const defaultToolbarStyles = {
    iconButton: {
    },
};

var iniRooli;
var iniKayttaja;

class AdminRoolitPreview extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.roolitId == props.rowId;
        });

        this.state = {
            open: false,
            RoolitId: data[0].roolitId,
            Rooli_Id: data[0].rooli_Id,
            Profiili_Id: data[0].profiili_Id,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active,
            roolit: (Object.keys(props.lookupLists.roolit).map(function (d) { return { value: d, label: props.lookupLists.roolit[d] }; }) || []),
            filteredroolit: (Object.keys(props.lookupLists.roolit).map(function (d) { return { value: d, label: props.lookupLists.roolit[d] }; }) || []),
            kayttajat: (Object.keys(props.lookupLists.kayttajat).map(function (d) { return { value: d, label: props.lookupLists.kayttajat[d] }; }) || []),
            filteredkayttajat: (Object.keys(props.lookupLists.kayttajat).map(function (d) { return { value: d, label: props.lookupLists.kayttajat[d] }; }) || [])
        };
    }

    componentWillMount() {
        var r = this.state.Rooli_Id
        var k = this.state.Profiili_Id
        iniRooli = this.state.roolit.find(({ value }) => value === r.toString());
        iniKayttaja = this.state.kayttajat.find(({ value }) => value === k.toString());
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
                    <DialogTitle id="form-dialog-title">{dictionary.AdminRoolit.Title}</DialogTitle>
                    <DialogContent style={{ width: "450px" }}>
                        <div>
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRoolit.Columns[1]}</InputLabel>
                            <p className="teksti" >{iniRooli.label || dictionary.NoInfo}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRoolit.Columns[2]}</InputLabel>
                            <p className="teksti" >{iniKayttaja.label || dictionary.NoInfo}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRoolit.Columns[0]}</InputLabel>
                            <p className="teksti" >{this.state.RoolitId}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRoolit.Columns[3]}</InputLabel>
                            <p className="teksti" >{this.state.Created}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRoolit.Columns[4]}</InputLabel>
                            <p className="teksti" >{this.state.Updated}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRoolit.Columns[5]}</InputLabel>
                            <p className="teksti" >{this.state.Username}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRoolit.Columns[6]}</InputLabel>
                            <p className="teksti" >{this.state.Active}</p>
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

export default withStyles(defaultToolbarStyles, { name: "AdminRoolitPreview" })(AdminRoolitPreview);
