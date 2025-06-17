import React from 'react';
import { Link, Redirect, useLocation } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';
import { languageOptions } from './../translations';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
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
import TextField from '@mui/material/TextField';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import { FeatureTrim } from './FeatureTrim';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { FormControl } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MailIcon from '@mui/icons-material/Mail';

const questbacklink_fi = "https://response.questback.com/ktikiinteisttietooy/5ao7xuvkox";
const questbacklink_en = "https://response.questback.com/isa/qbv.dll/bylink?p=ffKgHp6I8LO04bIGKSERK8kXWOQLG1wEgdk9K2WhQvno2t5S_KZmpU5BZGsxBoUW0";

export class LocalMenu extends React.Component {
    static contextType = LanguageContext;

    constructor(props) {
        super(props);

        this.state = {
            features: [],
            menuOpen: false,
            anchorEl: null,
            searchText: "",
            title: props.title,
            menuItems: props.menuItems,
            selectedId: props.selectedId,
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedId !== this.props.selectedId
            || prevProps.title !== this.props.title) {
            this.setState({
                title: this.props.title,
                menuItems: this.props.menuItems,
                selectedId: this.props.selectedId,
            });
        }
    }

    render() {
        const { userLanguage, dictionary } = this.context;
        const { onSelectChange, onSearchClicked } = this.props;
        const { title, menuItems, selectedId, menuOpen, anchorEl, searchText } = this.state;

        const report = (menuItems || []).filter(d => (d.id == selectedId))[0] || {};
        // id, name, info

        const handleChange = name => event => {
            this.setState({ [name]: event.target.value });
        };

        const handleOpen = (e) => {
            this.setState({
                menuOpen: true,
                anchorEl: e.currentTarget
            })
        };

        const handleClose = (e) => {
            this.setState({
                menuOpen: false,
                anchorEl: null
            })
        };

        const handleSelect = value => event => {
            onSelectChange(value);
            handleClose();
        }

        return (
            <AppBar elevation={4} style={{ background: "#fff", height: 56, paddingLeft: 58 }}>
                <Toolbar style={{ minHeight: 56 }}>
                    <Typography style={{ color: "#212121", fontWeight: "bold" }} variant="subtitle1" component="div">
                        {title}
                    </Typography>

                    {menuItems && menuItems.length > 1 ? (
                        <div style={{ display: "flex" }}>
                            <NavigateNextIcon fontSize="small" sx={{ margin: "auto", width: 24, color: "#212121" }} />
                            <div
                                onClick={handleOpen}
                                style={{ width: 380, backgroundColor: "#ddd", display: "flex" }}
                                sx={{ textTransform: "none" }}
                            >
                                <Typography style={{ marginLeft: 6, paddingTop: 4, color: "#212121", fontWeight: "bold" }} variant="subtitle1" component="div">
                                    {report.name}
                                </Typography>
                                <Box sx={{ flexGrow: 1 }} />
                                <div style={{ borderLeft: "1px solid #ccc", paddingTop: 4 }}>
                                    {menuOpen ? <ExpandLess sx={{ margin: "auto", width: 24, color: "#212121" }} /> : <ExpandMore sx={{ width: 24, color: "#212121" }} />}
                                </div>
                            </div>
                            <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleClose}>
                                {(menuItems || []).map((d) => (<MenuItem key={d.id} value={d.id} sx={{ width: 380, backgroundColor: (d.id == selectedId) ? "#ddd" : "inherit" }} onClick={handleSelect(d.id)}>{d.name}</MenuItem>))}
                            </Menu>
                        </div>
                    ) : null}

                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: { sm: 'none', md: 'flex' } }}>
                        <Typography style={{ marginRight: 16, color: "#212121" }} variant="caption" component="div">
                            {report.info}
                        </Typography>
                    </Box>
                    <Box sx={{ display: { sm: 'none', lg: 'flex' } }}>
                        {/* Myöhemmin
                        <OutlinedInput
                            color="secondary"
                            type={'text'}
                            value={searchText}
                            onChange={handleChange("searchText")}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="search"
                                        type="button"
                                        sx={{ p: '10px' }}
                                        edge="end"
                                        onClick={() => onSearchClicked(searchText)}
                                    >
                                        <SearchIcon color="secondary" />
                                    </IconButton>
                                </InputAdornment>
                            }
                            placeholder={dictionary.LocalMenu.Search}
                            sx={{
                                borderColor: "#EE8723",
                                height: 36,
                                '& label.Mui-focused': {
                                    color: '#EE8723',
                                },
                                '& .MuiInput-underline:after': {
                                    borderBottomColor: '#EE8723',
                                },
                                '& .MuiInputBase-input': {
                                    color: "#212121"
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#EE8723 !important',
                                    '& fieldset': {
                                        borderColor: '#EE8723',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#EE8723',
                                    },
                                }
                            }}
                        />
                        <Divider sx={{ m: 1, borderColor: "#fff" }} orientation="vertical" flexItem />
                        */}
                        <Button color="secondary" variant="contained" sx={{ color: "#fff", height: 36 }} href={(userLanguage == "fi" ? questbacklink_fi : questbacklink_en)} target="_blank">{dictionary.LocalMenu.Contact}</Button>
                    </Box>
                    <Box sx={{ display: { sm: 'flex', lg: 'none' } }}>
                        <IconButton href={(userLanguage == "fi" ? questbacklink_fi : questbacklink_en)} target="_blank" size="large">
                            <MailIcon color="secondary" />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar >
        );
    }
}
