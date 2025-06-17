import React from 'react';
import { useMsal } from "@azure/msal-react";
import { useMapEvents } from 'react-leaflet/hooks';
import { authFetch, authPost } from "./../../authProvider";
import {
    Button, ButtonGroup, Fab, TextField, Paper, MenuList, ListItemText, RadioGroup,
    Radio, FormControlLabel, Typography, AccordionDetails, Slider, ListItemIcon,
    AccordionSummary, Accordion, IconButton, Grid, Input, Box, FormControl,
    InputLabel, Select, MenuItem, Autocomplete, Collapse, ListItemButton, List, Dialog
} from '@mui/material';
import { GeoserviceControl } from ".";
import { LanguageContext } from './../LanguageContext';
import ErrorDialog from './../ErrorDialog'

import DirectionsWalk from '@mui/icons-material/DirectionsWalk';
import DriveEtan from '@mui/icons-material/DriveEta';
import Train from '@mui/icons-material/Train';
import DirectionsBike from '@mui/icons-material/DirectionsBike';
import RoomIcon from '@mui/icons-material/Room';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import TuneIcon from '@mui/icons-material/Tune';
import ExploreIcon from '@mui/icons-material/Explore';
import LayersIcon from '@mui/icons-material/Layers';
import HelpIcon from '@mui/icons-material/Help';
import PaymentIcon from '@mui/icons-material/Payment';
import Person2Icon from '@mui/icons-material/Person2';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import GroupIcon from '@mui/icons-material/Group';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import BarChartIcon from '@mui/icons-material/BarChart';
import ConstructionIcon from '@mui/icons-material/Construction';
import PieChartIcon from '@mui/icons-material/PieChart';
import EngineeringIcon from '@mui/icons-material/Engineering';
import BusinessIcon from '@mui/icons-material/Business';
import ApartmentIcon from '@mui/icons-material/Apartment';
import TagFacesIcon from '@mui/icons-material/TagFaces';
import DifferenceIcon from '@mui/icons-material/Difference';
import StoreMallDirectoryIcon from '@mui/icons-material/StoreMallDirectory';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import LanguageIcon from '@mui/icons-material/Language';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import DehazeIcon from '@mui/icons-material/Dehaze';
import SettingsIcon from '@mui/icons-material/Settings';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PublicIcon from '@mui/icons-material/Public';


const API_ROUTE_PREFIX = 'api/Routing/Route';
const API_ISOCHRONE_PREFIX = 'api/Routing/Isochrone';
const API_GEOCODE_PREFIX = 'api/Geocoding';

export const GeoserviceRoutingMobile = ({ position, mapInstance, onDraw, onClick, open }) => {
    const { instance } = useMsal();
    const [collapsed, setCollapsed] = React.useState(!open);
    const [costing, setCosting] = React.useState("pedestrian");
    const [startAddress, setStartAddress] = React.useState(null);
    const [startPosition, setStartPosition] = React.useState(null);
    const [endAddress, setEndAddress] = React.useState(null);
    const [endPosition, setEndPosition] = React.useState(null);
    const [centerPosition, setCenterPosition] = React.useState({ lat: 60.357423, lng: 25.073315 });
    const [routing, setRouting] = React.useState(false);
    const [showTrip, setShowTrip] = React.useState(true);
    const [aika, setAika] = React.useState(5);
    const [carbon, setCarbon] = React.useState(1);
    const [fuel, setFuel] = React.useState(5.738);
    const [autocomplete, setAutocomplete] = React.useState([]);
    const [isochrone, setIsochrone] = React.useState(null);
    const [trip, setTrip] = React.useState(null);
    const [tripData, setTripData] = React.useState(null);
    const [openDia, setOpenDia] = React.useState(false);

    const { dictionary } = React.useContext(LanguageContext);

    React.useEffect(() => { setCollapsed(!open) }, [open]);
    React.useEffect(() => { handleRouting() }, [costing, endAddress, endPosition, startAddress, startPosition, aika, showTrip, fuel, carbon]);

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
                            if (!routing) {
                                setStartAddress(addr);
                                setStartPosition(latlng);
                            } else {
                                setEndAddress(addr);
                                setEndPosition(latlng);
                            }
                        }
                    }
                });
        },
        move: (e) => {
            // Get Center
            setCenterPosition(mapInstance.getCenter());
        }
    })

    React.useEffect(() => {
        onDraw({
            endPosition: endPosition,
            showTrip: showTrip,
            startPosition: startPosition,
            trip: trip,
            isochrone: isochrone,
            tripData: tripData
        });
    }, [trip, isochrone]);

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

    const handleErrorClose = () => this.setState({ errorShow: false });

    const togglePanel = (value) => (event, newExpanded) => {
        setRouting(false);
        setShowTrip(value);
    }

    const handleRouting = () => {
        if (showTrip && startPosition && endPosition) {
            handleTrip();
        }
        else if (!showTrip && startPosition) {
            handleIsochrone();
        }
        onDraw({
            endPosition: endPosition,
            startPosition: startPosition,
            showTrip: showTrip,
        });
    }

    const handleStartAddress = (feature) => {

        if (feature) {
            var geom = feature.geometry;
            var latlng = (((geom || {}).coordinates || []).length > 1 ? [geom.coordinates[1], geom.coordinates[0]] : null);
            var addr = (feature.properties || {}).label;

            if (addr) {
                setStartAddress(addr);
                setStartPosition(latlng);
            }
        }
    }

    const handleEndAddress = (feature) => {

        if (feature) {
            const geom = feature.geometry;
            const latlng = (((geom || {}).coordinates || []).length > 1 ? [geom.coordinates[1], geom.coordinates[0]] : null);
            const addr = (feature.properties || {}).label;

            if (addr) {
                setEndAddress(addr);
                setEndPosition(latlng);
            }
        }
    }

    const handleAika = (event) => {
        setAika(event.target.value === '' ? '' : parseInt(event.target.value));
    };

    const handleSliderAika = (event, value) => {
        setAika(parseInt(value));
    };

    const handleCo2 = (event) => {
        const carb = (event.target.value === '' ? '' : parseInt(event.target.value));
        const time = carb * (fuel || 0);

        setCarbon(carb);
        setAika(time);

    };

    const handleSliderCo2 = (event, value) => {
        const carb = (value === '' ? '' : parseInt(value));
        const time = carb * (fuel || 0);

        setCarbon(carb);
        setAika(time);
    };

    const handleFuel = (event) => {
        const fuel = parseFloat(event.target.value);

        setFuel(fuel);
        setAika((carbon || 0) * fuel);
    };

    const handleBlurAika = () => {
        if (aika < 0) {
            setAika(0);
        } else if (aika > 60) {
            setAika(60);
        }
    };

    const handleBlurCo2 = () => {
        if (carbon < 0) {
            setCarbon(0);
        } else if (carbon > 6) {
            setCarbon(6);
        }
    };

    const handleTrip = () => {

        // payload
        const query = {
            "locations": [
                { "lat": startPosition[0], "lon": startPosition[1] },
                { "lat": endPosition[0], "lon": endPosition[1] }
            ],
            "costing": costing
        };

        // get trip
        authPost(instance, API_ROUTE_PREFIX + '/Read', {
            method: "POST",
            body: JSON.stringify(query)
        })
            .then(response => response.json())
            .then(data => {
                try {
                    const geojson = parseTrip(JSON.parse(data.message).trip)

                    setIsochrone(null);
                    setTrip(geojson);
                    setTripData(JSON.parse(data.message).trip.summary);

                }
                catch (err) {
                    console.error("Invalid address");
                }
            });
    }

    const handleIsochrone = () => {

        var isoqry = {
            "locations": [
                { "lat": startPosition[0], "lon": startPosition[1] }
            ],
            "costing": costing,
            "polygons": true,
            "contours": [
                { "time": aika }
            ]
        };

        // get isochrone
        authPost(instance, API_ISOCHRONE_PREFIX + '/Read', {
            method: "POST",
            body: JSON.stringify(isoqry)
        })
            .then(response => response.json())
            .then(data => {
                try {
                    const geojson = JSON.parse(data.message);

                    setIsochrone(geojson);
                    setTrip(null);

                }
                catch (err) {
                    console.error("Invalid address");
                }
            });
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
        <GeoserviceControl position={position} style={{ border: 0 }}>

            <Dialog
                sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
                open={open}
                onClose={handleOpen}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                style={{ height: "100vh", justifyContent: "center" }}
                maxWidth="md"
            >
                {!collapsed && (
                    <div style={{ background: "white", height: "100vh", width: "100vw", padding: 0 }}>
                        <Grid container spacing={2} alignItems="center" justifyContent="flex-start">
                            <Grid item xs={8} style={{ textAlign: 'left' }}>
                                <Typography>Valitse sijainti ja kulkuneuvo</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <IconButton style={{ float: 'right' }} onClick={handleOpen}><CloseIcon fontSize="medium" color="iconText" style={{ fontSize: "25pt" }} /></IconButton>
                            </Grid>
                        </Grid>
                        <div style={{ textAlign: "center" }}>
                            <ButtonGroup variant="text" aria-label="text button group">
                                <IconButton onClick={() => setCosting("pedestrian")}>
                                    <DirectionsWalk color={(costing == "pedestrian") ? ("secondary") : ("iconText")} style={{ fontSize: "35px" }} />
                                </IconButton>
                                <IconButton onClick={() => setCosting("auto")}>
                                    <DriveEtan color={(costing == "auto") ? ("secondary") : ("iconText")} style={{ fontSize: "35px" }} />
                                </IconButton>
                                <IconButton onClick={() => setCosting("multimodal")}>
                                    <Train color={(costing == "multimodal") ? ("secondary") : ("iconText")} style={{ fontSize: "35px" }} />
                                </IconButton>
                                <IconButton onClick={() => setCosting("bicycle")}>
                                    <DirectionsBike color={(costing == "bicycle") ? ("secondary") : ("iconText")} style={{ fontSize: "35px" }} />
                                </IconButton>
                            </ButtonGroup>
                        </div>
                        <div style={{ padding: "0px 16px", }}>
                            <Typography>{dictionary.Routing.Label1}</Typography>
                            <div style={{ display: "flex" }}>
                                <Autocomplete
                                    onChange={(event, newValue) => { handleStartAddress(newValue) }}
                                    onInputChange={(event, value) => { handleAutoComplete(value) }}
                                    value={(startAddress || '')}
                                    options={autocomplete}
                                    getOptionLabel={(option) => {
                                        // Value selected with enter, right from the input
                                        if (typeof option === 'string') {
                                            return option;
                                        }
                                        // Add "xxx" option created dynamically
                                        if (option.inputValue) {
                                            return option.inputValue;
                                        }
                                        // Regular option
                                        return (((option || {}).properties || {}).label || '');
                                    }}
                                    style={{ width: "100%" }}
                                    renderInput={(params) => <TextField {...params} required={true} variant="standard" placeholder={dictionary.Routing.TextBoxLabel} />}
                                />
                                <IconButton onClick={() => setRouting(false)}><RoomIcon color={(!routing ? "secondary" : "iconText")} style={{ fontSize: "35px" }} /></IconButton>
                            </div>
                        </div>
                        <div style={{ padding: "0px 16px", }}>
                            <Typography>{dictionary.Routing.Label2}</Typography>
                            <div style={{ display: "flex" }}>
                                <Autocomplete
                                    onChange={(event, newValue) => { handleEndAddress(newValue) }}
                                    onInputChange={(event, value) => { handleAutoComplete(value) }}
                                    value={(endAddress || '')}
                                    options={autocomplete}
                                    getOptionLabel={(option) => {
                                        // Value selected with enter, right from the input
                                        if (typeof option === 'string') {
                                            return option;
                                        }
                                        // Add "xxx" option created dynamically
                                        if (option.inputValue) {
                                            return option.inputValue;
                                        }
                                        // Regular option
                                        return (((option || {}).properties || {}).label || '');
                                    }}
                                    style={{ width: "100%" }}
                                    renderInput={(params) => <TextField {...params} required={true} variant="standard" placeholder={dictionary.Routing.TextBoxLabel} />}
                                />
                                <IconButton onClick={() => setRouting(true)}><RoomIcon color={(routing ? "secondary" : "iconText")} style={{ fontSize: "35px" }} /></IconButton>
                            </div>
                        </div>
                        <div style={{ paddingBottom: "15px" }}>
                            <Accordion expanded={showTrip} onChange={togglePanel(true)} elevation={0} style={{ margin: "0px !important" }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header" style={{ margin: "0px !important" }}>
                                    <Typography style={{ margin: 0 }}>{dictionary.Routing.Label2}</Typography>
                                </AccordionSummary>
                                <AccordionDetails style={{ padding: "0px 16px", display: "flex" }}>
                                    <Autocomplete
                                        onChange={(event, newValue) => { handleEndAddress(newValue) }}
                                        onInputChange={(event, value) => { handleAutoComplete(value) }}
                                        value={(endAddress || '')}
                                        options={autocomplete}
                                        getOptionLabel={(option) => {
                                            // Value selected with enter, right from the input
                                            if (typeof option === 'string') {
                                                return option;
                                            }
                                            // Add "xxx" option created dynamically
                                            if (option.inputValue) {
                                                return option.inputValue;
                                            }
                                            // Regular option
                                            return (((option || {}).properties || {}).label || '');
                                        }}
                                        style={{ width: "100%" }}
                                        renderInput={(params) => <TextField {...params} required={true} variant="standard" placeholder={dictionary.Routing.TextBoxLabel} />}
                                    />
                                    <IconButton onClick={() => setRouting(true)}><RoomIcon color={(routing ? "secondary" : "iconText")} style={{ fontSize: "35px" }} /></IconButton>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion expanded={!showTrip} onChange={togglePanel(false)} elevation={0}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
                                    <Typography>{dictionary.Routing.Label3}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item lg={12}>
                                            <Typography id="input-slider-aika" gutterBottom>
                                                {dictionary.Routing.Label4}
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <ScheduleIcon />
                                        </Grid>
                                        <Grid item xs>
                                            <Slider
                                                value={typeof aika === 'number' ? aika : 0}
                                                step={1}
                                                min={0}
                                                max={60}
                                                onChangeCommitted={handleSliderAika}
                                                aria-labelledby="input-slider-aika"
                                                color="secondary"
                                            />
                                        </Grid>
                                        <Grid item>
                                            <Input
                                                margin="dense"
                                                value={aika}
                                                onChange={handleAika}
                                                onBlur={handleBlurAika}
                                                inputProps={{
                                                    step: 1,
                                                    min: 0,
                                                    max: 60,
                                                    type: 'number',
                                                    'aria-labelledby': 'input-slider-aika',
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                                {costing == "auto" ? (
                                    <React.Fragment>
                                        <AccordionDetails>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item lg={12}>
                                                    <Typography id="input-slider-co2" gutterBottom>
                                                        {dictionary.Routing.Label5[0]}<sub>{dictionary.Routing.Label5[1]}</sub>{dictionary.Routing.Label5[2]}
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <PublicIcon />
                                                </Grid>
                                                <Grid item xs>
                                                    <Slider
                                                        value={typeof carbon === 'number' ? carbon : 0}
                                                        step={1}
                                                        min={0}
                                                        max={6}
                                                        onChangeCommitted={handleSliderCo2}
                                                        aria-labelledby="input-slider-co2"
                                                        color="secondary"
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <Input
                                                        margin="dense"
                                                        value={carbon}
                                                        onChange={handleCo2}
                                                        onBlur={handleBlurCo2}
                                                        inputProps={{
                                                            step: 1,
                                                            min: 0,
                                                            max: 6,
                                                            type: 'number',
                                                            'aria-labelledby': 'input-slider-co2',
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </AccordionDetails>
                                        <AccordionDetails>
                                            <FormControl>
                                                <InputLabel id="fuel-select-label" style={{ color: "#7030a0" }}>{dictionary.Routing.FuelSelectLabel}</InputLabel>
                                                <Select
                                                    labelId="fuel-select-label"
                                                    id="fuel-select"
                                                    value={fuel}
                                                    label={dictionary.Routing.FuelSelectLabel}
                                                    onChange={handleFuel}
                                                >
                                                    <MenuItem value={5.738}>{dictionary.Routing.FuelOption1}</MenuItem>
                                                    <MenuItem value={6.356}>{dictionary.Routing.FuelOption2}</MenuItem>
                                                    <MenuItem value={8.934}>{dictionary.Routing.FuelOption3}</MenuItem>
                                                    <MenuItem value={60}>{dictionary.Routing.FuelOption4}</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </AccordionDetails>
                                    </React.Fragment>
                                ) : null}
                            </Accordion>
                        </div>
                    </div>
                )}
            </Dialog>
        </GeoserviceControl>
    );
};

/**
 * Decode Polyline
 * https://github.com/valhalla/demos/blob/gh-pages/polyline/decode.js
 * @param {any} encoded
 * @param {any} mul
 */
function decode(encoded, mul) {
    //precision
    var inv = 1.0 / mul;
    var decoded = [];
    var previous = [0, 0];
    var i = 0;
    //for each byte
    while (i < encoded.length) {
        //for each coord (lat, lon)
        var ll = [0, 0]
        for (var j = 0; j < 2; j++) {
            var shift = 0;
            var byte = 0x20;
            //keep decoding bytes until you have this coord
            while (byte >= 0x20) {
                byte = encoded.charCodeAt(i++) - 63;
                ll[j] |= (byte & 0x1f) << shift;
                shift += 5;
            }
            //add previous offset to get final value and remember for next one
            ll[j] = previous[j] + (ll[j] & 1 ? ~(ll[j] >> 1) : (ll[j] >> 1));
            previous[j] = ll[j];
        }
        //scale by precision and chop off long coords also flip the positions so
        //its the far more standard lon,lat instead of lat,lon
        decoded.push([ll[1] * inv, ll[0] * inv]);
    }
    //hand back the list of coordinates
    return decoded;
};

/**
 * Parse Trip: Start, End, Route
 * @param {any} trip
 * returns geojson
 */

function parseTrip(trip) {
    var color = Math.floor(Math.random() * 16777215 * .5);
    var color_scale = 1.5;
    var fc = { type: 'FeatureCollection', features: [] };

    trip.legs.forEach((leg) => {
        // the route
        const route_feature = {
            type: 'Feature',
            properties: {
                color: "#7030a0ff",
                opacity: 1,
                weight: 15
            },
            geometry: {
                type: 'LineString',
                coordinates: decode(leg.shape, 1e6)
            }
        };

        // the origin
        const origin_feature = {
            type: 'Feature',
            properties: {
                color: '#12bb00',
                radius: 1,
                fillOpacity: 1
            },
            geometry: {
                type: 'Point',
                coordinates: route_feature.geometry.coordinates[0]
            }
        }

        // the destination
        const destination_feature = {
            type: 'Feature',
            properties: {
                color: '#b32100',
                radius: 1,
                fillOpacity: 1
            },
            geometry: {
                type: 'Point',
                coordinates: route_feature.geometry.coordinates.slice(-1)[0]
            }
        };

        fc.features.push(origin_feature);
        fc.features.push(destination_feature);
        fc.features.push(route_feature);
    });

    return fc;
}