import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, AttributionControl, Tooltip, LayersControl, onEachFeature } from 'react-leaflet';
import 'leaflet-rotate/dist/leaflet-rotate-src'; //TODO: ...-src voi jossain vaiheessa korvata ilman sitä olevalla tiedostolla
import L from 'leaflet'
import { Button, ButtonGroup, TextField, Typography, AccordionDetails, Slider, AccordionSummary, Accordion, IconButton, Grid, Input, Box, FormControl, InputLabel, Select, MenuItem, css, Icon } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PublicIcon from '@mui/icons-material/Public';
import Autocomplete from '@mui/lab/Autocomplete';
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
import tooltips from "./Geojson/tooltips.css"
import { Style } from '@mui/icons-material';
import { Background } from 'victory';

/* Perusmuuttujat ja vakiot */
const PROFIILI_GET = 'api/Profiili/Read';
const PROFIILI_PUT = 'api/Profiili/Update';
const API_ROUTE_PREFIX = 'api/RotatingMap/Route';
const API_ISOCHRONE_PREFIX = 'api/RotatingMap/Isochrone';
const API_GEOCODE_PREFIX = 'api/Geocoding';

export class RotatingMap extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);
        this.state = {
            position: [60.357423, 25.073315],
            bearing: 0,
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

    handleMapCreated = (map) => {

        map.on("click", (e) => {
            // Get Address

        });

        map.on("move", (e) => {
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
        const { position, errorShow, errorTitle, errorBody } = this.state;

        return (
            <div id="spatial-analytics">
                <MapContainer center={position} zoom={this.state.zoom} maxZoom={this.state.maxZoom} whenCreated={this.handleMapCreated} attributionControl={false} rotate={true} rotateControl={{ closeOnZeroBearing: false }} bearing={0}>
                    {/* Tiles */}

                    <LayersControl position="bottomright">
                        <LayersControl.Overlay name="Valtiot">
                            <GeoJSON key={"valtiot"} data={countries} />
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="Valtioiden nimet">
                            <GeoJSON key={"valtioiden_keskipisteet"} data={centers} onEachFeature={this.onEachCountry} />
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="Kaupungit">
                            <GeoJSON key={"kaupungit"} data={cities} onEachFeature={this.onEachCity} />
                        </LayersControl.Overlay>
                    </LayersControl>

                    <TileLayer url="https://stamen-tiles.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.jpg" />
                </MapContainer>

                <ErrorDialog open={errorShow} title={errorTitle} body={errorBody} onClose={this.handleErrorClose} />
            </div>
        );

    }
}