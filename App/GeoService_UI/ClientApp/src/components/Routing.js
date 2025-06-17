import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, AttributionControl, Tooltip, LayersControl, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
//import 'leaflet-rotate/dist/leaflet-rotate';
import { Button, ButtonGroup, TextField, Typography, AccordionDetails, Slider, AccordionSummary, Accordion, IconButton, Grid, Input, Box, FormControl, InputLabel, Select, MenuItem, Autocomplete } from '@mui/material';
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
import Room from '@mui/icons-material/Room';
import { withStyles } from "@mui/styles";

import cities from "./Geojson/cities.json";
import countries from "./Geojson/countries.json";
import centers from "./Geojson/centerpoints.json";
import tooltips from "./Geojson/tooltips.css";

/* Perusmuuttujat ja vakiot */
const PROFIILI_GET = 'api/Profiili/Read';
const PROFIILI_PUT = 'api/Profiili/Update';
const API_ROUTE_PREFIX = 'api/Routing/Route';
const API_ISOCHRONE_PREFIX = 'api/Routing/Isochrone';
const API_GEOCODE_PREFIX = 'api/Geocoding';

const { BaseLayer, Overlay } = LayersControl;

export class Routing extends React.Component {
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
            panel1: true,
            panel2: false,
            showTrip: true,
            openModal: false,
            errorShow: false,
            errorTitle: '',
            errorBody: '',
            autocomplete: [],
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

    togglePanel = () => {
        this.setState({ showTrip: !this.state.showTrip, routing: true }, () => this.handleRouting());
    }

    toggleRouting = () => {
        this.setState({ routing: !this.state.routing });
    }

    handleCosting = (value) => {
        this.setState({ costing: value }, () => this.handleRouting());
    }

    handleRouting = () => {
        if (this.state.showTrip && this.state.startPosition && this.state.endPosition) this.handleTrip();
        else if (!this.state.showTrip && this.state.startPosition) this.handleIsochrone();
    }

    handleStartAddress = (feature) => {

        if (feature) {
            var geom = feature.geometry;
            var latlng = (((geom || {}).coordinates || []).length > 1 ? [geom.coordinates[1], geom.coordinates[0]] : null);
            var addr = (feature.properties || {}).label;

            if (addr) {
                this.setState({ startAddress: addr, startPosition: latlng }, () => this.handleRouting());
            }
        }
    }

    handleEndAddress = (feature) => {

        if (feature) {
            const geom = feature.geometry;
            const latlng = (((geom || {}).coordinates || []).length > 1 ? [geom.coordinates[1], geom.coordinates[0]] : null);
            const addr = (feature.properties || {}).label;

            if (addr) {
                this.setState({ endAddress: addr, endPosition: latlng }, () => this.handleRouting());
            }
        }
    }

    handleAika = (event) => {
        this.setState({ aika: (event.target.value === '' ? '' : parseInt(event.target.value)) }, () => this.handleRouting());
    };

    handleSliderAika = (event, value) => {
        this.setState({ aika: parseInt(value) }, () => this.handleRouting());
    };

    handleCo2 = (event) => {
        const carb = (event.target.value === '' ? '' : parseInt(event.target.value));
        const time = carb * (this.state.fuel || 0);
        this.setState({
            carbon: carb,
            aika: time
        }, () => this.handleRouting());
    };

    handleSliderCo2 = (event, value) => {
        const carb = (value === '' ? '' : parseInt(value));
        const time = carb * (this.state.fuel || 0);
        this.setState({
            carbon: carb,
            aika: time
        }, () => this.handleRouting());
    };

    handleFuel = (event) => {
        const fuel = parseFloat(event.target.value);
        this.setState({
            fuel: fuel,
            aika: (this.state.carbon || 0) * fuel
        }, () => this.handleRouting());
    };

    handleTrip = () => {
        const { startPosition, endPosition, costing } = this.state;

        // payload
        const query = {
            "locations": [
                { "lat": startPosition[0], "lon": startPosition[1] },
                { "lat": endPosition[0], "lon": endPosition[1] }
            ],
            "costing": costing
        };

        // get trip
        authPost(this.props.pca, API_ROUTE_PREFIX + '/Read', {
            method: "POST",
            body: JSON.stringify(query)
        })
            .then(response => response.json())
            .then(data => {
                try {
                    const geojson = parseTrip(JSON.parse(data.message).trip)
                    this.setState({
                        isochrone: null,
                        trip: geojson,
                        tripData: JSON.parse(data.message).trip.summary
                    });
                }
                catch (err) {
                    console.error("Invalid address");
                }
            });
    }

    handleIsochrone = () => {

        const { startPosition, aika, costing } = this.state;

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
        authPost(this.props.pca, API_ISOCHRONE_PREFIX + '/Read', {
            method: "POST",
            body: JSON.stringify(isoqry)
        })
            .then(response => response.json())
            .then(data => {
                try {
                    const geojson = JSON.parse(data.message);

                    this.setState({
                        isochrone: geojson,
                        trip: null
                    });
                }
                catch (err) {
                    console.error("Invalid address");
                }
            });
    }

    handleAutoComplete = (teksti) => {
        teksti = teksti.toString()
            .replace(/[ÅÄ]/g, "A")
            .replace(/[åä]/g, "a")
            .replace(/[Ö]/g, "O")
            .replace(/[ö]/g, "o");

        if (teksti.length > 0) {
            authFetch(this.props.pca, API_GEOCODE_PREFIX + '/Autocomplete/' + teksti + (this.state.centerPosition ? ("/" + this.state.centerPosition.lat + "/" + this.state.centerPosition.lng) : ""))
                .then(response => response.json())
                .then(data => {

                    if (data.error == false) {
                        var geojson = JSON.parse(data.message);
                        var autocomplete = (geojson || {}).features || [];

                        this.setState({
                            autocomplete: autocomplete
                        });
                    }
                });
        }
    }

    handleMapCreated = (e) => {

        e.target._on("click", (e) => {
            // Get Address
            authFetch(this.props.pca, API_GEOCODE_PREFIX + '/Address/' + e.latlng.lat + '/' + e.latlng.lng)
                .then(response => response.json())
                .then(data => {
                    if (data.error == false) {
                        const geojson = JSON.parse(data.message);
                        const feature = ((geojson || {}).features || [])[0];
                        const geom = (feature || {}).geometry;
                        const latlng = (((geom || {}).coordinates || []).length > 1 ? [geom.coordinates[1], geom.coordinates[0]] : e.latlng);
                        const addr = ((feature || {}).properties || {}).label;

                        if (addr) {
                            if (this.state.routing) {
                                this.setState({ startAddress: addr, startPosition: latlng }, () => this.handleRouting());
                            } else {
                                this.setState({ endAddress: addr, endPosition: latlng }, () => this.handleRouting());
                            }
                        }
                    }
                });
        });

        e.target._on("move", (e) => {
            // Get Center
            this.setState({ centerPosition: e.target.getCenter() });
        })
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

    render() {
        const { userLanguage, dictionary } = this.context;
        const { position, errorShow, errorTitle, errorBody, aika, carbon, costing, fuel } = this.state;

        const handleBlurAika = () => {
            if (aika < 0) {
                this.setState({ aika: 0 });
            } else if (aika > 60) {
                this.setState({ aika: 60 });
            }
        };

        const handleBlurCo2 = () => {
            if (carbon < 0) {
                this.setState({ carbon: 0 });
            } else if (carbon > 6) {
                this.setState({ carbon: 6 });
            }
        };

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
            <div id="spatial-analytics">
                <MapContainer center={position} zoom={this.state.zoom} maxZoom={this.state.maxZoom} rotate={true} rotateControl={{ closeOnZeroBearing: false }} whenReady={this.handleMapCreated} bearing={0}>

                    {/* GeoJSON */}
                    {this.state.showTrip ? <TripGeoJSON /> : <IsoGeoJSON />}

                    <LayersControl position="bottomright">
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

                <div className="leaflet-top leaflet-right" style={{ paddingTop: "70px" }}>
                    <div className="leaflet-control leaflet-bar">
                        <div style={{ background: "white", width: 350, height: "100%", padding: 0 }}>
                            <div style={{ textAlign: "center" }}>
                                <ButtonGroup variant="text" aria-label="text button group">
                                    <IconButton onClick={() => this.handleCosting("pedestrian")}><DirectionsWalk style={{ color: (this.state.costing == "pedestrian") ? ("#ff6600ff") : ("#7030a0ff"), fontSize: "35px" }} /></IconButton>
                                    <IconButton onClick={() => this.handleCosting("auto")}><DriveEtan style={{ color: (this.state.costing == "auto") ? ("#ff6600ff") : ("#7030a0ff"), fontSize: "35px" }} /></IconButton>
                                    <IconButton onClick={() => this.handleCosting("multimodal")}><Train style={{ color: (this.state.costing == "multimodal") ? ("#ff6600ff") : ("#7030a0ff"), fontSize: "35px" }} /></IconButton>
                                    <IconButton onClick={() => this.handleCosting("bicycle")}><DirectionsBike style={{ color: (this.state.costing == "bicycle") ? ("#ff6600ff") : ("#7030a0ff"), fontSize: "35px" }} /></IconButton>
                                </ButtonGroup>
                            </div>
                            <div style={{ padding: "0px 16px" }}>
                                <Typography>{dictionary.Routing.Label1}</Typography>
                                <div style={{ display: "flex" }}>
                                    <Autocomplete
                                        onChange={(event, newValue) => { this.handleStartAddress(newValue) }}
                                        onInputChange={(event, value) => { this.handleAutoComplete(value) }}
                                        value={(this.state.startAddress || '')}
                                        options={this.state.autocomplete}
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
                                        style={{ width: 300 }}
                                        renderInput={(params) => <TextField {...params} required={true} variant="standard" placeholder={dictionary.Routing.TextBoxLabel} />}
                                    />
                                    <IconButton onClick={this.toggleRouting}><Room style={{ color: (this.state.routing ? "#ff6600ff" : "#7030a0ff"), fontSize: "35px" }} /></IconButton>
                                </div>
                            </div>
                            <div style={{ paddingBottom: "15px" }}>
                                <Accordion expanded={this.state.showTrip} onChange={this.togglePanel} elevation={0} style={{ margin: "0px !important" }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header" style={{ margin: "0px !important" }}>
                                        <Typography style={{ margin: 0 }}>{dictionary.Routing.Label2}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails style={{ padding: "0px 16px" }}>
                                        <Autocomplete
                                            onChange={(event, newValue) => { this.handleEndAddress(newValue) }}
                                            onInputChange={(event, value) => { this.handleAutoComplete(value) }}
                                            value={(this.state.endAddress || '')}
                                            options={this.state.autocomplete}
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
                                            style={{ width: 300 }}
                                            renderInput={(params) => <TextField {...params} required={true} variant="standard" placeholder={dictionary.Routing.TextBoxLabel} />}
                                        />
                                        <IconButton onClick={this.toggleRouting}><Room style={{ color: (!this.state.routing ? "#ff6600ff" : "#7030a0ff"), fontSize: "35px" }} /></IconButton>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={!this.state.showTrip} onChange={this.togglePanel} elevation={0}>
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
                                                    value={typeof this.state.aika === 'number' ? this.state.aika : 0}
                                                    step={1}
                                                    min={0}
                                                    max={60}
                                                    onChangeCommitted={this.handleSliderAika}
                                                    aria-labelledby="input-slider-aika"
                                                />
                                            </Grid>
                                            <Grid item>
                                                <Input
                                                    margin="dense"
                                                    value={this.state.aika}
                                                    onChange={this.handleAika}
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
                                                            value={typeof this.state.carbon === 'number' ? this.state.carbon : 0}
                                                            step={1}
                                                            min={0}
                                                            max={6}
                                                            onChangeCommitted={this.handleSliderCo2}
                                                            aria-labelledby="input-slider-co2"
                                                        />
                                                    </Grid>
                                                    <Grid item>
                                                        <Input
                                                            margin="dense"
                                                            value={this.state.carbon}
                                                            onChange={this.handleCo2}
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
                                                        onChange={this.handleFuel}
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
                    </div>
                </div>

                <ErrorDialog open={errorShow} title={errorTitle} body={errorBody} onClose={this.handleErrorClose} />
            </div>
        );
    }
}

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