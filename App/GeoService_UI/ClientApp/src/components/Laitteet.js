import React from 'react';
import {
    MapContainer,
    TileLayer
} from 'react-leaflet';
import L from 'leaflet';
import './geslimap/map.css';
import './geslimap/mapframe.js';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

//Custom icon markerille (Siirretäänkö tulevaisuudessa?)
const gesliIcon = L.icon({
    iconUrl: "/images/marker/marker-icon-gesli.png",
    iconSize: [41, 41],
    iconAnchor: [20, 41]
});

var markerLayer = new L.LayerGroup();

//Listat joissa säilytetään dataa
const Markers = [];
const newMarkers = [];

export class Laitteet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            zoom: 6,
            maxZoom: 20,
            mapInstance: null,
            position: [60.357423, 25.073315],
            editOpen: false,
            createOpen: false,
            name: '',
            description: '',
            latLng: '',
            currentMarker: '',
            currentIndex: ''
        };

        this.handleCreateOpen = this.handleCreateOpen.bind(this);
        this.handleEditOpen = this.handleEditOpen.bind(this);
        this.handleCreateClose = this.handleCreateClose.bind(this);
        this.handleEditClose = this.handleEditClose.bind(this);
    }

    //Event handlerit
    handleCreateOpen() {
        this.setState({
            createOpen: true
        });
    }

    handleEditOpen() {
        this.setState({
            editOpen: true
        });
    }

    handleCreateClose() {
        this.setState({
            createOpen: false
        });
    }

    handleEditClose() {
        this.setState({
            editOpen: false
        });
    }

    render() {
        return (
            <React.Fragment>
                <MapContainer
                    whenReady={(e) => {

                        //Määritellään kartta ja lisätään markerLayer karttaan
                        const map = e.target;
                        markerLayer.addTo(map);

                        this.setState({
                            mapInstance: map
                        });

                        //Kartan click event
                        map.on('click', (e) => {

                            this.handleCreateOpen();

                            //Otetaan talteen klikattu sijainti ja clearataan markerit
                            this.setState({
                                latLng: e.latlng,
                                description: '',
                                name:''
                            })

                        })
                       }
                    }
                    center={this.state.position}
                    mapInstance={this.state.mapInstance}
                    zoom={this.state.zoom}
                    scrollWheelZoom={false}
                    >
                    <TileLayer
                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                </MapContainer>
                <Dialog
                    open={this.state.createOpen}
                    onClose={this.handleCreateClose}
                >
                    <DialogTitle>Uusi Pinni</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            name="UserInputName"
                            label="nimi"
                            fullWidth
                            variant="standard"
                            onChange={(e) =>
                                this.setState({
                                    name: e.target.value
                                })
                            }
                        />
                        <TextField
                            margin="dense"
                            id="description"
                            name="UserInputDescription"
                            label="kuvaus"
                            fullWidth
                            variant="standard"
                            onChange={(e) =>
                                this.setState({
                                    description: e.target.value
                                })
                            }

                        />
                    </DialogContent>
                    <DialogActions>
                        <Button id="cancel" onClick={(e) => {

                            this.handleCreateClose();

                        }}>Peruuta</Button>
                        <Button id="save"
                            onClick={(e) => {


                                //Lisätään Markerin tiedot listaan
                                Markers.push({
                                    markerName: this.state.name, markerDescription: this.state.description, markerLatLng: this.state.latLng
                                })

                                console.log(Markers)
                                this.handleCreateClose();


                                //Lisätään Markeri markerLayerille + Marker click event
                                new L.marker(this.state.latLng, { icon: gesliIcon },).addTo(markerLayer).on('click', (e) => {

                                    //Otetaan talteen klikatun markerin sijainti kartalla
                                    this.setState({
                                        latLng: e.latlng
                                    })

                                    let filterCurrentMarker = Markers.filter(Marker => Marker.markerLatLng === this.state.latLng);
                                    let newNames = Markers.map(Marker => Marker.markerName)
                                    let newDescriptions = Markers.map(Marker => Marker.markerDescription)

                                   //Tarkistetaan filterCurrentMarkerin avulla missä indeksissä kyseinen marker sijaitsee
                                    var index = Markers.indexOf(filterCurrentMarker[0]);

                                    this.setState({
                                        currentIndex: index,
                                        currentMarker: e.target,
                                        name: newNames[index],
                                        description: newDescriptions[index]
                                    })

                                    console.log(Markers)
                                    this.handleEditOpen();
                                });
                            }
                            }> Tallenna</Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.editOpen}
                    onClose={this.handleEditClose}
                >
                    <DialogTitle>Muokkaa</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            name="UserInputName"
                            label="nimi"
                            fullWidth
                            variant="standard"
                            value={this.state.name}
                            onChange={(e) =>
                                this.setState({
                                    name: e.target.value
                                })}
                        />
                        <TextField
                            margin="dense"
                            id="description"
                            name="UserInputDescription"
                            label="kuvaus"
                            fullWidth
                            variant="standard"
                            value={this.state.description}
                            onChange={(e) =>
                                this.setState({
                                    description: e.target.value
                                })}

                        />
                    </DialogContent>
                    <DialogActions>
                        <Button id="delete"
                            onClick={(e) => {

                                //Poistetaan Marker listasta ja kartalta
                                Markers.splice(this.state.currentIndex, 1)
                                this.state.currentMarker.remove();

                                console.log(Markers)
                                this.handleEditClose();

                            }}>Poista</Button>
                        <Button id="cancel"
                            onClick={(e) => {

                                this.handleEditClose();

                            }}>Peruuta</Button>
                        <Button id="save"
                            onClick={(e) => {

                                newMarkers.push({
                                    markerName: this.state.name, markerDescription: this.state.description, markerLatLng: this.state.latLng
                                })

                                //Korvataan halutun markerin tiedot newMarkers listaan talletetuilla tiedoilla
                                Markers.splice(this.state.currentIndex, 1, newMarkers[0]);
                                newMarkers.splice(0, 1)

                                console.log(newMarkers)
                                console.log(Markers)
                                this.handleEditClose();

                            }}>Tallenna</Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        )
    }
}