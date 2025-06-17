import React from "react";
import ReactDOM from "react-dom";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import Collapse from "@mui/material/Collapse";
import Checkbox from "@mui/material/Checkbox";
import Fab from "@mui/material/Fab";
import Box from "@mui/material/Box";
import { Control, DomUtil, DomEvent } from "leaflet";
//import { withLeaflet } from "react-leaflet";
import { LeafletContext } from '@react-leaflet/core';
import IconButton from "@mui/material/IconButton";
import LayerIcon from "@mui/icons-material/Layers";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import TerrainIcon from "@mui/icons-material/Terrain";
import RecordIcon from "@mui/icons-material/FiberManualRecord";
import StopIcon from "@mui/icons-material/Stop";
const icons = {
    BaseLayers: <TerrainIcon />,
    Rectangles: <StopIcon />,
    Circles: <RecordIcon />
};

export class ControlledLayer extends React.Component {
    componentDidUpdate({ checked }) {
        if (this.props.leaflet.map == null) {
            return;
        }
        // Handle dynamically (un)checking the layer => adding/removing from the map
        if (this.props.checked === true && (checked == null || checked === false)) {
            this.props.leaflet.map.addLayer(this.layer);
        } else if (
            checked === true &&
            (this.props.checked == null || this.props.checked === false)
        ) {
            this.props.leaflet.map.removeLayer(this.layer);
        }
    }

    componentWillUnmount() {
        this.props.removeLayerControl(this.layer);
    }

    addLayer() {
        throw new Error("Must be implemented in extending class");
    }

    removeLayer(layer) {
        this.props.removeLayer(layer);
    }

    render() {
        const { children } = this.props;
        return children ? (
            <LeafletContext.Provider value={this.contextValue}>{children}</LeafletContext.Provider>
        ) : null;
    }
}

export class ControlledLayerItem extends ControlledLayer {
    constructor(props) {
        super(props);
        this.contextValue = {
            ...props.leaflet,
            layerContainer: {
                addLayer: this.addLayer.bind(this),
                removeLayer: this.removeLayer.bind(this)
            }
        };
    }

    addLayer = layer => {
        this.layer = layer; // Keep layer reference to handle dynamic changes of props
        const { addGroupedLayer, checked, name, group } = this.props;
        addGroupedLayer(layer, name, checked, group);
    };
}

export class LayersControl3 extends React.Component {
    constructor(props, context) {
        super(props);
        this.controlProps = {
            addGroupedLayer: this.addGroupedLayer.bind(this),
            removeLayer: this.removeLayer.bind(this),
            leaflet: props.leaflet
        };
        this._layers = {};

        this.state = {
            menuOpen: false,
            layers: {},
            menus: []
        };
    }

    openMenu = () => {
        this.setState({ menuOpen: true });
    };
    closeMenu = () => {
        this.setState({ menuOpen: false });
    };

    addGroupedLayer = (layer, name, checked, group) => {
        if (checked && this.props.leaflet.map != null) {
            this.props.leaflet.map.addLayer(layer);
        }

        this.setState((prevState, props) => {
            let currentLayers = { ...prevState.layers };
            let currentGroup = currentLayers[group];

            currentGroup = currentGroup
                ? [
                    ...currentGroup.filter(x => x.name !== name),
                    { layer, name, checked, group }
                ]
                : [{ layer, name, checked, group }];
            currentLayers[group] = currentGroup;
            return {
                layers: currentLayers
            };
        });

        // bad implementation

        let currentGroup = this._layers[group];

        currentGroup = currentGroup
            ? [
                ...currentGroup.filter(x => x.name !== name),
                { layer, name, checked, group }
            ]
            : [{ layer, name, checked, group }];

        let layers = { ...this._layers };
        layers[group] = currentGroup;

        this._layers = layers;
    };

    removeLayer(layer) {
        if (this.props.leaflet.map != null) {
            this.props.leaflet.map.removeLayer(layer);
        }
    }
    //create and return a leaflet object you want to extend
    createLeafletElement(props) {
        // extend control from leaflet
        const MyControl = Control.extend({
            // there are only two options we can have here for extending a control
            // https://leafletjs.com/reference-1.5.0.html#control

            // Should return the container DOM element for the control and add listeners on relevant map events
            onAdd: map => {
                this.container = DomUtil.create("div");
                this.map = map;
                return this.container;
            },
            // this one is optional
            onRemove: map => { }
        });

        // return new instance of our control and pass it all the props
        return new MyControl(props);
    }

    updateLeafletElement(fromProps, toProps) {
        super.updateLeafletElement(fromProps, toProps);
        console.log(fromProps, toProps);
        // this.forceUpdate();
    }

    componentDidMount(props) {
        this.forceUpdate();
        // render react component
    }

    toggleLayer = layerInput => {
        const { layer, name, checked, group } = layerInput;
        console.log(layer, name, checked, group);
        let layers = { ...this.state.layers };
        layers[group] = layers[group].map(l => {
            if (l.name === name) {
                l.checked = !l.checked;
            }
            l.checked
                ? this.props.leaflet.map.addLayer(layer) &&
                console.log(name, "adding this layer")
                : this.removeLayer(layer);

            return l;
        });

        this.setState({
            layers
        });
    };

    onCollapseClick = name => {
        const { menus } = this.state;

        menus.includes(name)
            ? this.setState({
                menus: [...this.state.menus.filter(x => x !== name)]
            })
            : this.setState({
                menus: [...menus, name]
            });
    };

    isMenuOpen = name => {
        let open = this.state.menus.includes(name);
        return open;
    };

    render() {
        if (!this.leafletElement || !this.leafletElement.getContainer()) {
            return null;
        }
        // console.log(this.state.baseLayers);
        return (
            <React.Fragment>
                {ReactDOM.createPortal(
                    <Paper
                        onMouseEnter={this.openMenu}
                        onMouseLeave={this.closeMenu}
                        {...this.props}
                    >
                        {this.state.menuOpen && (
                            <div style={{ padding: 10 }}>
                                {Object.keys(this.state.layers).map(g => {
                                    return (
                                        <React.Fragment key={g}>
                                            <ListItem
                                                button
                                                onClick={() => this.onCollapseClick(`${g}`)}
                                            >
                                                <ListItemIcon>{icons[g]}</ListItemIcon>
                                                <ListItemText primary={g} />
                                                {this.isMenuOpen(g) ? <ExpandLess /> : <ExpandMore />}
                                            </ListItem>
                                            <Typography />
                                            <Divider />
                                            <Collapse
                                                in={this.isMenuOpen(g)}
                                                timeout="auto"
                                                unmountOnExit
                                            >
                                                <List>
                                                    {this.state.layers[g].map(l => {
                                                        return (
                                                            <ListItem key={l.name}>
                                                                <ListItemIcon>
                                                                    <Checkbox
                                                                        onClick={() => this.toggleLayer(l)}
                                                                        edge="start"
                                                                        checked={l.checked}
                                                                    />
                                                                </ListItemIcon>
                                                                <ListItemText primary={l.name} />
                                                            </ListItem>
                                                        );
                                                    })}
                                                </List>
                                            </Collapse>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}
                        {!this.state.menuOpen && (
                            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                                <Fab style={{ color: "#fff", backgroundColor: "#F48B0A" }}>
                                    <LayerIcon />
                                </Fab>
                            </Box>
                        )}
                    </Paper>,
                    this.leafletElement.getContainer()
                )}
                {React.Children.map(this.props.children, child => {
                    return child ? React.cloneElement(child, this.controlProps) : null;
                })}
            </React.Fragment>
        );
    }
}

//export default withLeaflet(LayerControl);
