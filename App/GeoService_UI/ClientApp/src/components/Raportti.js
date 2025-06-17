import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Grid, Fab, Typography, TextField, Button, Tooltip, CardMedia, InputLabel, Input, FormControl, Fade } from '@mui/material';
import { LanguageContext } from './LanguageContext';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import { authFetch, authPost } from "./../authProvider";
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

const API_PREFIX = 'api/Raportti';
const PROFIILI_GET = 'api/Profiili/Read';
const PROFIILI_PUT = 'api/Profiili/Update';

var updatedList;

const ReportCard = (props) => {
    return (
        <Grid item>
            <Fade in={true}>
                <Card sx={{ maxWidth: 385 }}>
                    <CardMedia
                        component="img"
                        height="140"
                        image={props.image}
                        alt="green iguana"
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {props.name}
                        </Typography>
                        <Typography variant="body2" color="iconText">
                            {props.text}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small" color="primary" href={props.linkUrl} target="_self">Avaa</Button>
                    </CardActions>
                </Card>
            </Fade>
        </Grid>
    )
}

export class Raportti extends React.Component {
    static contextType = LanguageContext;

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            filteredData: []
        };
    }

    componentDidMount() {
        authFetch(this.props.pca, API_PREFIX + '/Read')
            .then(response => response.json())
            .then(data => {
                var items = data
                var lang = this.context.userLanguage;

                let raportit = items.filter(function (d) {
                    return d.kieli == lang;
                });

                console.log(raportit);
                this.setState({ data: raportit, filteredData: raportit })
            });
    }

    changeLang = () => {

    }

    change = (e) => {
        var query = e.target.value;


        if (query == '') {
            updatedList = this.state.data
            this.setState({ filteredData: updatedList });
        }
        else { 
            updatedList = this.state.filteredData
            updatedList = updatedList.filter((item) => {
                return (item.raporttiNimi.toLowerCase().indexOf(query.toLowerCase()) !== -1 || item.raporttiKuvaus.toLowerCase().indexOf(query.toLowerCase()) !== -1);
            });
            this.setState({ filteredData: updatedList });
        }
    }

    OpenNewWindow = (e) => {
        e.preventDefault();

        var url = null
        fetch('api/Login/GetLink')
            .then(response => response.text())
            .then(data => {
                url = data;
                if (url) {
                    window.open(url, '_blank').focus();
                }
            });

    }

    handleLogEvent = (e, tar, act, info, url) => {
        e.preventDefault();

        fetch('api/EventLoger/Create', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                target: tar,
                action: act,
                info: info
            })
        })

        if (url) {
            window.open(url, '_blank').focus();
        }
    }

    render() {
        const { userLanguage, dictionary } = this.context;

        const makeLink = (reportId, datasetId, pageId, filters, pageNavigation, bookmarks, displayOption) => {
            return `/powerbi?reportId=${reportId}&datasetId=${datasetId}&pageId=${pageId}&filters=${filters}&pageNavigation=${pageNavigation}&bookmarks=${bookmarks}&displayOption=${displayOption}`;
        }

        return (
                <div>
                    {(this.state.loading) ? (
                        <CircularProgress />
                        ) : (
                        <Container maxWidth="xl" style={{ marginTop: "20px" }}>
                            <Typography variant="h2" color="iconText" style={{ fontSize: "36px" }}>Raportit</Typography>
                            <Typography variant="subtitle1" color="iconText">Subheader teksti tähän</Typography>

                            <FormControl sx={{ m: 1 }} variant="standard">
                            {/*<InputLabel htmlFor="standard-adornment-amount">Amount</InputLabel>*/}
                                <Input
                                    id="standard-adornment-amount"
                                    onChange={(e) => this.change(e) }
                                    startAdornment={<SearchIcon position="start" color="iconText">$</SearchIcon>}
                                    style={{ width: "360px" }}
                                />
                            </FormControl>

                            <Grid container spacing={5} justifyContent="space-between" direction="row">
                                {(this.state.filteredData != []) ? (
                                    this.state.filteredData.map((item, i) =>
                                        <ReportCard
                                            key={i}
                                            id={item.riviAvain}
                                            name={item.raporttiNimi}
                                            text={item.raporttiKuvaus}
                                            image={item.kuva}
                                            linkUrl={makeLink(item.raporttiTunnus, item.tietojoukko, item.sivu, item.suodattimet, item.raporttisivut, item.kirjanmerkit, item.asettelu)} />
                                    )) : ( null )}
                            </Grid>
                        </Container>
                        )}
                </div>
        );
    }
}

/*
        public int RiviAvain { get; set; }
		public int RyhmaAvain { get; set; }
		public int TyyppiAvain { get; set; }
		public string RaporttiAvain { get; set; }
		public string Kieli { get; set; }
		public string RaporttiNimi { get; set; }
		public string RaporttiTiedostoNimi { get; set; }
		public string RaporttiKuvaus { get; set; }
		public string RaporttiTunnus { get; set; }
		public string Parametrit { get; set; }
		public string Tietojoukko { get; set; }
		public string Sivu { get; set; }
		public bool? Suodattimet { get; set; }
		public bool? Raporttisivut { get; set; }
		public bool? Kirjanmerkit { get; set; }
		public string Asettelu { get; set; }
		public string Nosto { get; set; }
		public string Lisatiedot { get; set; }
		public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
        public string Username { get; set; }
        public bool? Active { get; set; }
        public string Kuva { get; set; }                          
*/