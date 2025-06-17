import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, AttributionControl, Tooltip, LayersControl, ScaleControl, ZoomControl } from 'react-leaflet';
import { createControlComponent } from '@react-leaflet/core';
import L from 'leaflet';
import './style.css';

L.Control.GeoserviceZoomIn = L.Control.extend({
    onAdd: function (map) {
		const container  = L.DomUtil.create("div");
		const button = L.DomUtil.create("button", "MuiButtonBase-root MuiFab-root MuiFab-circular MuiFab-sizeLarge MuiFab-primary MuiButtonBase-root-MuiFab-root", container);

		button.innerHTML = `
                <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeLarge MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
                </svg>`;
		
		L.DomEvent.disableClickPropagation(button);
		L.DomEvent.on(button, 'click', L.DomEvent.stop);
		L.DomEvent.on(button, 'click', this._zoomIn, this);
		L.DomEvent.on(button, 'click', this._refocusOnMap, this);

		this._zoomInButton = button;
		this._updateDisabled();
		map.on('zoomend zoomlevelschange', this._updateDisabled, this);

		return container;
    },

	onRemove: function (map) { },

	disable() {
		this._disabled = true;
		this._updateDisabled();
		return this;
	},

	enable() {
		this._disabled = false;
		this._updateDisabled();
		return this;
	},

	_zoomIn(e) {
		if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
			this._map.zoomIn(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
		}
	},

	_updateDisabled() {
		const map = this._map,
			className = 'leaflet-disabled';

		this._zoomInButton.classList.remove(className);
		this._zoomInButton.setAttribute('aria-disabled', 'false');

		if (this._disabled || map._zoom === map.getMaxZoom()) {
			this._zoomInButton.classList.add(className);
			this._zoomInButton.setAttribute('aria-disabled', 'true');
		}
	}
});

export const GeoserviceZoomIn = createControlComponent(
    (props) => new L.Control.GeoserviceZoomIn(props),
)

