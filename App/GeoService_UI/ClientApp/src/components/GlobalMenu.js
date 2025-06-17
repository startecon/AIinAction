import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, AttributionControl, Tooltip, LayersControl, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
//import 'leaflet-rotate/dist/leaflet-rotate';
import { Button, ButtonGroup, TextField, Paper, MenuList, ListItemText, Menu, Radio, FormControlLabel, Typography, AccordionDetails, Slider, ListItemIcon, AccordionSummary, Accordion, IconButton, Grid, Input, Box, FormControl, InputLabel, Select, MenuItem, Autocomplete, Collapse, ListItemButton, List, AppBar } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import cloneDeep from 'lodash.clonedeep';
import { authFetch, authPost } from "./../authProvider";
import { LanguageContext } from './LanguageContext';
import { languageOptions } from './../translations';

import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import BuildIcon from '@mui/icons-material/Build';
import StorefrontIcon from '@mui/icons-material/Storefront';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupsIcon from '@mui/icons-material/Groups';
import FlagIcon from '@mui/icons-material/Flag';
import HelpIcon from '@mui/icons-material/Help';
import PaymentIcon from '@mui/icons-material/Payment';
import Person2Icon from '@mui/icons-material/Person2';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import GroupIcon from '@mui/icons-material/Group';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import CloseIcon from '@mui/icons-material/Close';
import DehazeIcon from '@mui/icons-material/Dehaze';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { FeatureTrim } from './FeatureTrim';
import KayttajaProfiili from "./KayttajaProfiili"
import Laskutus from "./Laskutus"
import Support from "./Support"

export default class GlobalMenu extends React.Component {
    static contextType = LanguageContext;

    constructor(props) {
        super(props);
        this.state = {
            width: 65,
            shrink: true,
            menu: "0",
            openAna: false,
            openSet: false,
            openPro: false,
            openLang: false,
            features: null,
            showLanguage: false,
            anchorLanguage: null,
        };

        //featuret
        authFetch(this.props.pca, 'api/Toiminnot/Read')
            .then(response => response.json())
            .then(data => {
                var features = data.filter(d => d.aktivoitu).map(d => d.toiminto); //.filter((v, i, a) => a.indexOf(v) == i); //uniikit
                this.setState({ features: features })
            });
    }



    handle = () => {
        this.props.onExpand(this.state.shrink);

        if (this.state.shrink === false) {
            this.setState({ width: 65, shrink: true })
        } else if (this.state.shrink === true) {
            this.setState({ width: 300, shrink: false })
        }

    }

    toggleLanguage = (event) => {
        this.setState({
            showLanguage: !this.state.showLanguage,
            anchorLanguage: event.currentTarget
        });
    }

    render() {
        const { userLanguage, userLanguageChange, dictionary } = this.context;
        const { openAna, openSet, openPro, openLang, shrink, anchorLanguage, showLanguage, features } = this.state;

        const handleLanguageChange = (event) => {
            this.setState({
                showLanguage: !this.state.showLanguage,
                anchorLanguage: event.currentTarget
            });
            userLanguageChange((event.currentTarget.dataset || {}).lang);
        }

        const CustomMenu = () => {
            return (
                <React.Fragment>
                    

                    <ListItemButton component={Link} to="/" style={{ padding: "10px 15px" }}>
                        <ListItemIcon><HomeIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                        {!shrink && (<ListItemText primary="Koti" color="iconText" />)}
                    </ListItemButton>


                    {(shrink) ? (<ListItemButton component={Link} to="/raportti" style={{ padding: "10px 15px" }}><AutoAwesomeMosaicIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemButton>) :
                        <ListItemButton component={Link} to="/raportti" onClick={() => this.setState({ openAna: !this.state.openAna })} style={{ padding: "10px 15px" }}>
                            <ListItemIcon><AutoAwesomeMosaicIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                            {!shrink && (<ListItemText primary="Analyysit" color="iconText" />)}
                            {!shrink && (<React.Fragment>{openAna ? <ExpandLess color="iconText" /> : <ExpandMore color="iconText" />}</React.Fragment>)}
                        </ListItemButton>}


                    <Collapse in={openAna && !this.state.shrink} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemText primary="Raportti 1" color="iconText" />
                            </ListItemButton>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemText primary="Raportti 2" color="iconText" />
                            </ListItemButton>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemText primary="Raportti 3" color="iconText" />
                            </ListItemButton>
                        </List>
                    </Collapse>



                    {(shrink) ? (<ListItemButton component={Link} to="/profiilit" style={{ padding: "10px 15px" }}><SettingsIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemButton>) :
                            <ListItemButton onClick={() => this.setState({ openSet: !this.state.openSet })} style={{ padding: "10px 15px" }}>
                                <ListItemIcon><SettingsIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                                {!shrink && (<ListItemText primary="Asetukset" color="iconText" />)}
                                {!shrink && (<React.Fragment>{openSet ? <ExpandLess color="iconText" /> : <ExpandMore color="iconText" />}</React.Fragment>)}
                            </ListItemButton>}

                    <Collapse in={openSet && !this.state.shrink} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <FeatureTrim features={features} feature="UiProfiili">
                                <ListItemButton sx={{ pl: 4 }} component={Link} to="/profiilit">
                                    <ListItemIcon><GroupIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                                    <ListItemText primary="Profiilit" color="iconText" />
                                </ListItemButton>
                            </FeatureTrim>
                            <FeatureTrim features={features} feature="UiRooli">
                                <ListItemButton sx={{ pl: 4 }} component={Link} to="/roolit">
                                    <ListItemIcon><ManageAccountsIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                                    <ListItemText primary="Roolit" color="iconText" />
                                </ListItemButton>
                            </FeatureTrim>
                            <FeatureTrim features={features} feature="UiRoolit">
                                <ListItemButton sx={{ pl: 4 }} component={Link} to="/profiiliroolit">
                                    <ListItemIcon><GroupsIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                                    <ListItemText primary="Profiiliroolit" color="iconText" />
                                </ListItemButton>
                            </FeatureTrim>
                            <FeatureTrim features={features} feature="UiRooliOikeudet">
                                <ListItemButton sx={{ pl: 4 }} component={Link} to="/roolioikeudet">
                                    <ListItemIcon><MiscellaneousServicesIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                                    <ListItemText primary="Roolioikeudet" color="iconText" />
                                </ListItemButton>
                            </FeatureTrim>
                            <FeatureTrim features={features} feature="UiTila">
                                <ListItemButton sx={{ pl: 4 }} component={Link} to="/tila">
                                    <ListItemIcon><CalendarViewWeekIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                                    <ListItemText primary="Tila" color="iconText" />
                                </ListItemButton>
                                </FeatureTrim>
                            <FeatureTrim features={features} feature="UiToiminnot">
                                <ListItemButton sx={{ pl: 4 }} component={Link} to="/toiminnot">
                                    <ListItemIcon><BuildIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                                    <ListItemText primary="Toiminnot" color="iconText" />
                                </ListItemButton>
                            </FeatureTrim>
                            <FeatureTrim features={features} feature="UiPalvelupaketti">
                                <ListItemButton sx={{ pl: 4 }} component={Link} to="/palvelupaketti">
                                    <ListItemIcon><InventoryIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                                    <ListItemText primary="Palvelupaketti" color="iconText" />
                                </ListItemButton>
                            </FeatureTrim>
                            <FeatureTrim features={features} feature="UiMarketplace">
                                <ListItemButton sx={{ pl: 4 }} component={Link} to="/marketplace">
                                    <ListItemIcon><StorefrontIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                                    <ListItemText primary="Marketplace" color="iconText" />
                                </ListItemButton>
                            </FeatureTrim>
                        </List>
                    </Collapse>

                    {(shrink) ? (<ListItemButton component={Link} to="/kayttajatili" style={{ padding: "10px 15px" }}><AccountCircleIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemButton>) :
                            <ListItemButton onClick={() => this.setState({ openPro: !this.state.openPro })} style={{ padding: "10px 15px" }}>
                                <ListItemIcon><AccountCircleIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                                {!shrink && (<ListItemText primary="KäyttäjäProfiili" color="iconText" />)}
                                {!shrink && (<React.Fragment>{openPro ? <ExpandLess color="iconText" /> : <ExpandMore color="iconText" />}</React.Fragment>)}
                            </ListItemButton>}

                    <Collapse in={openPro && !this.state.shrink} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <KayttajaProfiili />
                            <Laskutus />
                            <Support />
                        </List>
                    </Collapse>

                    <ListItemButton style={{ padding: "10px 15px" }}>
                        <ListItemIcon><MenuBookIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                        {!shrink && (<ListItemText primary="Ohjeet" color="iconText" />)}
                    </ListItemButton>


                    <ListItemButton onClick={() => this.setState({ openLang: !this.state.openLang })} style={{ padding: "10px 15px" }}>
                        <ListItemIcon><FlagIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                        {!shrink && (<ListItemText primary="Kieli" color="iconText" />)}
                        {!shrink && (<React.Fragment>{openLang ? <ExpandLess color="iconText" /> : <ExpandMore color="iconText" />}</React.Fragment>)}
                    </ListItemButton>
                    <Collapse in={openLang && !this.state.shrink} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {
                                Object.entries(languageOptions).map(([id, name]) => (
                                    <ListItemButton sx={{ pl: 4 }} key={id} data-lang={id} onClick={handleLanguageChange}>
                                        <ListItemIcon><FlagIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></ListItemIcon>
                                        <ListItemText primary={name} color="iconText" />
                                    </ListItemButton>
                                ))
                            }
                        </List>
                    </Collapse>
                </React.Fragment>
            );
        }

        return (
            <div style={{ height: "100%" }}>
                <Box style={{ width: this.state.width, transition: 'width 0.15s', background: "#fff", height: "100%", padding: "15px 0px" }} sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                    <MenuList style={{ minWidth: "100%" }}>
                        <div>{(shrink) ? (<img src={"/images/logo/gesli-icon-transparent-background.svg"} width="70px" height="120px" />) : (<img src={"/images/logo/gesli-logo-horizontal-transparent-background.svg"} width="200px" height="120px" />)}</div>
                        <MenuItem onClick={this.handle}>
                            {(this.state.shrink === false) ? <CloseIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /> : <DehazeIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} />}
                        </MenuItem>

                        <CustomMenu />

                    </MenuList>
                </Box>
                <AppBar sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                    <Accordion style={{ width: "100%" }}>
                        <AccordionSummary onClick={this.handle} expandIcon={(this.state.shrink === false) ? <CloseIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /> : <DehazeIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} />} aria-controls="panel1a-content" id="panel1a-header">
                            <img src={"/images/logo/gesli-logo-horizontal-transparent-background.svg"} width="150px" height="100%" />
                        </AccordionSummary>
                        <AccordionDetails>
                            <CustomMenu />
                        </AccordionDetails>
                    </Accordion>
                </AppBar>
            </div>
        );
    }
}