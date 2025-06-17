import { useState, useEffect, useMemo, useTransition } from 'react';
import { useLeafletContext } from '@react-leaflet/core';
import L from 'leaflet';
import 'leaflet.vectorgrid';
import cloneDeep from 'lodash/cloneDeep';

const featureStyling = {
    'geojsonLayer': (properties, zoom) => {
        return properties.level === 27 ?
            {
                weight: 2,
                color: 'black',
                opacity: 1,
                fillColor: 'grey',
                fill: true,
                fillOpacity: 0.2,
                stroke: true
            } :
            {
                stroke: false,
                fill: false,
            }
    }
};

const selectedStyle = {
    weight: 2,
    color: 'blue',
    opacity: 1,
    fillColor: 'blue',
    fill: true,
    fillOpacity: 0.2
};

const highlightStyle = {
    weight: 2,
    color: 'red',
    opacity: 1,
    fillColor: 'orange',
    fill: true,
    fillOpacity: 0.2
};

const getFeatureId = (feature) => feature.properties?.id;


export const VectorGrid = () => {
    const [isPending, startTransition] = useTransition();
    const context = useLeafletContext();
    const { map } = context;
    const [highlight, setHighlight] = useState(null);
    const [selected, setSelected] = useState([]);
    const localUrl = "http://localhost:3000/pbftiles/{z}/{x}/{y}";
    //const mapboxUrl = "https://{s}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/{z}/{x}/{y}.vector.pbf?access_token={token}";
    //const nextzenTilesUrl = "https://tile.nextzen.org/tilezen/vector/v1/512/all/{z}/{x}/{y}.mvt?api_key={apikey}";
    //const providerUrl = mapType === 'mapbox' ? mapboxUrl : nextzenTilesUrl;
    //const visibleFeatures = useSelector(selectCounterVisibleFeatures);

    //const vectorTileStyling = useMemo(() => {
    //    const styles = {};
    //    visibleFeatures.forEach(feat => {
    //        styles[feat] = Styles[feat]
    //    })
    //    return styles;
    //}, [visibleFeatures]);

    // Assumes layers = "all", and format = "mvt"

    const vectorGrid = useMemo(
        () => {
            const options = {
                rendererFactory: L.svg.tile,
                interactive: true,
                type: 'protobuf',
                getFeatureId: getFeatureId,
                vectorTileLayerStyles: featureStyling,

            };

            return L.vectorGrid.protobuf(localUrl, options)
        }, [localUrl]
    );

    vectorGrid.on('click', function (e) {
        const id = e.layer.properties.id;
        const idx = selected.indexOf(id);
        const arr = cloneDeep(selected);
        if (selected.indexOf(id) > -1) {
            arr.splice(idx, 1);
            vectorGrid.resetFeatureStyle(id);
        } else {
            arr.push(id);
            vectorGrid.setFeatureStyle(id, selectedStyle);
        }

        setSelected(arr);
    });

    vectorGrid.on('mouseover', function (e) {
        if (highlight) {
            if (selected.indexOf(highlight) > -1) {
                vectorGrid.setFeatureStyle(highlight, selectedStyle);
            } else {
                vectorGrid.resetFeatureStyle(highlight);
            }
        }
        vectorGrid.setFeatureStyle(e.layer.properties.id, highlightStyle);
        setHighlight(e.layer.properties.id);
    });

    vectorGrid.on('mouseout', function (e) {
        if (highlight) {
            if (selected.indexOf(highlight) > -1) {
                vectorGrid.setFeatureStyle(highlight, selectedStyle);
            } else {
                vectorGrid.resetFeatureStyle(highlight);
            }
        }
        setHighlight(null);
    });

    useEffect(() => {
        map.addLayer(vectorGrid);
        return () => {
            map.removeLayer(vectorGrid);
        };
    }, [map, vectorGrid]);

    return null;
};