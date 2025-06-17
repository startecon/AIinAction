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

var iniRooli;
var iniEntiteetti;

class AdminRooliOikeudetPreview extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.rooliOikeudetId == props.rowId;
        });

        this.state = {
            open: false,
            RooliOikeudetId: data[0].rooliOikeudetId,
            Rooli_Id: data[0].rooli_Id,
            Entiteetti_Id: data[0].entiteetti_Id,
            Rivi_Id: data[0].rivi_Id,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active,
            rooli: "",
            roolit: (Object.keys(props.lookupLists.roolit).map(function (d) { return { value: d, label: props.lookupLists.roolit[d] }; }) || []),
            filteredroolit: (Object.keys(props.lookupLists.roolit).map(function (d) { return { value: d, label: props.lookupLists.roolit[d] }; }) || []),
            entiteetti: "",
            entiteetit: (Object.keys(props.lookupLists.entiteetit).map(function (d) { return { value: d, label: props.lookupLists.entiteetit[d] }; }) || []),
            filteredentiteetit: (Object.keys(props.lookupLists.entiteetit).map(function (d) { return { value: d, label: props.lookupLists.entiteetit[d] }; }) || [])
        };
    }

    componentWillMount() {
        var r = this.state.Rooli_Id || '';
        var k = this.state.Entiteetti_Id || '';
        iniRooli = this.state.roolit.find(({ value }) => value === r.toString());
        iniEntiteetti = this.state.entiteetit.find(({ value }) => value === k.toString());
    }

    static propTypes = {
        onAddNewRow: PropTypes.func,
        onLookupListChange: PropTypes.func,
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
                    <DialogTitle id="form-dialog-title">{dictionary.AdminRooliOikeudet.Title}</DialogTitle>
                    <DialogContent style={{ width: "450px" }}>
                        <div>
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRooliOikeudet.Columns[1]} Rooli</InputLabel>
                            <p className="teksti" >{(iniRooli || {}).label || dictionary.NoInfo}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRooliOikeudet.Columns[2]}</InputLabel>
                            <p className="teksti" >{(iniEntiteetti || {}).label || dictionary.NoInfo}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRooliOikeudet.Columns[3]}</InputLabel>
                            <p className="teksti" >{this.state.Rivi_Id}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRooliOikeudet.Columns[0]}</InputLabel>
                            <p className="teksti" >{this.state.RooliOikeudetId}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRooliOikeudet.Columns[4]}</InputLabel>
                            <p className="teksti" >{this.state.Created}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRooliOikeudet.Columns[5]}</InputLabel>
                            <p className="teksti" >{this.state.Updated}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRooliOikeudet.Columns[6]}</InputLabel>
                            <p className="teksti" >{this.state.Username}</p>
                            <br />
                            <InputLabel style={{ color: "Black" }}>{dictionary.AdminRooliOikeudet.Columns[7]}</InputLabel>
                            <p className="teksti" >{this.state.Active}</p>
                            <br />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleSave} color="primary">
                            {dictionary.Close }
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "AdminRooliOikeudetPreview" })(AdminRooliOikeudetPreview);
