import React from 'react';
import { TextField, Button, Autocomplete, Box, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import ReplyIcon from '@mui/icons-material/Reply';
import WindPowerInfo from './WindPowerInfo';
import CloseIcon from '@mui/icons-material/Close';
import ChartFromAPI from './ChartFromAPI';

const countries = [
    { label: 'Finland', disabled: false },
    { label: 'Italy', disabled: true },
    { label: 'Nepal', disabled: true },
    { label: 'Germany', disabled: true },
];

export class EcoWind extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedCountry: null,
            inputValue: '',
            chartVisible: false,
            documentationOpen: false,
        };
    }

    handleInputChange = (event, newInputValue) => {
        this.setState({ inputValue: newInputValue });
    };

    handleChange = (event, newValue) => {
        this.setState({ selectedCountry: newValue });
    };

    handleSearch = () => {
        const selected = this.state.selectedCountry;

        if (selected && !selected.disabled) {
            if (selected.label === 'Finland') {
                this.setState({ chartVisible: true });
            }
        } else {
            alert('Only "Finland" is selectable at the moment.');
        }
    };

    openDoc = () => {
        this.setState({ documentationOpen: true });
    };

    closeDoc = () => {
        this.setState({ documentationOpen: false });
    };

    render() {
        return (
        <>
            <div style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '4rem',
                background: 'linear-gradient(90deg, #FF6500 0%, #FF0095 100%)',
                color: 'white',
                userSelect: 'none',
                overflow: 'auto',
            }}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            marginBottom: '3rem',
                        }}
                    >
                        <h1 style={{ fontWeight: 'bold', fontSize: '5rem', margin: 0 }}>
                            EcoWind
                        </h1>
                        <p style={{ fontWeight: 'bold', fontSize: '2rem', margin: 0 }}>
                            Wind forecasting with AI
                        </p>
                    </div>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '90vw',
                            maxWidth: '1000px',
                            marginBottom: '2rem',
                        }}
                    >
                        <Box sx={{ flex: 1 }} />  {/* keskitila tyhjäkke jotta kaikki palikat asettuu oikein */}

                        <Box sx={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                            <Autocomplete
                                options={countries}
                                getOptionLabel={(option) => option.label}
                                isOptionEqualToValue={(option, value) => option.label === value?.label}
                                value={this.state.selectedCountry}
                                onChange={(event, newValue) => {
                                    if (!newValue?.disabled) {
                                        this.setState({ selectedCountry: newValue });
                                    }
                                }}
                                renderOption={(props, option) => (
                                    <li
                                        {...props}
                                        style={{
                                            opacity: option.disabled ? 0.5 : 1,
                                            pointerEvents: option.disabled ? 'none' : 'auto',
                                        }}
                                    >
                                        {option.label}
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Select a country"
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '50px',
                                                backgroundColor: '#FDAE44',
                                                height: 56,
                                                '& input::placeholder': {
                                                    color: '#000',
                                                    opacity: 1,
                                                },
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderRadius: '50px',
                                            },
                                        }}
                                    />
                                )}
                                disableClearable
                                sx={{ width: 400 }}
                            />
                            <Button
                                variant="contained"
                                onClick={this.handleSearch}
                                sx={{
                                    backgroundColor: '#FDAE44',
                                    borderRadius: '50px',
                                    minWidth: '64px',
                                    height: 56,
                                    '&:hover': { backgroundColor: '#e55a00' },
                                }}
                            >
                                <SearchIcon sx={{ fontSize: '2rem' }} />
                            </Button>
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                onClick={this.openDoc}
                                sx={{
                                    backgroundColor: '#FDAE44',
                                    borderRadius: '50px',
                                    minWidth: '56px',
                                    height: 56,
                                    '&:hover': { backgroundColor: '#e55a00' },
                                }}
                            >
                                <DescriptionIcon sx={{ fontSize: '2rem' }} />
                            </Button>
                        </Box>
                    </Box>
                    <Dialog
                        open={this.state.documentationOpen}
                        onClose={this.closeDoc}
                        maxWidth="lg"
                        scroll="paper"
                        PaperProps={{
                            sx: {
                                width: '50vw',
                                margin: 'auto',
                            }
                        }}
                    >
                        <DialogTitle
                            sx={{
                                m: 0,
                                p: 2,
                                display: 'flex',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <IconButton
                                aria-label="close"
                                onClick={this.closeDoc}
                                sx={{
                                    color: (theme) => theme.palette.grey[500],
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent dividers style={{ padding: '2rem' }}>
                            <WindPowerInfo />
                        </DialogContent>
                    </Dialog>

                    {this.state.chartVisible ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column' },
                                justifyContent: 'center',
                                alignItems: 'stretch',
                                gap: 4,
                                marginTop: '4rem',
                                padding: 4,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '20px',
                                maxWidth: '90vw',
                                width: '100%',
                                boxSizing: 'border-box',
                                position: 'relative',
                            }}
                        >
                            <Button
                                startIcon={<ReplyIcon />}
                                variant="contained"
                                onClick={() => {
                                    console.log('Nappia klikattu');
                                    this.setState({ chartVisible: false });
                                }}

                                sx={{
                                    position: 'absolute',
                                    top: '2rem',
                                    left: '2rem',
                                    display: 'flex',
                                    borderRadius: '50px',
                                    flexShrink: 0,
                                    backgroundColor: '#FDAE44',
                                    '&:hover': { backgroundColor: '#e55a00' },
                                }}
                            >
                                Go back
                            </Button>
                            <Box sx={{ color: 'white', fontSize: '1.25rem', textAlign: 'center', }}>
                                <h3 style={{ margin: 0, marginBottom: '1rem', whiteSpace: 'pre-line' }}>
                                    Here is the wind forecast for Finland
                                </h3>
                            </Box>

                            {/* Chart */}
                            <Box
                                sx={{
                                    minHeight: '200px',
                                    maxWidth: '100%',
                                }}
                            >
                                <ChartFromAPI/>
                            </Box>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: 'center',
                                alignItems: 'stretch',
                                gap: 4,
                                marginTop: '4rem',
                                padding: 4,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '20px',
                                maxWidth: '90vw',
                                width: '100%',
                                boxSizing: 'border-box',
                                position: 'relative',
                            }}
                        >
                            <Box sx={{ flex: '1 1 300px', color: 'white', fontSize: '1.25rem', textAlign: 'left' }}>
                                <h3 style={{ margin: 0, marginBottom: '1rem', whiteSpace: 'pre-line' }}>
                                    We're here to change the game.
                                </h3>
                                <p style={{ margin: 0, whiteSpace: 'pre-line', marginBottom: '0.5rem' }}>
                                    We have only one planet and we're committed to doing our part to save it.
                                </p>
                                <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
                                    At EcoWind we harness the power of artificial intelligence to make wind energy smarter, cleaner, and more efficient. Our advanced forecasting models predict wind patterns with exceptional accuracy, helping wind farms optimize turbine performance and reduce downtime.
                                </p>
                                <p style={{ margin: 0, whiteSpace: 'pre-line', marginTop: '0.5rem' }}>
                                    Join us in shaping a more sustainable future — one gust at a time.
                                </p>
                            </Box>
                            <iframe
                                width="550"
                                height="500"
                                src="https://www.youtube.com/embed/hsMuEPkiRrs?start=3696"
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ borderRadius: '20px', flex: '1 1 400px' }}
                            ></iframe>
                        </Box>
                    )}
                </div>
            </>
        );
    }
}
