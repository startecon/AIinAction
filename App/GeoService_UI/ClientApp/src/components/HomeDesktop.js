import React from 'react';
import {
    MapContainer,
    GeoJSON,
    Marker,
    Tooltip,
    ScaleControl,
} from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
//import 'leaflet-rotate/dist/leaflet-rotate';
import { Button, ButtonGroup, Fab, TextField, Paper, MenuList, AppBar, ListItemText, RadioGroup, Radio, FormControlLabel, Typography, AccordionDetails, Slider, ListItemIcon, AccordionSummary, Accordion, IconButton, Grid, Input, Box, FormControl, InputLabel, Select, MenuItem, Autocomplete, Collapse, ListItemButton, List } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PublicIcon from '@mui/icons-material/Public';
import cloneDeep from 'lodash.clonedeep';
import { authFetch, authPost } from "./../authProvider";
import { LanguageContext } from './LanguageContext';
import ErrorDialog from './ErrorDialog'
import DirectionsWalk from '@mui/icons-material/DirectionsWalk';
import DriveEtan from '@mui/icons-material/DriveEta';
import Train from '@mui/icons-material/Train';
import DirectionsBike from '@mui/icons-material/DirectionsBike';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import LayersIcon from '@mui/icons-material/Layers';
import GlobalMenu from "./GlobalMenu"

import cities from "./Geojson/cities.json";
import countries from "./Geojson/countries.json";
import centers from "./Geojson/centerpoints.json";

import { GeoserviceZoomIn, GeoserviceZoomOut, GeoserviceRotate, GeoserviceLayers, GeoserviceRouting, GeoserviceSearch } from "./Map";

/* Perusmuuttujat ja vakiot */
const PROFIILI_GET = 'api/Profiili/Read';
const PROFIILI_PUT = 'api/Profiili/Update';

const orangeIcon = L.icon({
    iconUrl: "/images/marker/marker-icon-orange.png",
    iconAnchor: [13, 40],
    popupAnchor: [-3, -76],
    shadowUrl: "/images/marker/marker-shadow.png",
    shadowSize: [51, 75],
    shadowAnchor: [17, 73]
});

const redIcon = L.icon({
    iconUrl: "/images/marker/marker-icon-red.png",
    iconAnchor: [13, 40],
    popupAnchor: [-3, -76],
    shadowUrl: "/images/marker/marker-shadow.png",
    shadowSize: [51, 75],
    shadowAnchor: [17, 73],
    className: "testi1"
});

// Testi karta ja alueet
const basemaps = [
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>",
        subdomains: "abcd",
        maxZoom: 20,
        title: "VOYAGER",
        subtitle: "Basic graphics and labels",
        link: "https://www.openstreetmap.org",
        icon: '/images/cards/card04.jpg',
    }),
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>",
        subdomains: "abcd",
        maxZoom: 20,
        title: "POSITRON",
        subtitle: "Basic graphics and labels",
        link: "https://www.openstreetmap.org",
        icon: '/images/cards/card04.jpg',
    }),
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>",
        subdomains: "abcd",
        maxZoom: 20,
        title: "DARK MATTER",
        subtitle: "Basic graphics and labels",
        link: "https://www.openstreetmap.org",
        icon: '/images/cards/card04.jpg',
    }),
    L.tileLayer("https://stamen-tiles.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.jpg", {
        attribution: "Map tiles by <a href='http://stamen.com'>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://www.openstreetmap.org/copyright'>ODbL</a>",
        maxZoom: 18,
        title: "STAMEN TERRAIN",
        subtitle: "Basic graphics and labels",
        link: "https://www.openstreetmap.org",
        icon: '/images/cards/card04.jpg',
    }),
    L.tileLayer("https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png", {
        attribution: "Map <a href='https://memomaps.de/'>memomaps.de</a> <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, map data &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
        maxZoom: 18,
        title: "OPNVKARTE",
        subtitle: "Basic graphics and labels",
        link: "https://www.openstreetmap.org",
        icon: '/images/cards/card04.jpg',
    }),
];

const crownHill = L.marker([61, 24]).bindPopup('This is Crown Hill Park.'), rubyHill = L.marker([62, 25]).bindPopup('This is Ruby Hill Park.');

const overlays = [
    L.layerGroup([crownHill, rubyHill], {
        title: 'PARKS',
        subtitle: 'Main parks',
        link: 'https://www.openstreetmap.org',
        icon: '/images/cards/card05.jpg',
    }),
    L.geoJSON(countries, {
        style: function (feature) {
            return { color: "#7030a0", opacity: 0.5, fillOpacity: 0 };
        },
        title: 'COUNTRIES',
        subtitle: 'Country boarders',
        link: 'https://www.openstreetmap.org',
        icon: '/images/cards/card06.jpg',
    }).bindPopup(function (layer) {
        return layer.feature.properties.Country;
    }),
    L.geoJSON(centers, {
        onEachFeature: (country, layer) => {
            layer.setOpacity(0);
            layer.bindTooltip(country.properties.Country, {
                permanent: true,
                direction: 'center',
                className: 'countryLabel',
                offset: [0, 35]
            });
        },
        style: function (feature) {
            return { color: "#7030a0", opacity: 0.5, fillOpacity: 0 };
        },
        title: 'COUNTRYNAMES',
        subtitle: 'Countrynames',
        link: 'https://www.openstreetmap.org',
        icon: '/images/cards/card07.jpg',
    }),
    L.geoJSON(cities, {
        onEachFeature: (city, layer) => {
            layer.setOpacity(0);
            layer.bindTooltip(city.properties.City, {
                permanent: true,
                direction: 'center',
                className: 'cityLabel',
                offset: [0, 25]
            });
        },
        style: function (feature) {
            return { color: "#7030a0", opacity: 0, fillOpacity: 0 };
        },
        title: 'CITIES',
        subtitle: 'Capital cities',
        link: 'https://www.openstreetmap.org',
        icon: '/images/cards/card06.jpg',
    })
];



export class HomeDesktop extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        this.state = {
            position: [60.357423, 25.073315],
            routing: true,
            startPosition: null,
            startAddress: null,
            endPosition: null,
            endAddress: null,
            trip: null,
            isochrone: null,
            costing: "pedestrian",
            zoom: 6,
            maxZoom: 20,
            openLayers: false,
            openRouting: false,
            openSearch: false,
            showTrip: true,
            errorShow: false,
            errorTitle: '',
            errorBody: '',
            mapInstance: null,
            widthStyle: "calc(100vw - 65px)",
        };
    }

    /* Event Handlers */

    handleError = (error) => {
        var title = '', body = ''
        if (error == 4) {
            title = this.context.dictionary.ErrorDialog.Error4.title;
            body = this.context.dictionary.ErrorDialog.Error4.body;
        } else if (error == 5) {
            title = this.context.dictionary.ErrorDialog.Error5.title;
            body = this.context.dictionary.ErrorDialog.Error5.body;
        } else {
            title = this.context.dictionary.ErrorDialog.Error.title;
            body = this.context.dictionary.ErrorDialog.Error.body;
        }
        this.setState({
            errorShow: true,
            errorTitle: title,
            errorBody: body
        })
    }

    handleErrorClose = () => this.setState({ errorShow: false });

    handleMapCreated = (e) => {
        this.setState({ mapInstance: e.target });
    }

    handleMenu = (e, value) => {
        console.log(value);
        this.setState({ menu: value })
    }

    handleLayers = () => {
        this.setState({ openLayers: true });
    }

    handleRouting = () => {
        this.setState({ openRouting: true });
    }

    handleRoutingDraw = (props) => {
        this.setState({
            endPosition: props?.endPosition,
            showTrip: props?.showTrip,
            startPosition: props?.startPosition,
            trip: props?.trip,
            isochrone: props?.isochrone,
            tripData: props?.tripData
        });
    }

    onExpand = (value) => {
        if (value) {
            this.setState({ widthStyle: "calc(100vw - 300px)" });
        } else {
            this.setState({ widthStyle: "calc(100vw - 65px)" });
        }
    }

    render() {
        const { userLanguage, dictionary } = this.context;
        const { position, errorShow, errorTitle, errorBody, costing } = this.state;

        const TripGeoJSON = () => {
            return (
                <div>{this.state.trip ? (<GeoJSON data={this.state.trip} style={(f) => { return { color: (f.properties.color || "#f00"), opacity: (f.properties.opacity || 1), radius: (f.properties.radius || 15), fillOpacity: (f.properties.fillOpacity || 1) } }}> <CustomToolTip /></GeoJSON>) : null}</div>
            )
        }

        const IsoGeoJSON = () => {
            return (
                <div>{this.state.isochrone ? (<GeoJSON data={this.state.isochrone} style={{ color: '#ff0000', fillColor: "#ff0000", fillOpacity: 0.2 }}><CustomToolTip /></GeoJSON>) : null}</div>
            )
        }

        const CustomToolTip = () => {
            var text = null;
            var icon = null;

            if (costing == "pedestrian") {
                text = dictionary.Routing.Tooltip.Labels[0]
                icon = <DirectionsWalk style={{ fontSize: "100pt" }} />
            }
            else if (costing == "auto") {
                text = dictionary.Routing.Tooltip.Labels[1]
                icon = <DriveEtan style={{ fontSize: "100pt" }} />
            }
            else if (costing == "bicycle") {
                text = dictionary.Routing.Tooltip.Labels[3]
                icon = <DirectionsBike style={{ fontSize: "100pt" }} />
            }
            else if (costing == "multimodal") {
                text = dictionary.Routing.Tooltip.Labels[2]
                icon = <Train style={{ fontSize: "100pt" }} />
            }
            return (
                <div>{(this.state.tripData && this.state.showTrip) ? (
                    <Tooltip>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item lg={5}>
                                {icon}
                            </Grid>
                            <Grid item lg={7} style={{ width: 350 }}>
                                <h2 style={{ fontSize: "20pt" }}>{dictionary.Routing.Tooltip.Title[0]} <br /> {dictionary.Routing.Tooltip.Title[1]} <br /> {text}</h2>
                            </Grid>
                        </Grid>
                        <div style={{ paddingLeft: "10px" }}>
                            <div>
                                <div style={{ display: "flex", paddingBottom: "4px" }}>
                                    <p style={{ fontSize: "18px", margin: "0px" }}>{dictionary.Routing.Tooltip.Text1}</p> <h3 style={{ margin: "0px 3px", fontSize: "18px" }}>{this.state.startAddress}</h3>
                                </div>
                                <div style={{ display: "flex" }}>
                                    <p style={{ fontSize: "18px", margin: "0px" }}>{dictionary.Routing.Tooltip.Text2}</p> <h3 style={{ margin: "0px 3px", fontSize: "18px" }}>{this.state.endAddress}</h3>
                                </div>
                            </div>
                            <Grid container spacing={2} alignItems="center" justifyContent="flex-start">
                                <Grid item lg={6} style={{ display: "flex" }}>
                                    <h2 style={{ fontSize: "45pt", margin: "0px 0px" }}>{parseFloat(this.state.tripData.length).toFixed(1).replace(".", ",")}</h2>
                                    <p style={{ marginTop: "45px", marginLeft: "6px", fontSize: "11pt" }}>{dictionary.Routing.Tooltip.Text3[0]}</p>
                                </Grid>
                                <Grid item lg={6} style={{ display: "flex" }}>
                                    <h4 style={{ fontSize: "45pt", margin: "0px 0px" }}>{parseFloat(this.state.tripData.time / 60).toFixed(0).replace(".", ",")}</h4>
                                    <p style={{ marginTop: "45px", marginLeft: "6px", fontSize: "11pt" }}>{dictionary.Routing.Tooltip.Text3[1]}</p>
                                </Grid>
                            </Grid>
                        </div>
                    </Tooltip>) : (<div />)}
                </div>
            )
        }

        return (
            <div style={{ display: "flex", height: "100vh", /*width: this.state.widthStyle*/ }}>
                {/*<GlobalMenu selected={this.props.selected} onExpand={this.onExpand} pca={this.props.pca} />*/}
                <MapContainer
                    zoomControl={false}
                    center={position}
                    zoom={this.state.zoom}
                    maxZoom={this.state.maxZoom}
                    rotate={true}
                    rotateControl={{ closeOnZeroBearing: false }}
                    whenReady={this.handleMapCreated}
                    bearing={0}
                    style={{ minHeight: "100vh", minWidth: "100%" }}
                >
                    <GeoserviceZoomOut position="topright" />
                    <GeoserviceZoomIn position="topright" />
                    <GeoserviceRotate position="topright" />
                    <GeoserviceRouting
                        position="topright"
                        mapInstance={this.state.mapInstance}
                        onDraw={this.handleRoutingDraw}
                        onClick={(v) => this.setState({ openRouting: v, openLayers: false, openSearch: false })}
                        open={this.state.openRouting}
                    />
                    <GeoserviceLayers
                        position="topright"
                        onClick={(v) => this.setState({ openLayers: v, openRouting: false, openSearch: false })}
                        open={this.state.openLayers}
                        data={{ basemaps: basemaps, overlays: overlays }}
                    />
                    <GeoserviceSearch
                        position="topright"
                        mapInstance={this.state.mapInstance}
                        onClick={(v) => this.setState({ openSearch: v, openLayers: false, openRouting: false })}
                        open={this.state.openSearch}
                    />
                    {/* GeoJSON */}
                    {this.state.showTrip ? <TripGeoJSON /> : <IsoGeoJSON />}

                    {(this.state.endPosition && this.state.showTrip) ? <Marker position={this.state.endPosition} icon={redIcon} ></Marker> : null}
                    {(this.state.startPosition) ? <Marker position={this.state.startPosition} icon={orangeIcon} ></Marker> : null}
                    <ScaleControl imperial={false} metric={true} position="bottomleft" />

                </MapContainer>
                <ErrorDialog open={errorShow} title={errorTitle} body={errorBody} onClose={this.handleErrorClose} />
            </div>
        );
    }
}