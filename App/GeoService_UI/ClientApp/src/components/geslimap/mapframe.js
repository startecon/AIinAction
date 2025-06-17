import React from 'react';
import './map.css';
import {
    CircleMarker,
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    Tooltip, ZoomControl
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { VectorGrid } from './vectorgrid';

//Main
export const MapFrame = ({ data }) => {

    const center = { lat: 64, lng: 25 };
    const isMarkerVisible = false;

    //
    return (
        <React.Fragment>
            {/* Map */}
            {/*<MapContainer*/}
            {/*    whenReady={(event) => {*/}
            {/*        const { target } = event;*/}
            {/*        console.log(target); //TODO*/}
            {/*    }}*/}
            {/*    bearing={0}*/}
            {/*>*/}
            {/*</MapContainer>*/}
            <MapContainer
                center={center}
                zoom={6}
                zoomDelta={0.25}
                zoomSnap={0}
                scrollWheelZoom={false}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                <VectorGrid />
                {isMarkerVisible ?
                    <CircleMarker
                        center={[64, 25]}
                        pathOptions={{ color: 'red' }}
                        radius={20}>
                        <Tooltip>Tooltip for CircleMarker</Tooltip>
                    </CircleMarker> : null
                }
                <ZoomControl />
            </MapContainer>
        </React.Fragment>
    );
};