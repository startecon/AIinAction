import React from 'react';
import { useMsal } from "@azure/msal-react";
import { useMapEvents } from 'react-leaflet/hooks';
import { authFetch, authPost } from "./../../authProvider";
import {
    Divider, InputBase, Fab, Paper, IconButton, Box, Dialog
} from '@mui/material';
import { GeoserviceControl } from ".";
import { LanguageContext } from './../LanguageContext';
import ErrorDialog from './../ErrorDialog'

import DirectionsIcon from '@mui/icons-material/Directions';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';

const API_GEOCODE_PREFIX = 'api/Geocoding';

export const GeoserviceSearch = ({ position, mapInstance, onClick, open }) => {
    const { instance } = useMsal();
    const [collapsed, setCollapsed] = React.useState(!open);
    const [centerPosition, setCenterPosition] = React.useState({ lat: 60.357423, lng: 25.073315 });
    const [startAddress, setStartAddress] = React.useState(null);
    const [startPosition, setStartPosition] = React.useState(null);
    const [autocomplete, setAutocomplete] = React.useState([]);
    const [openDia, setOpenDia] = React.useState(false);

    const { dictionary } = React.useContext(LanguageContext);

    React.useEffect(() => { setCollapsed(!open) }, [open]);

    const map = useMapEvents({
        click: (e) => {
            // Get Address
            authFetch(instance, API_GEOCODE_PREFIX + '/Address/' + e.latlng.lat + '/' + e.latlng.lng)
                .then(response => response.json())
                .then(data => {
                    if (data.error == false) {
                        const geojson = JSON.parse(data.message);
                        const feature = ((geojson || {}).features || [])[0];
                        const geom = (feature || {}).geometry;
                        const latlng = (((geom || {}).coordinates || []).length > 1 ? [geom.coordinates[1], geom.coordinates[0]] : e.latlng);
                        const addr = ((feature || {}).properties || {}).label;

                        if (addr) {
                            setStartAddress(addr);
                            setStartPosition(latlng);
                        }
                    }
                });
        },
        move: (e) => {
            // Get Center
            if (mapInstance) setCenterPosition(mapInstance.getCenter());
        }
    })

    const handleOpenDia = () => {
        setOpenDia(true);
    };

    const handleCloseDia = () => {
        setOpenDia(false);
    };

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

    const handleAutoComplete = (teksti) => {
        teksti = teksti.toString()
            .replace(/[ÅÄ]/g, "A")
            .replace(/[åä]/g, "a")
            .replace(/[Ö]/g, "O")
            .replace(/[ö]/g, "o");

        if (teksti.length > 0) {
            const c = centerPosition;
            authFetch(instance, API_GEOCODE_PREFIX + '/Autocomplete/' + teksti + (c ? ("/" + c.lat + "/" + c.lng) : ""))
                .then(response => response.json())
                .then(data => {

                    if (data.error == false) {
                        var geojson = JSON.parse(data.message);
                        var val = (geojson || {}).features || [];

                        setAutocomplete(val);
                    }
                });
        }
    }

    const handleOpen = () => {
        setCollapsed(!collapsed);
        onClick(collapsed);
    }

    return (
        <GeoserviceControl position={position} style={{ border: 0 }} prepend={true}>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                <Fab style={{ color: (collapsed ? "#fff" : "#F48B0A"), backgroundColor: (!collapsed ? "#fff" : "#F48B0A") }} onClick={() => handleOpen()}>
                    <SearchIcon />
                </Fab>
            </Box>

            <Box sx={{ flexGrow: 1 }} >
                {!collapsed && (
                    <div style={{ position: "fixed", top: 10, right: 80 }}>
                        <Paper elevation={6}>
                            <div style={{ background: "white", width: 300, height: "100%", padding: 0 }}>
                                <InputBase
                                    sx={{ ml: 1, flex: 1, width: 240 }}
                                    placeholder="Kirjoita osoite"
                                    inputProps={{ 'aria-label': 'hae paikkaa' }}
                                />
                                <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                                    <SearchIcon />
                                </IconButton>
                            </div>
                        </Paper>
                    </div>
                )}
            </Box>



        </GeoserviceControl>
    );
};