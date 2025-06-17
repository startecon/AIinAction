import React from 'react';
import { Link, Redirect, useLocation } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';
import { languageOptions } from './../translations';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { authFetch, authPost, authProvider, logOut } from "./../authProvider";
import AccountCircle from '@mui/icons-material/AccountCircle';
//import { AzureAD } from 'react-aad-msal';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import { FeatureTrim } from './FeatureTrim';


const MenuTypo = (props) => {
    return <Typography textAlign="center" color="textPrimary" style={{ textDecoration: "none" }}>{props.children}</Typography>;
}

const MenuTypoWhite = (props) => {
    return <MenuButton><Typography textAlign="center" style={{ color: "#fff" }}>{props.children}</Typography></MenuButton>;
}

const MenuButton = (props) => {
    return <Button size="large" onClick={props.onClick} style={{ fontWeight: "bold", fontSize: "17pt" }}>{props.children}</Button>;
}

//TODO:THEME
const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '250px',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

//TODO:THEME
const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: '0px 8px',
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

//TODO:THEME
const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: '8px 8px 8px 32px',
        // vertical padding + font size from searchIcon
        //paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%'
    },
}));

export class NavMenu extends React.Component {
    static contextType = LanguageContext;

    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.toggleLanguage = this.toggleLanguage.bind(this);
        this.toggleAdmin = this.toggleAdmin.bind(this);
        this.toggleFIST = this.toggleFIST.bind(this);
        this.toggleAgentti = this.toggleAgentti.bind(this);
        this.toggleTehtava = this.toggleTehtava.bind(this);
        this.toggleAnalytiikka = this.toggleAnalytiikka.bind(this);
        this.toggleMallirekisteri = this.toggleMallirekisteri.bind(this);
        this.toggleMe = this.toggleMe.bind(this);

        this.state = {
            features: [],
            fist_url: null,
            fist_name: null,
            navTransparent: true,
            path: null,
            home: true,
            logoSize: "160px",
            isAdmin: false,
            profiilinimi: null,
            data: null,

            showNavbar: false,
            anchorNavbar: null,
            showLanguage: false,
            anchorLanguage: null,
            showAdmin: false,
            anchorAdmin: null,
            showFIST: false,
            anchorFIST: null,
            showAgentti: false,
            anchorAgentti: null,
            showTehtava: false,
            anchorTehtava: null,
            showAnalytiikka: false,
            anchorAnalytiikka: null,
            showMallirekisteri: false,
            anchorMallirekisteri: null,
            showMe: false,
            anchorMe: null,
        };

        //asetuksien näkyvyys
        authFetch(this.props.pca, 'api/Navbar/IsAdmin')
            .then(response => response.text())
            .then(data => {
                var isadmin = data ? true : false;
                this.setState({ isAdmin: isadmin })
            });

        //featuret
        authFetch(this.props.pca, 'api/Toiminnot/Read')
            .then(response => response.json())
            .then(data => {
                var features = data.filter(d => d.aktivoitu).map(d => d.toiminto); //.filter((v, i, a) => a.indexOf(v) == i); //uniikit
                this.setState({ features: features })
            });

        //Profiili
        authFetch(this.props.pca, 'api/Profiili/Read')
            .then(response => response.json())
            .then(data => {
                this.setState({ profiilinimi: data.username, data: data })
            });

        //feature storet
        authFetch(this.props.pca, 'api/Settings/FistList')
            .then(response => response.json())
            .then(data => {
                this.setState({ fist_url: data.url, fist_name: data.name })
            });
    }

    editItem = (newrow) => {
        // EDIT
        authPost(this.props.pca, 'api/Roolit/Profiili/Update', {
            method: 'PUT',
            body: JSON.stringify(newrow)
        })
    }

    toggleNavbar = (event) => {
        this.setState({
            showNavbar: !this.state.showNavbar,
            anchorNavbar: event.currentTarget
        });
    }

    toggleLanguage = (event) => {
        this.setState({
            showLanguage: !this.state.showLanguage,
            anchorLanguage: event.currentTarget
        });
    }

    toggleAdmin = (event) => {
        this.setState({
            showAdmin: !this.state.showAdmin,
            anchorAdmin: event.currentTarget
        });
    }

    toggleFIST = (event) => {
        this.setState({
            showFIST: !this.state.showFIST,
            anchorFIST: event.currentTarget
        });
    }

    toggleAgentti = (event) => {
        this.setState({
            showAgentti: !this.state.showAgentti,
            anchorAgentti: event.currentTarget
        });
    }

    toggleTehtava = (event) => {
        this.setState({
            showTehtava: !this.state.showTehtava,
            anchorTehtava: event.currentTarget
        });
    }

    toggleAnalytiikka = (event) => {
        this.setState({
            showAnalytiikka: !this.state.showAnalytiikka,
            anchorAnalytiikka: event.currentTarget
        });
    }

    toggleMallirekisteri = (event) => {
        this.setState({
            showMallirekisteri: !this.state.showMallirekisteri,
            anchorMallirekisteri: event.currentTarget
        });
    }

    toggleMe = (event) => {
        this.setState({
            showMe: !this.state.showMe,
            anchorMe: event.currentTarget
        });
    }

    render() {
        const { userLanguage, userLanguageChange, dictionary } = this.context;
        const { anchorNavbar, anchorLanguage, anchorAdmin, anchorAgentti, anchorTehtava, anchorAnalytiikka, anchorMallirekisteri, anchorMe,
            showNavbar, showLanguage, showAdmin, showAgentti, showTehtava, showAnalytiikka, showMallirekisteri, showMe, features, profiilinimi, showFIST, anchorFIST, fist_url, fist_name } = this.state;

        const handleLanguageChange = (event) => {
            this.setState({
                showLanguage: !this.state.showLanguage,
                anchorLanguage: event.currentTarget
            });
            userLanguageChange((event.currentTarget.dataset || {}).lang);
        }

        const valikko = (iso) => {
            return [
                (
                    <FeatureTrim key={3} features={features} feature="UiAnalytiikka" >
                        <MenuItem>
                            <Link style={{ textDecoration: 'none' }} to={false} onClick={this.toggleAnalytiikka}>
                                {iso ? (<MenuTypoWhite>{dictionary.NavMenu.Analytiikka.Analytiikka}</MenuTypoWhite>) : (<MenuTypo>{dictionary.NavMenu.Analytiikka.Analytiikka}</MenuTypo>)}
                            </Link>
                            <Menu anchorEl={anchorAnalytiikka} open={showAnalytiikka} onClose={this.toggleAnalytiikka}>
                                <FeatureTrim features={features} feature="UiAnKulutus">
                                    <Link to="/routing" style={{ textDecoration: "none" }}><MenuItem><MenuTypo>{dictionary.NavMenu.Analytiikka.Kulutus}</MenuTypo></MenuItem></Link>
                                </FeatureTrim>
                            </Menu>
                        </MenuItem>
                    </FeatureTrim>
                ),
                (
                    <FeatureTrim key={4} features={features} feature="UiAsetukset" >
                        <MenuItem>
                            <Link style={{ textDecoration: 'none' }} to={false} onClick={this.toggleAdmin}>
                                {iso ? (<MenuTypoWhite>{dictionary.NavMenu.Asetukset.Asetukset}</MenuTypoWhite>) : (<MenuTypo>{dictionary.NavMenu.Asetukset.Asetukset}</MenuTypo>)}
                            </Link>
                            <Menu anchorEl={anchorAdmin} open={showAdmin} onClose={this.toggleAdmin}>
                                <FeatureTrim features={features} feature="UiProfiili">
                                    <Link to="/profiilit" style={{ textDecoration: "none" }}><MenuItem><MenuTypo>{dictionary.NavMenu.Asetukset.Kayttajat}</MenuTypo></MenuItem></Link>
                                </FeatureTrim>
                                <FeatureTrim features={features} feature="UiRooli">
                                    <Link to="/roolit" style={{ textDecoration: "none" }}><MenuItem><MenuTypo>{dictionary.NavMenu.Asetukset.Roolit}</MenuTypo></MenuItem></Link>
                                </FeatureTrim>
                                <FeatureTrim features={features} feature="UiRoolit">
                                    <Link to="/profiiliroolit" style={{ textDecoration: "none" }}><MenuItem><MenuTypo>{dictionary.NavMenu.Asetukset.Kayttajienroolit}</MenuTypo></MenuItem></Link>
                                </FeatureTrim>
                                <FeatureTrim features={features} feature="UiRooliOikeudet">
                                    <Link to="/roolioikeudet" style={{ textDecoration: "none" }}><MenuItem><MenuTypo>{dictionary.NavMenu.Asetukset.Kayttooikeudet}</MenuTypo></MenuItem></Link>
                                </FeatureTrim>
                                <FeatureTrim features={features} feature="UiTila">
                                    <Link to="/tila" style={{ textDecoration: "none" }}><MenuItem><MenuTypo>{dictionary.NavMenu.Asetukset.Tilat}</MenuTypo></MenuItem></Link>
                                </FeatureTrim>
                                <FeatureTrim features={features} feature="UiToiminnot">
                                    <Link to="/toiminnot" style={{ textDecoration: "none" }}><MenuItem><MenuTypo>{dictionary.NavMenu.Asetukset.Toiminnot}</MenuTypo></MenuItem></Link>
                                </FeatureTrim>
                                <FeatureTrim features={features} feature="UiPalvelupaketti">
                                    <Link to="/palvelupaketti" style={{ textDecoration: "none" }}><MenuItem><MenuTypo>{dictionary.NavMenu.Asetukset.Plans}</MenuTypo></MenuItem></Link>
                                </FeatureTrim>
                                <FeatureTrim features={features} feature="UiMarketplace">
                                    <Link to="/marketplace" style={{ textDecoration: "none" }}><MenuItem><MenuTypo>{dictionary.NavMenu.Asetukset.Marketplace}</MenuTypo></MenuItem></Link>
                                </FeatureTrim>
                            </Menu>
                        </MenuItem>
                    </FeatureTrim>
                )
            ];
        };

        return (
            <AppBar color="primary" elevation={3} position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="medium"
                                onClick={this.toggleNavbar}
                                color="inherit"
                            >
                                <MenuIcon style={{ fill: '#fff' }} />
                            </IconButton>
                            <Menu
                                anchorEl={anchorNavbar}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={showNavbar}
                                onClose={this.toggleNavbar}
                                sx={{
                                    display: { xs: 'block', md: 'none' },
                                }}>
                                {valikko(0).map(x => (x))}
                            </Menu>
                        </Box>
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }} >
                            <Link to="/"><img src={"/images/logo/gesli-logo-horizontal-transparent-background.png"} id="logo" width={this.state.logoSize} /></Link>
                        </Box>
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {valikko(1).map(x => (x))}
                        </Box>

                        <Box sx={{ flexGrow: 0 }}>
                            <Search>
                                <SearchIconWrapper>
                                    <SearchIcon style={{ color: "#fff" }} />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder={dictionary.NavMenu.Search}
                                    inputProps={{ 'aria-label': 'search' }}
                                />
                            </Search>
                        </Box>
                        <Box sx={{ flexGrow: 0 }}>
                            <IconButton aria-label="account of current user" aria-controls="menu-appbar" aria-haspopup="true" onClick={this.toggleMe} style={{ color: "#fff" }}>
                                <AccountCircle style={{ color: "#fff" }} />
                            </IconButton>
                            <React.Fragment>
                                <Menu anchorEl={anchorMe} open={showMe} onClose={this.toggleMe}>
                                    <MenuItem>{profiilinimi}</MenuItem>
                                    <MenuItem onClick={this.toggleLanguage}>{dictionary.displayName}</MenuItem>
                                    <MenuItem onClick={logOut}>{dictionary.NavMenu.Logout}</MenuItem>
                                </Menu>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    anchorEl={anchorLanguage}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={showLanguage}
                                    onClose={this.toggleLanguage}
                                    style={{ zIndex: 10000 }}

                                >
                                    {
                                        Object.entries(languageOptions).map(([id, name]) => (
                                            <MenuItem key={id} data-lang={id} onClick={handleLanguageChange}>
                                                <MenuTypo>{name}</MenuTypo>
                                            </MenuItem>
                                        ))
                                    }
                                </Menu>
                            </React.Fragment>
                        </Box>
                    </Toolbar>
                </Container >
            </AppBar >
        );
    }
}
