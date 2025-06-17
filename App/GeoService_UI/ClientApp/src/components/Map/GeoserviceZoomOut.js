import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, AttributionControl, Tooltip, LayersControl, ScaleControl, ZoomControl } from 'react-leaflet';
import { createControlComponent } from '@react-leaflet/core';
import L from 'leaflet';

L.Control.GeoserviceZoomOut = L.Control.extend({
	onAdd: function (map) {
		const container = L.DomUtil.create("div");
		const button = L.DomUtil.create("button", "MuiButtonBase-root MuiFab-root MuiFab-circular MuiFab-sizeLarge MuiFab-primary MuiButtonBase-root-MuiFab-root", container);

		button.innerHTML = `
                <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeLarge MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24">
                    <path d="M19 13H5v-2h14v2z"></path>
                </svg>`;

		L.DomEvent.disableClickPropagation(button);
		L.DomEvent.on(button, 'click', L.DomEvent.stop);
		L.DomEvent.on(button, 'click', this._zoomOut, this);
		L.DomEvent.on(button, 'click', this._refocusOnMap, this);

		this._zoomOutButton = button;
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

	_zoomOut(e) {
		if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
			this._map.zoomOut(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
		}
	},

	_updateDisabled() {
		const map = this._map,
			className = 'leaflet-disabled';

		this._zoomOutButton.classList.remove(className);
		this._zoomOutButton.setAttribute('aria-disabled', 'false');

		if (this._disabled || map._zoom === map.getMinZoom()) {
			this._zoomOutButton.classList.add(className);
			this._zoomOutButton.setAttribute('aria-disabled', 'true');
		}
	}
});

export const GeoserviceZoomOut = createControlComponent(
    (props) => new L.Control.GeoserviceZoomOut(props),
)