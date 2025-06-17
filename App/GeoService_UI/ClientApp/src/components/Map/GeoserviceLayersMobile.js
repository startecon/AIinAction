import React from 'react';
import { authFetch, authPost } from "./../../authProvider";
import {
    Button, ButtonGroup, Fab, TextField, Paper, MenuList, RadioGroup,
    Radio, FormControlLabel, Typography, AccordionDetails, Slider, ListItemIcon,
    AccordionSummary, Accordion, IconButton, Grid, Input, Box, FormControl,
    InputLabel, Select, MenuItem, Autocomplete, Collapse, Checkbox, Switch,
    ListItemButton, Divider, List, ListItem, ListItemText, ListItemAvatar, Avatar, Dialog
} from '@mui/material';
import { GeoserviceControl } from ".";
import { LanguageContext } from './../LanguageContext';
import ErrorDialog from './../ErrorDialog'
import CloseIcon from '@mui/icons-material/Close';


export const GeoserviceLayersMobile = ({ position, instance, onDraw, onClick, open }) => {
    const [collapsed, setCollapsed] = React.useState(true);

    const { dictionary } = React.useContext(LanguageContext);

    React.useEffect(() => { setCollapsed(!open) }, [open]);

    /* Event Handlers */
    const handleError = (error) => {
        var title = '', body = ''
        if (error == 4) {
            title = dictionary.ErrorDialog.Error4.title;
            body = dictionary.ErrorDialog.Error4.body;
        } else if (error == 5) {
            title = dictionary.ErrorDialog.Error5.title;
            body = dictionary.ErrorDialog.Error5.body;
        } else {
            title = dictionary.ErrorDialog.Error.title;
            body = dictionary.ErrorDialog.Error.body;
        }
        this.setState({
            errorShow: true,
            errorTitle: title,
            errorBody: body
        })
    }

    const handleErrorClose = () => this.setState({ errorShow: false });

    const handleOpen = () => {
        setCollapsed(!collapsed);
        onClick(collapsed);
    }

    return (
        <GeoserviceControl position={position} style={{ border: 0 }}>


            {/*<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>*/}
            {/*    <MenuItem style={{ flexDirection: "column" }} onClick={() => handleOpenDia()}>*/}
            {/*        <LayersIcon style={{ fontSize: "25pt" }} />*/}
            {/*        <p style={{ margin: 0, fontSize: "11pt" }}>Karttapohja</p>*/}
            {/*    </MenuItem>*/}
            {/*</Box>*/}

            <Dialog
                sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
                open={open}
                onClose={handleOpen}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                style={{ justifyContent: "center" }}
                maxWidth="md"
            >
                {!collapsed && (
                    <div style={{ background: "white", height: "100vh", width: "100vw", padding: 0 }}>
                        <div style={{ textAlign: "center" }}>
                            <IconButton onClick={handleOpen}><CloseIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></IconButton>
                            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                                <ListItem
                                    secondaryAction={
                                        <Switch
                                            edge="end"
                                        />
                                    }
                                    disablePadding
                                >
                                    <ListItemButton>
                                        <ListItemAvatar>
                                            <Avatar alt="Remy Sharp" src="/images/cards/card04.jpg" />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary="Brunch this weekend?"
                                            secondary={
                                                <React.Fragment>
                                                    <Typography
                                                        sx={{ display: 'inline' }}
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                    >
                                                        Ali Connors
                                                    </Typography>
                                                    <span style={{ color: "#999" }}><i>{" — I'll be in your neighborhood doing errands this…"}</i></span>
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem
                                    secondaryAction={
                                        <Switch
                                            edge="end"
                                        />

                                    }
                                    disablePadding
                                >
                                    <ListItemButton>
                                        <ListItemAvatar>
                                            <Avatar alt="Travis Howard" src="/images/cards/card05.jpg" />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary="Summer BBQ"
                                            secondary={
                                                <React.Fragment>
                                                    <Typography
                                                        sx={{ display: 'inline' }}
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                    >
                                                        to Scott, Alex, Jennifer
                                                    </Typography>
                                                    <span style={{ color: "#999" }}><i>{" — Wish I could come, but I'm out of town this…"}</i></span>
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem
                                    secondaryAction={
                                        <Switch
                                            edge="end"
                                        />
                                    }
                                    disablePadding
                                >
                                    <ListItemButton>
                                        <ListItemAvatar>
                                            <Avatar alt="Cindy Baker" src="/images/cards/card06.jpg" />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary="Oui Oui"
                                            secondary={
                                                <React.Fragment>
                                                    <Typography
                                                        sx={{ display: 'inline' }}
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                    >
                                                        Sandra Adams
                                                    </Typography>
                                                    <span style={{ color: "#999" }}><i>{' — Do you have Paris recommendations? Have you ever…'}</i></span>
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </div>
                    </div>
                )}
            </Dialog>
        </GeoserviceControl>
    );
};
