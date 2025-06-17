import React, { ReactElement, useState } from 'react';
import { Paper, Typography, IconButton } from '@mui/material';
import { useMapEvents } from 'react-leaflet';
import { Layer, Util } from 'leaflet';
import Accordion from '@mui/material/Accordion';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LayersIcon from '@mui/icons-material/Layers';
import lodashGroupBy from 'lodash.groupby';
import { ControlProvider } from './ControlProvider';

import createControlledLayer from './ControlledLayer';

const POSITION_CLASSES = {
    bottomleft: 'leaflet-bottom leaflet-left',
    bottomright: 'leaflet-bottom leaflet-right',
    topleft: 'leaflet-top leaflet-left',
    topright: 'leaflet-top leaflet-right',
};

export const GeoserviceLayers = ({ position, children }) => {
    const [collapsed, setCollapsed] = useState(true);
    const [layers, setLayers] = useState([]);
    const positionClass =
        (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;

    const map = useMapEvents({
        layerremove: () => {
            //console.log('layer removed');
        },
        layeradd: () => {
            //console.log('layer add');
        },
        overlayadd: () => {
            //console.log(layers);
        },
    });

    const onLayerClick = (layerObj) => {
        if (map?.hasLayer(layerObj.layer)) {
            map.removeLayer(layerObj.layer);
            setLayers(
                layers.map((layer) => {
                    if (layer.id === layerObj.id)
                        return {
                            ...layer,
                            checked: false,
                        };
                    return layer;
                })
            );
        } else {
            map.addLayer(layerObj.layer);
            setLayers(
                layers.map((layer) => {
                    if (layer.id === layerObj.id)
                        return {
                            ...layer,
                            checked: true,
                        };
                    return layer;
                })
            );
        }
    };

    const onGroupAdd = (layer, name, group) => {
        const cLayers = layers;
        cLayers.push({
            layer,
            group,
            name,
            checked: map?.hasLayer(layer),
            id: Util.stamp(layer),
        });

        setLayers(cLayers);
    };

    const groupedLayers = lodashGroupBy(layers, 'group');

    return (
        <ControlProvider
            value={{
                layers,
                addGroup: onGroupAdd,
            }}
        >
            <div className={positionClass}>
                <div className="leaflet-control leaflet-bar">
                    {
                        <Paper
                            onMouseEnter={() => setCollapsed(false)}
                            onMouseLeave={() => setCollapsed(true)}
                        >
                            {collapsed && (
                                <IconButton>
                                    <LayersIcon fontSize="default" />
                                </IconButton>
                            )}
                            {!collapsed &&
                                Object.keys(groupedLayers).map((section, index) => (
                                    <Accordion key={`${section} ${index}`}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                        >
                                            <Typography>{section}</Typography>
                                        </AccordionSummary>
                                        {groupedLayers[section]?.map((layerObj, index) => (
                                            <AccordionDetails key={`accDetails_${index}`}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={layerObj.checked}
                                                            onChange={() => onLayerClick(layerObj)}
                                                            name="checkedB"
                                                            color="primary"
                                                        />
                                                    }
                                                    label={layerObj.name}
                                                />
                                            </AccordionDetails>
                                        ))}
                                    </Accordion>
                                ))}
                        </Paper>
                    }
                </div>
                {children}
            </div>
        </ControlProvider>
    );
};

export const GroupedLayer = createControlledLayer(
    (layersControl, layer, name, group) => {
        layersControl.addGroup(layer, name, group);
    }
);