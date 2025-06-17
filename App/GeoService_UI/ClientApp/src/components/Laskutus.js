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

export default class KayttajaTili extends Component {
    static contextType = LanguageContext;

    constructor(props) {
        super(props);

        this.state = {
            open: false,
            plan: "A"
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
                    <ListItemIcon><PaymentIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                    <ListItemText primary="Laskutus" color="iconText" />
                </ListItemButton>

                <Dialog open={this.state.open} onClose={() => this.setState({ open: false })} fullWidth={true} maxWidth={"md"}>
                    <DialogTitle color="iconText">
                        Palvelupaketit
                    </DialogTitle>
                    <DialogContent style={{ padding: "5px 25px" }}>

                        <FormControl>
                            <RadioGroup
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                value={this.state.plan}
                                onChange={handleChangePlan}
                            >
                                <FormControlLabel value="A" control={<Radio color="secondary" />} label="Plan A" />
                                <FormControlLabel value="B" control={<Radio color="secondary" />} label="Plan B" />
                                <FormControlLabel value="C" control={<Radio color="secondary" />} label="Plan C" />
                            </RadioGroup>
                        </FormControl>

                        <div style={{ padding: "5px 0px" }}>
                            <TextField
                                required
                                id="outlined-required"
                                label="Kortin numero"
                                color="iconText"
                                variant="outlined"
                                defaultValue={this.state.cardNumber}
                                fullWidth
                            />
                        </div>
                        <div style={{ padding: "5px 0px" }}>
                            <TextField
                                required
                                id="outlined-required"
                                label="Kortinhaltijan nimi"
                                color="iconText"
                                variant="outlined"
                                defaultValue={this.state.nimi}
                                fullWidth
                            />
                        </div>
                        <Grid container alignItems="center" style={{ padding: "5px 0px" }}>
                            <Grid item lg={6} style={{ paddingRight: "10px" }}>
                                <TextField
                                    required
                                    id="outlined-required"
                                    label="Viimeinen voimassaolopäivä"
                                    color="iconText"
                                    variant="outlined"
                                    defaultValue={this.state.lastDay}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item lg={6}>
                                <TextField
                                    required
                                    id="outlined-required"
                                    label="CVC / CVC2"
                                    color="iconText"
                                    variant="outlined"
                                    defaultValue={this.state.cvc}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions style={{ paddingLeft: "20px", justifyContent: "left" }}>
                        <Button onClick={() => this.setState({ open: false })} color="white" style={{ background: "#ff6600ff" }}>Tallenna</Button>
                        <Button onClick={() => this.setState({ open: false })} color="iconText" >Peruuta</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}