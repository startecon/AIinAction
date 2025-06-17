import React from "react";
import PropTypes from 'prop-types';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import PageviewIcon from '@mui/icons-material/Pageview';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import Grid from '@mui/material/Grid';
import { LanguageContext } from './LanguageContext';

import { withStyles } from "@mui/styles";


const defaultToolbarStyles = {
    iconButton: {
    },
};

var iniRiviTila;
var iniTila;
var iniProjekti;

class TehtavaPreview extends React.Component {
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
            TehtavaNimi: data[0].tehtavaNimi,
            Malli: data[0].malli,
            TilaAvain: data[0].tilaAvain,
            RiviTilaAvain: data[0].riviTilaAvain,
            Selite: data[0].selite,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active,
            koodit: (Object.keys(props.lookupLists.koodit).map(function (d) { return { value: d, label: props.lookupLists.koodit[d] }; }) || []),
            tilat: (Object.keys(props.lookupLists.tilat).map(function (d) { return { value: d, label: props.lookupLists.tilat[d] }; }) || []),
            projektit: (Object.keys(props.lookupLists.projektit).map(function (d) { return { value: d, label: props.lookupLists.projektit[d] }; }) || [])
        };
    }

    componentDidMount() {
        iniRiviTila = this.state.koodit.find(({ value }) => value === (this.state.RiviTilaAvain || '').toString());
        iniTila = this.state.tilat.find(({ value }) => value === (this.state.TilaAvain || '').toString());
        iniProjekti = this.state.projektit.find(({ value }) => value === (this.state.ProjektiAvain || '').toString());
    }

    static propTypes = {
        classes: PropTypes.object,
        Daatta: PropTypes.array,
        rowId: PropTypes.number,
        blurOnSelect: PropTypes.bool
    };

    handleSave = () => {
        this.setState({ open: false });
    }

    transSlideUp = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="up" ref={ref} {...props} />;
    });

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

                <Dialog fullScreen open={this.state.open} onClose={handleClose} TransitionComponent={this.transSlideUp}>
                    <AppBar position="relative" color="inherit" >
                        <Toolbar>
                            <Grid
                                container
                                direction="row"
                                justify="space-between"
                                alignItems="flex-end"
                            >
                                <Grid item xs={8}>
                                    <div style={{ display: 'flex' }}>
                                        <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                                            <CloseIcon />
                                        </IconButton>
                                        <Typography style={{ fontSize: 28 }}>
                                            {(iniProjekti || {}).label || ''} - {this.state.TehtavaNimi}, Rivitila: {(iniRiviTila || {}).label || dictionary.NoInfo}, Tila: {(iniTila || {}).label || dictionary.NoInfo}
                                        </Typography>
                                    </div>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </AppBar>
                    <DialogContent>

                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "TehtavaPreview" })(TehtavaPreview);
