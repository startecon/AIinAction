import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, AttributionControl, Tooltip, LayersControl, ScaleControl, ZoomControl } from 'react-leaflet';
import { createControlComponent } from '@react-leaflet/core';
import L from 'leaflet';

L.Control.GeoserviceRotate = L.Control.extend({
    onAdd: function (map) {
        const button = L.DomUtil.create("div");
        button.innerHTML = `
            <button class="MuiButtonBase-root MuiFab-root MuiFab-circular MuiFab-sizeLarge MuiFab-primary MuiButtonBase-root-MuiFab-root">
                <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeLarge MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24">
                    <path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"></path>
                </svg>
            </button>`
        return button;
    },

    onRemove: function (map) { },
});

export const GeoserviceRotate = createControlComponent(
    (props) => new L.Control.GeoserviceRotate(props),
)