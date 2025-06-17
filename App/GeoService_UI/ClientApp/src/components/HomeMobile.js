import React from 'react';
import {
    MapContainer,
    TileLayer,
    GeoJSON,
    Marker,
    Popup,
    AttributionControl,
    Tooltip,
    LayersControl,
    ScaleControl,
    ZoomControl,
    LayerGroup,
    FeatureGroup,
    Rectangle,
    Circle
} from 'react-leaflet';
import { createControlComponent } from '@react-leaflet/core';
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

import cities from "./Geojson/cities.json";
import countries from "./Geojson/countries.json";
import centers from "./Geojson/centerpoints.json";

import { GeoserviceZoomIn, GeoserviceZoomOut, GeoserviceRotate, GeoserviceLayers, GeoserviceRouting, GeoserviceLayersMobile, GeoserviceRoutingMobile } from "./Map";
import { LayersControl3, ControlledLayerItem } from "./Map/LayerControl3";

/* Perusmuuttujat ja vakiot */
const PROFIILI_GET = 'api/Profiili/Read';
const PROFIILI_PUT = 'api/Profiili/Update';

const { BaseLayer, Overlay } = LayersControl;

export class HomeMobile extends React.Component {
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
            aika: 5,
            carbon: 1,
            fuel: 5.738,
            trip: null,
            isochrone: null,
            costing: "pedestrian",
            zoom: 6,
            maxZoom: 20,
            activeLayers: [],
            centerPosition: { lat: 60.357423, lng: 25.073315 },

            open: false,
            openLayers: false,
            openRouting: false,

            panel1: true,
            panel2: false,
            showTrip: true,
            openModal: false,
            errorShow: false,
            errorTitle: '',
            errorBody: '',
            autocomplete: [],

            mapInstance: null,

            panel: null,
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

    onEachCountry = (country, layer) => {

        layer.setOpacity(0);
        layer.bindTooltip(country.properties.Country, {
            permanent: true,
            direction: 'center',
            className: 'countryLabel',
            offset: [0, 35]
        });
    }

    onEachCity = (city, layer) => {
        const CityName = city.properties.City;

        layer.setOpacity(0);
        layer.bindTooltip(CityName, {
            permanent: true,
            direction: 'center',
            className: 'cityLabel',
            offset: [0, 25]
        });

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

    render() {
        const { userLanguage, dictionary } = this.context;
        const { position, errorShow, errorTitle, errorBody, aika, carbon, costing, fuel, openAna, openSet, openPro } = this.state;

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

        var orangeIcon = L.icon({
            iconUrl: "/images/marker/marker-icon-orange.png",
            iconAnchor: [13, 40],
            popupAnchor: [-3, -76],
            shadowUrl: "/images/marker/marker-shadow.png",
            shadowSize: [51, 75],
            shadowAnchor: [17, 73]
        });

        var greenIcon = L.icon({
            iconUrl: "/images/marker/marker-icon-green.png",
            iconAnchor: [13, 40],
            popupAnchor: [-3, -76],
            shadowUrl: "/images/marker/marker-shadow.png",
            shadowSize: [51, 75],
            shadowAnchor: [17, 73]
        });

        var redIcon = L.icon({
            iconUrl: "/images/marker/marker-icon-red.png",
            iconAnchor: [13, 40],
            popupAnchor: [-3, -76],
            shadowUrl: "/images/marker/marker-shadow.png",
            shadowSize: [51, 75],
            shadowAnchor: [17, 73],
            className: "testi1"
        });

        var yellowIcon = L.icon({
            iconUrl: "/images/marker/marker-icon-yellow.png",
            iconAnchor: [13, 40],
            popupAnchor: [-3, -76],
            shadowUrl: "/images/marker/marker-shadow.png",
            shadowSize: [51, 75],
            shadowAnchor: [17, 73],
            className: "testi1"
        });

        return (
            <div style={{ display: "flex", height: "100%" }}>

                {/*Mobile*/}
                <Paper style={{ height: "100%", width: "100%" }} sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                    <div id="spatial-analytics" style={{ height: "100%", width: "100%" }}>
                        {/*<MapContainer attribution={false} zoomControl={false} center={position} zoom={this.state.zoom} maxZoom={this.state.maxZoom} rotate={true} rotateControl={{ closeOnZeroBearing: false }} whenReady={this.handleMapCreated} bearing={0}>*/}
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
                            <GeoserviceLayersMobile
                                position="bottomleft"
                                mapInstance={this.state.mapInstance}
                                onDraw={this.handleRoutingDraw}
                                onClick={(v) => this.setState({ openLayers: v, openRouting: false })}
                                open={this.state.openLayers}
                            />
                            <GeoserviceRoutingMobile
                                position="bottomleft"
                                mapInstance={this.state.mapInstance}
                                onDraw={this.handleRoutingDraw}
                                onClick={(v) => this.setState({ openRouting: v, openLayers: false })}
                                open={this.state.openRouting}
                            />

                            {/* GeoJSON */}
                            {this.state.showTrip ? <TripGeoJSON /> : <IsoGeoJSON />}
                            <LayersControl position="bottomleft">
                                <BaseLayer name="OpenStreetMap">
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
                                    />
                                </BaseLayer>
                                <BaseLayer name="Voyager" checked={true}>
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
                                        subdomains="abcd"
                                        maxNativeZoom={20}
                                    />
                                </BaseLayer>
                                <BaseLayer name="Voyager (no lables)" >
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
                                        subdomains="abcd"
                                        maxNativeZoom={20}
                                    />
                                </BaseLayer>
                                <BaseLayer name="Positron">
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
                                        subdomains="abcd"
                                        maxNativeZoom={20}
                                    />
                                </BaseLayer>
                                <BaseLayer name="Positron (no labels)">
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
                                        subdomains="abcd"
                                        maxNativeZoom={20}
                                    />
                                </BaseLayer>
                                <BaseLayer name="Dark matter">
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
                                        subdomains="abcd"
                                        maxNativeZoom={20}
                                    />
                                </BaseLayer>
                                <BaseLayer name="Dark matter (no labels)">
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
                                        subdomains="abcd"
                                        maxNativeZoom={20}
                                    />
                                </BaseLayer>
                                <BaseLayer name="OPNVKarte">
                                    <TileLayer
                                        url="https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png"
                                        attribution="Map <a href='https://memomaps.de/'>memomaps.de</a> <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, map data &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                                        maxNativeZoom={18}
                                    />
                                </BaseLayer>
                                <BaseLayer name="Stamen Terrain">
                                    <TileLayer
                                        url="https://stamen-tiles.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.jpg"
                                        attribution="Map tiles by <a href='http://stamen.com'>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://www.openstreetmap.org/copyright'>ODbL</a>"
                                        maxNativeZoom={18}
                                    />
                                </BaseLayer>
                                <BaseLayer name="Stamen Toner">
                                    <TileLayer
                                        url="https://stamen-tiles.a.ssl.fastly.net/toner-background/{z}/{x}/{y}.png"
                                        attribution="Map tiles by <a href='http://stamen.com'>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://www.openstreetmap.org/copyright'>ODbL</a>"
                                        maxNativeZoom={18}
                                    />
                                </BaseLayer>
                                <BaseLayer name="Stamen Toner Lite">
                                    <TileLayer
                                        url="https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png"
                                        attribution="Map tiles by <a href='http://stamen.com'>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://www.openstreetmap.org/copyright'>ODbL</a>"
                                        maxNativeZoom={18}
                                    />
                                </BaseLayer>
                                <Overlay name={dictionary.Routing.Label6}>
                                    <GeoJSON key={"valtiot"} data={countries} style={(f) => { return { color: "#7030a0", opacity: 0.5, fillOpacity: 0 } }} />
                                </Overlay>
                                <Overlay name={dictionary.Routing.Label7}>
                                    <GeoJSON key={"valtioiden_keskipisteet"} data={centers} onEachFeature={this.onEachCountry} />
                                </Overlay>
                                <Overlay name={dictionary.Routing.Label8}>
                                    <GeoJSON key={"kaupungit"} data={cities} onEachFeature={this.onEachCity} />
                                </Overlay>
                            </LayersControl>
                            {(this.state.endPosition && this.state.showTrip) ? <Marker position={this.state.endPosition} icon={redIcon} ></Marker> : null}
                            {(this.state.startPosition) ? <Marker position={this.state.startPosition} icon={orangeIcon} ></Marker> : null}
                            <ScaleControl imperial={false} metric={true} position="bottomleft" />

                        </MapContainer>
                        <ErrorDialog open={errorShow} title={errorTitle} body={errorBody} onClose={this.handleErrorClose} />
                    </div>
                </Paper>

                <AppBar sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, top: 'auto', bottom: 0 }}>
                    <Grid container spacing={2} alignItems="center" justifyContent="space-around">
                        <Grid item xs={4}>
                            <MenuItem style={{ flexDirection: "column" }} onClick={() => this.handleRouting()}>
                                <LocationOnIcon style={{ fontSize: "25pt" }} />
                                <p style={{ margin: 0, fontSize: "11pt" }}>Valitse sijainti</p>
                            </MenuItem>
                        </Grid>
                        <Grid item xs={4}>
                            <MenuItem style={{ flexDirection: "column" }} onClick={() => this.handleLayers()}>
                                <LayersIcon style={{ fontSize: "25pt" }} />
                                <p style={{ margin: 0, fontSize: "11pt" }}>Karttapohjat</p>
                            </MenuItem>
                        </Grid>
                        <Grid item xs={4}>
                            <MenuItem style={{ flexDirection: "column" }}>
                                <InfoIcon style={{ fontSize: "25pt" }} />
                                <p style={{ margin: 0, fontSize: "11pt" }}>Ohjeita</p>
                            </MenuItem>
                        </Grid>
                    </Grid>
                </AppBar>
            </div>
        );
    }
}