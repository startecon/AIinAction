import React, { Component } from 'react';
import { Link, Redirect, useLocation } from 'react-router-dom';
import { Link as ScrollLink, scroller } from 'react-scroll';
import { NavMenu } from './NavMenu';
import { Grid, Fab, Typography, TextField, Button, Tooltip } from '@mui/material';
import { LanguageContext } from './LanguageContext';

import { Timeline, Public, Equalizer, Code, Language, PinDrop, BurstMode, FolderShared, Storage, School, Group, FiberManualRecord } from '@mui/icons-material';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Paper from '@mui/material/Paper';
import { withStyles } from "@mui/styles";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Zoom from '@mui/material/Zoom';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@mui/material/Box';
import PaymentIcon from '@mui/icons-material/Payment';
import Person2Icon from '@mui/icons-material/Person2';
import HelpIcon from '@mui/icons-material/Help';

import GlobalMenu from "./GlobalMenu"

const searchParams = new URLSearchParams(document.location.search);

export default class KayttajaTili extends Component {
    static contextType = LanguageContext;

    constructor(props) {
        super(props);

        this.state = {
            open: false
        };
    }

    handleLogEvent = (e, tar, act, info, url) => {
        e.preventDefault();

        fetch('api/EventLoger/Create', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                target: tar,
                action: act,
                info: info
            })
        })

        if (url) {
            window.open(url, '_blank').focus();
        }
    }

    render(props) {
        const { userLanguage, dictionary } = this.context;

        const handleChangePlan = (event) => {
            this.setState({ plan: event.target.value });
        };

        return (
            <div>
                <ListItemButton sx={{ pl: 4 }} onClick={() => this.setState({ open: true })}>
                    <ListItemIcon><HelpIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                    <ListItemText primary="Tuki" color="iconText" />
                </ListItemButton>

                <Dialog open={this.state.open} onClose={() => this.setState({ open: false })} fullWidth={true} maxWidth={"md"}>
                    <DialogTitle color="iconText">
                        Tuki
                    </DialogTitle>
                    <DialogContent>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header" >
                                <Grid container justifyContent="space-around" style={{ padding: "5px 0px" }}>
                                    <Grid item md={6}>
                                        <Typography style={{ fontWeight: "bold" }}>Ohjesivusto</Typography>
                                    </Grid>
                                    <Grid item md={6}>
                                        <Typography>Täältä löydät vinkkejä ja apua Geoservicen käyttöön</Typography>
                                    </Grid>
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                                    malesuada lacus ex, sit amet blandit leo lobortis eget.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
                                <Grid container justifyContent="space-around" style={{ padding: "5px 0px" }}>
                                    <Grid item md={6}>
                                        <Typography style={{ fontWeight: "bold" }}>Ota yhteyttä</Typography>
                                    </Grid>
                                    <Grid item md={6}>
                                        <Typography>Ota Jätä meille yhteydenottopyyntö</Typography>
                                    </Grid>
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails>
                                <div>
                                    <TextField
                                        required
                                        id="outlined-required"
                                        label="Otsikko"
                                        color="iconText"
                                        variant="outlined"
                                        defaultValue={this.state.Otsikko}
                                        fullWidth
                                    />
                                </div>
                                <div style={{ padding: "15px 0px" }}>
                                    <TextField
                                        required
                                        id="outlined-required"
                                        label="Viesti"
                                        color="iconText"
                                        variant="outlined"
                                        defaultValue={this.state.Viesti}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        maxRows={10}
                                    />
                                </div>
                                <div style={{ justifyContent: "left" }}>
                                    <Button onClick={() => this.setState({ open: false })} color="white" style={{ background: "#ff6600ff" }}>Tallenna</Button>
                                    <Button onClick={() => this.setState({ open: false })} color="iconText" >Peruuta</Button>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
}