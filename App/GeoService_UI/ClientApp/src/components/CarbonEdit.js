import React from "react";
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import Tooltip from "@mui/material/Tooltip";
import Grid from "@mui/material/Grid";
import Input from "@mui/material/Input";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { withStyles } from "@mui/styles";
import EditIcon from '@mui/icons-material/Edit';
import { LanguageContext } from './LanguageContext';

const defaultToolbarStyles = {
    iconButton: {
    },
};

var randomValue;

class CarbonEdit extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        var data = props.Daatta.filter(function (d) {
            return d.riviAvain == props.rowId;
        });

        this.state = {
            open: false,
            RiviAvain: data[0].riviAvain,
            Source: data[0].source,
            FuelType: data[0].fuelType,
            Amount: data[0].amount,
            Unit: data[0].unit,
            EmissionFactor: data[0].emissionFactor,
            Date: data[0].date
        };

    }

    static propTypes = {
        onEditRow: PropTypes.func,
        classes: PropTypes.object,
        blurOnSelect: PropTypes.bool
    };

    handleSave = () => {
        this.props.onEditRow({
            RiviAvain: this.state.RiviAvain,
            Source: this.state.Source,
            FuelType: this.state.FuelType,
            Amount: this.state.Amount,
            Unit: this.state.Unit,
            EmissionFactor: this.state.EmissionFactor,
            Date: this.state.Date
        });
        this.setState({ open: false });
    }

    handleSliderAmount = (event, value) => {
        this.setState({ Amount: parseInt(value) });
    };

    handleAmount = (event) => {
        this.setState({ Amount: (event.target.value === '' ? '' : parseInt(event.target.value)) });
    };

    handleSliderEmissionFactor = (event, value) => {
        this.setState({ EmissionFactor: parseInt(value) });

        randomValue = Math.floor(Math.random() * (3.000 - 300) + 300) / 100;
    };

    handleEmissionFactor = (event) => {
        this.setState({ EmissionFactor: (event.target.value === '' ? '' : parseInt(event.target.value)) });
    };

    render() {
        const { dictionary } = this.context;
        const { classes } = this.props;
        const { EmissionFactor, Amount } = this.state;

        const handleChange = name => event => {
            this.setState({ [name]: event.target.value });
        };

        var handleClickOpen = () => {
            this.setState({ open: true });
        }

        var handleClose = () => {
            this.setState({ open: false });
        }

        const handleBlurAmount = () => {
            if (Amount < 0) {
                this.setState({ Amount: 0 });
            } else if (Amount > 60) {
                this.setState({ Amount: 60 });
            }
        };

        const handleBlurEmission = () => {
            if (EmissionFactor < 0) {
                this.setState({ co2: 0 });
            } else if (EmissionFactor > 100) {
                this.setState({ co2: 60 });
            }
        };


        return (
            <React.Fragment>
                <Tooltip title={dictionary.Toolbar.Edit}>
                    <IconButton className={classes.iconButton} onClick={handleClickOpen}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>

                <Dialog open={this.state.open} onClose={handleClose} maxWidth={false} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">{dictionary.AdminRooli.Title}</DialogTitle>
                    <form onSubmit={this.handleSave}>
                        <DialogContent style={{ width: "650px" }}>
                            <input type="hidden" value={this.state.RiviAvain} />

                            <FormControl style={{ width: "650px", paddingBottom: "15px" }}>
                                <InputLabel htmlFor="source" style={{ paddingTop: '0px' }}>{dictionary.Carbon.Columns[1]}</InputLabel>
                                <Select fullWidth id="source" value={this.state.Source} onChange={handleChange('Source')}>
                                    <MenuItem value={dictionary.Carbon.Sources[0]}>{dictionary.Carbon.Sources[0]}</MenuItem>
                                    <MenuItem value={dictionary.Carbon.Sources[1]}>{dictionary.Carbon.Sources[1]}</MenuItem>
                                    <MenuItem value={dictionary.Carbon.Sources[2]}>{dictionary.Carbon.Sources[2]}</MenuItem>
                                    <MenuItem value={dictionary.Carbon.Sources[3]}>{dictionary.Carbon.Sources[3]}</MenuItem>
                                    <MenuItem value={dictionary.Carbon.Sources[4]}>{dictionary.Carbon.Sources[4]}</MenuItem>
                                </Select>
                            </FormControl>

                            <div style={{ display: "flex", paddingBottom: "20px" }}>
                                <FormControl style={{ width: "300px", paddingRight: "50px" }}>
                                    <InputLabel htmlFor="unit" style={{ paddingTop: '0px' }}>{dictionary.Carbon.Columns[4]}</InputLabel>
                                    <Select fullWidth id="unit" value={this.state.Unit} onChange={handleChange('Unit')}>
                                        <MenuItem value={this.state.Unit}>
                                            <em>{this.state.Unit}</em>
                                        </MenuItem>
                                        <MenuItem value={dictionary.Carbon.Units[0]}>{dictionary.Carbon.Units[0]}</MenuItem>
                                        <MenuItem value={dictionary.Carbon.Units[1]}>{dictionary.Carbon.Units[1]}</MenuItem>
                                        <MenuItem value={dictionary.Carbon.Units[2]}>{dictionary.Carbon.Units[2]}</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl style={{ width: "300px" }}>
                                    <InputLabel htmlFor="fueltype" style={{ paddingTop: '0px' }}>{dictionary.Carbon.Columns[2]}</InputLabel>
                                    <Select fullWidth id="fueltype" value={this.state.FuelType} onChange={handleChange('FuelType')}>
                                        <MenuItem value={dictionary.Carbon.FuelTypes[0]}>{dictionary.Carbon.FuelTypes[0]}</MenuItem>
                                        <MenuItem value={dictionary.Carbon.FuelTypes[1]}>{dictionary.Carbon.FuelTypes[1]}</MenuItem>
                                        <MenuItem value={dictionary.Carbon.FuelTypes[2]}>{dictionary.Carbon.FuelTypes[2]}</MenuItem>
                                        <MenuItem value={dictionary.Carbon.FuelTypes[3]}>{dictionary.Carbon.FuelTypes[3]}</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>

                            <div>
                                <Typography id="input-date" gutterBottom>Date</Typography>
                                <TextField
                                    id="date"
                                    type="date"
                                    onChange={handleChange('Date')}
                                    fullWidth
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    defaultValue={this.state.Date}
                                />
                            </div>

                            <Grid container spacing={2} alignItems="center" style={{ width: "650px" }}>
                                <Grid item lg={12}>
                                    <Typography id="input-slider-amount" gutterBottom>
                                        {dictionary.Carbon.Columns[3]}
                                    </Typography>
                                </Grid>
                                <Grid item xs>
                                    <Slider
                                        value={typeof this.state.Amount === 'number' ? this.state.Amount : 0}
                                        step={1}
                                        min={0}
                                        max={100}
                                        fullwidth
                                        onChangeCommitted={this.handleSliderAmount}
                                        aria-labelledby="input-slider-amount"
                                    />
                                </Grid>
                                <Grid item>
                                    <Input
                                        margin="dense"
                                        value={this.state.Amount}
                                        onBlur={handleBlurAmount}
                                        inputProps={{
                                            step: 1,
                                            min: 0,
                                            max: 1000,
                                            type: 'number',
                                            'aria-labelledby': 'input-slider-amount',
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} alignItems="center" style={{ width: "650px" }}>
                                <Grid item lg={12}>
                                    <Typography id="input-slider-emissionfactor" gutterBottom>
                                        {dictionary.Carbon.Label2}
                                    </Typography>
                                </Grid>
                                <Grid item xs>
                                    <Slider
                                        value={typeof this.state.EmissionFactor === 'number' ? this.state.EmissionFactor : 0}
                                        step={1}
                                        min={0}
                                        max={100}
                                        fullwidth
                                        onChangeCommitted={this.handleSliderEmissionFactor}
                                        aria-labelledby="input-slider-emissionfactor"
                                    />
                                </Grid>
                                <Grid item>
                                    <Input
                                        margin="dense"
                                        value={this.state.EmissionFactor}
                                        onBlur={handleBlurEmission}
                                        inputProps={{
                                            step: 1,
                                            min: 0,
                                            max: 1000,
                                            type: 'number',
                                            'aria-labelledby': 'input-slider-emissionfactor',
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <div style={{ width: "650px", paddingBottom: "15px" }}>
                                <Typography id="input-slider-emissionfactor" gutterBottom>
                                    {dictionary.Carbon.Label1[0]}<sub>{dictionary.Carbon.Label1[1]}</sub>
                                </Typography>
                                <TextField
                                    id="Nimi"
                                    type="text"
                                    required
                                    value={randomValue}
                                    fullWidth
                                    onChange={handleChange('EmissionFactor')}
                                    disabled
                                />
                            </div>

                        </DialogContent>
                        <DialogActions style={{ paddingRight: "24px" }}>
                            <Button onClick={this.handleSave} color="primary">
                                {dictionary.Ok}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "CarbonEdit" })(CarbonEdit);
