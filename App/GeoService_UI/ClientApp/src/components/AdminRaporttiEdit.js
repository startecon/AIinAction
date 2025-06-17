import React from "react";
import Autocomplete from '@mui/lab/Autocomplete';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { withStyles } from "@mui/styles";
import { LanguageContext } from './LanguageContext';

const defaultToolbarStyles = {
    iconButton: {
    },
};

var iniRyhma;
var iniTietopalvelu;
var iniTyyppi;
var iniOsio;
var iniToiminnot;

class AdminRaporttiEdit extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.riviAvain == props.rowId;
        });

        this.state = {
            open: false,
            RiviAvain: data[0].riviAvain,
            RyhmaAvain: data[0].ryhmaAvain,
            TyyppiAvain: data[0].tyyppiAvain,
            RaporttiAvain: data[0].raporttiAvain,
            Kieli: data[0].kieli,
            RaporttiNimi: data[0].raporttiNimi,
            RaporttiTiedostoNimi: data[0].raporttiTiedostoNimi,
            RaporttiKuvaus: data[0].raporttiKuvaus,
            RaporttiTunnus: data[0].raporttiTunnus,
            Parametrit: data[0].parametrit,
            Tietojoukko: data[0].tietojoukko,
            Sivu: data[0].sivu,
            Suodattimet: data[0].suodattimet,
            Raporttisivut: data[0].raporttisivut,
            Kirjanmerkit: data[0].kirjanmerkit,
            Asettelu: data[0].asettelu,
            Nosto: data[0].nosto,
            Lisatiedot: data[0].lisatiedot,
            Created: data[0].created,
            Updated: data[0].updated,
            Username: data[0].username,
            Active: data[0].active,
            ryhmat: (Object.keys(props.lookupLists.ryhmat).map(function (d) { return { value: d, label: props.lookupLists.ryhmat[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            filteredryhmat: (Object.keys(props.lookupLists.ryhmat).map(function (d) { return { value: d, label: props.lookupLists.ryhmat[d] }; }) || []),
            tyypit: (Object.keys(props.lookupLists.tyypit).map(function (d) { return { value: d, label: props.lookupLists.tyypit[d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1),
            filteredtyypit: (Object.keys(props.lookupLists.tyypit).map(function (d) { return { value: d, label: props.lookupLists.tyypit[d] }; }) || []),
        };

    }

    componentWillMount() {
        var r = this.state.RyhmaAvain || '';
        var t = this.state.TyyppiAvain || '';
        iniRyhma = this.state.ryhmat.find(({ value }) => value === r.toString());
        iniTyyppi = this.state.tyypit.find(({ value }) => value === t.toString());
    }

    handleSave = () => {
        this.props.onEditRow({
            RiviAvain: this.state.RiviAvain,
            RyhmaAvain: this.state.RyhmaAvain,
            TyyppiAvain: this.state.TyyppiAvain,
            RaporttiAvain: this.state.RaporttiAvain,
            Kieli: this.state.Kieli,
            RaporttiNimi: this.state.RaporttiNimi,
            RaporttiTiedostoNimi: this.state.RaporttiTiedostoNimi,
            RaporttiKuvaus: this.state.RaporttiKuvaus,
            RaporttiTunnus: this.state.RaporttiTunnus,
            Parametrit: this.state.Parametrit,
            Tietojoukko: this.state.Tietojoukko,
            Sivu: this.state.Sivu,
            Suodattimet: this.state.Suodattimet,
            Raporttisivut: this.state.Raporttisivut,
            Kirjanmerkit: this.state.Kirjanmerkit,
            Nosto: this.state.Nosto,
            Lisatiedot: this.state.Lisatiedot,
            Asettelu: this.state.Asettelu,
            Created: this.state.Created,
            Updated: this.state.Updated,
            Username: this.state.Username,
            Active: this.state.Active
        });
        this.setState({ open: false });
    }

    render() {
        const { dictionary } = this.context;
        const { lookupLists } = this.props;
        const { ryhmat, tyypit } = this.state;

        const handleChange = name => event => {
            this.setState({ [name]: event.target.value });
        };

        var handleClickOpen = () => {
            this.setState({
                open: true,
                filteredryhmat: ryhmat,
                filteredtyypit: tyypit,
            });
        }

        const handleListChange = (event, newValue, item) => {
            if (newValue != null) {
                this.setState({ [item]: newValue.value })
            }
            else {
                this.setState({ [item]: null })
            }
        }

        const handleListStateChange = list => {
            const data = (Object.keys(lookupLists[list]).map(function (d) { return { value: d, label: lookupLists[list][d] }; }) || []).sort((a, b) => a.label < b.label ? -1 : 1)
            this.setState({ [list]: data })
        };

        var handleClose = () => {
            this.setState({ open: false });
        }

        return (
            <React.Fragment>
                <Tooltip title={dictionary.Toolbar.Edit}>
                    <IconButton onClick={handleClickOpen}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>

                <Dialog open={this.state.open} onClose={handleClose} maxWidth={false} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">{dictionary.AdminRaportti.Title}</DialogTitle>

                    <DialogContent style={{ width: "500px" }}>
                        <input type="hidden" value={this.state.RiviAvain} />
                        <div style={{ display: 'flex', paddingTop: "10px" }} >
                            <Autocomplete
                                defaultValue={iniRyhma}
                                onChange={(event, newValue) => { handleListChange(event, newValue, 'RyhmaAvain') }}
                                onInputChange={() => { handleListStateChange('ryhmat') }}
                                options={ryhmat}
                                getOptionLabel={(option) => option.label}
                                style={{ width: 400 }}
                                renderInput={(params) => <TextField  {...params} required={true} variant="standard" label={dictionary.AdminRaportti.Columns[1]} />}
                            />
                        </div>
                        <div style={{ display: 'flex', paddingTop: "10px" }} >
                            <Autocomplete
                                defaultValue={iniTyyppi}
                                onChange={(event, newValue) => { handleListChange(event, newValue, 'TyyppiAvain') }}
                                onInputChange={() => { handleListStateChange('tyypit') }}
                                options={tyypit}
                                getOptionLabel={(option) => option.label}
                                style={{ width: 400 }}
                                renderInput={(params) => <TextField  {...params} required={true} variant="standard" label={dictionary.AdminRaportti.Columns[3]} />}
                            />
                        </div>
                        <TextField
                            margin="dense"
                            id="RaporttiAvain"
                            label={dictionary.AdminRaportti.Columns[6]}
                            type="text"
                            fullWidth
                            value={this.state.RaporttiAvain}
                            onChange={handleChange('RaporttiAvain')}
                        />
                        <FormControl fullWidth>
                            <InputLabel id="select-label-kieli">{dictionary.AdminRaportti.Columns[7]}</InputLabel>
                            <Select
                                labelId="select-label-kieli"
                                value={this.state.Kieli}
                                label={dictionary.AdminRaportti.Columns[7]}
                                onChange={handleChange('Kieli')}
                            >
                                <MenuItem value="fi">fi</MenuItem>
                                <MenuItem value="en">en</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            margin="dense"
                            id="RaporttiNimi"
                            label={dictionary.AdminRaportti.Columns[9]}
                            type="text"
                            fullWidth
                            value={this.state.RaporttiNimi}
                            onChange={handleChange('RaporttiNimi')}
                        />
                        <TextField
                            margin="dense"
                            id="RaporttiTiedostoNimi"
                            label={dictionary.AdminRaportti.Columns[10]}
                            type="text"
                            fullWidth
                            value={this.state.RaporttiTiedostoNimi}
                            onChange={handleChange('RaporttiTiedostoNimi')}
                        />
                        <TextField
                            margin="dense"
                            id="RaporttiKuvaus"
                            label={dictionary.AdminRaportti.Columns[11]}
                            type="text"
                            fullWidth
                            value={this.state.RaporttiKuvaus}
                            onChange={handleChange('RaporttiKuvaus')}
                        />
                        <TextField
                            margin="dense"
                            id="RaporttiTunnus"
                            label={dictionary.AdminRaportti.Columns[12]}
                            type="text"
                            fullWidth
                            value={this.state.RaporttiTunnus}
                            onChange={handleChange('RaporttiTunnus')}
                        />
                        <TextField
                            margin="dense"
                            id="Parametrit"
                            label={dictionary.AdminRaportti.Columns[13]}
                            type="text"
                            fullWidth
                            value={this.state.Parametrit}
                            onChange={handleChange('Parametrit')}
                        />
                        <TextField
                            margin="dense"
                            id="Tietojoukko"
                            label={dictionary.AdminRaportti.Columns[14]}
                            type="text"
                            fullWidth
                            value={this.state.Tietojoukko}
                            onChange={handleChange('Tietojoukko')}
                        />
                        <TextField
                            margin="dense"
                            id="Sivu"
                            label={dictionary.AdminRaportti.Columns[15]}
                            type="text"
                            fullWidth
                            value={this.state.Sivu}
                            onChange={handleChange('Sivu')}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={this.state.Suodattimet}
                                    onChange={(e) => this.setState({ Suodattimet: e.target.checked })}
                                />
                            }
                            label={dictionary.AdminRaportti.Columns[16]}
                            labelPlacement="start"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={this.state.Raporttisivut}
                                    onChange={(e) => this.setState({ Raporttisivut: e.target.checked })}
                                />
                            }
                            label={dictionary.AdminRaportti.Columns[17]}
                            labelPlacement="start"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={this.state.Kirjanmerkit}
                                    onChange={(e) => this.setState({ Kirjanmerkit: e.target.checked })}
                                />
                            }
                            label={dictionary.AdminRaportti.Columns[18]}
                            labelPlacement="start"
                        />
                        <TextField
                            margin="dense"
                            id="Nosto"
                            label={dictionary.AdminRaportti.Columns[19]}
                            type="text"
                            fullWidth
                            value={this.state.Asettelu}
                            onChange={handleChange('Asettelu')}
                        />
                        <TextField
                            margin="dense"
                            id="Nosto"
                            label={dictionary.AdminRaportti.Columns[20]}
                            type="text"
                            fullWidth
                            value={this.state.Nosto}
                            onChange={handleChange('Nosto')}
                        />
                        <TextField
                            margin="dense"
                            id="Lisatiedot"
                            label={dictionary.AdminRaportti.Columns[22]}
                            type="text"
                            fullWidth
                            value={this.state.Lisatiedot}
                            onChange={handleChange('Lisatiedot')}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" color="secondary" onClick={handleClose}>
                            {dictionary.Close}
                        </Button>
                        <Button variant="contained" color="secondary" style={{ color: "#fff" }} onClick={this.handleSave}>
                            {dictionary.Save}
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "AdminRaporttiEdit" })(AdminRaporttiEdit);
