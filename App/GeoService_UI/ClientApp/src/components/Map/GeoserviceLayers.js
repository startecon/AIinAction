import React from 'react';
import { useMsal } from "@azure/msal-react";
import { useMap } from 'react-leaflet/hooks';
import L from 'leaflet';
import { authFetch, authPost } from "./../../authProvider";
import {
    Fab, Paper, Typography, Box, Switch, Checkbox, Divider,
    ListItemButton, List, ListItem, ListItemText, ListItemAvatar, Avatar, Dialog
} from '@mui/material';
import { GeoserviceControl } from ".";
import { LanguageContext } from './../LanguageContext';
import ErrorDialog from './../ErrorDialog'

import LayersIcon from '@mui/icons-material/Layers';


export const GeoserviceLayers = ({ position, onClick, open, data }) => {
    const { instance } = useMsal();
    const map = useMap();
    const [collapsed, setCollapsed] = React.useState(true);
    const [openDia, setOpenDia] = React.useState(false);
    const [basemap, setBasemap] = React.useState(0);
    const [overlays, setOverlays] = React.useState([]);

    const { dictionary } = React.useContext(LanguageContext);

    React.useEffect(() => {
        setCollapsed(!open);
    }, [open]);

    // Run only once
    React.useEffect(() => {
        if (!data) {
            data = {};
        }

        if (!data.basemaps) {
            data.basemaps = [
                L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    title: 'Openstreetmap',
                    subtitle: 'Basic graphics and labels',
                    link: 'https://www.openstreetmap.org',
                    icon: '/images/cards/card04.jpg',
                })
            ];
        }

        if (data.overlays) {
            setOverlays(data.overlays.map(() => false));
        }

        initializeBasemap();
    }, []);



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

    const handleOpenDia = () => {
        setOpenDia(true);
    };

    const handleCloseDia = () => {
        setOpenDia(false);
    };

    // Handle Basemap
    const initializeBasemap = () => {
        const layer = data.basemaps[0];
        layer.addTo(map);
    }

    const handleBasemap = (id) => () => {
        if (id != basemap && data.basemaps.length > id) {
            const layer = data.basemaps[id];
            layer.addTo(map);
            hideOtherBasemaps(layer);
            layer.bringToBack();
            setBasemap(id);
        }
    }

    const hideOtherBasemaps = (layer) => {
        Object.keys(layer._map._layers).forEach((l) => {
            if (layer._leaflet_id != l && layer._map._layers[l]._tiles) {
                map.removeLayer(layer._map._layers[l])
            }

        });
    }

    // Handle Overlay
    const handleOverlay = (id) => () => {
        if (data.overlays.length > id) {
            const layer = data.overlays[id];

            if (overlays[id]) {
                hideOverlay(layer);
            } else {
                layer.addTo(map);
                //layer.bringToFront();
            }

            let newArr = overlays.slice();
            newArr[id] = !newArr[id];
            setOverlays(newArr);
        }
    }

    const hideOverlay = (layer) => {
        Object.keys(layer._map._layers).forEach((l) => {
            if (layer._leaflet_id == l) {
                map.removeLayer(layer._map._layers[l])
            }
        });
    }

    return (
        <GeoserviceControl position={position} style={{ border: 0 }} prepend={true}>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                <Fab style={{ color: (collapsed ? "#fff" : "#F48B0A"), backgroundColor: (!collapsed ? "#fff" : "#F48B0A") }} onClick={() => handleOpen()}>
                    <LayersIcon />
                </Fab>
            </Box>

            <Box sx={{ flexGrow: 1 }} >
                {!collapsed && (
                    <div style={{ position: "fixed", top: 10, right: 80 }}>
                        <Paper elevation={6}>
                            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                                {/*Overlays*/}
                                {data.overlays.map((d, i) => {
                                    return (
                                        <ListItem
                                            key={i + 1000}
                                            secondaryAction={
                                                <Switch
                                                    edge="end"
                                                    checked={overlays[i]}
                                                    onChange={handleOverlay(i)}
                                                />
                                            }
                                            disablePadding
                                        >
                                            <ListItemButton>
                                                <ListItemAvatar>
                                                    <Avatar alt={"Map " + i} src={d.options.icon} />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={d.options.title}
                                                    secondary={
                                                        <React.Fragment>
                                                            <Typography
                                                                sx={{ display: 'inline' }}
                                                                component="span"
                                                                variant="body2"
                                                                color="text.primary"
                                                            >
                                                                {d.options.subtitle}
                                                            </Typography>
                                                            <span><i><a style={{ color: "#999" }} href={d.options.link} target="_blank">{d.options.link}</a></i></span>
                                                        </React.Fragment>
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    );
                                })}
                                <Divider/>
                                {/*Basemaps*/}
                                {data.basemaps.map((d, i) => {
                                    return (
                                        <ListItem
                                            key={i}
                                            secondaryAction={
                                                <Switch
                                                    edge="end"
                                                    checked={basemap == i}
                                                    onChange={handleBasemap(i)}
                                                />
                                            }
                                            disablePadding
                                        >
                                            <ListItemButton>
                                                <ListItemAvatar>
                                                    <Avatar alt={"Map " + i} src={d.options.icon} />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={d.options.title}
                                                    secondary={
                                                        <React.Fragment>
                                                            <Typography
                                                                sx={{ display: 'inline' }}
                                                                component="span"
                                                                variant="body2"
                                                                color="text.primary"
                                                            >
                                                                {d.options.subtitle}
                                                            </Typography>
                                                            <span><i><a style={{ color: "#999" }} href={d.options.link} target="_blank">{d.options.link}</a></i></span>
                                                        </React.Fragment>
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Paper>
                    </div>
                )}
            </Box>

        </GeoserviceControl>
    );
};
