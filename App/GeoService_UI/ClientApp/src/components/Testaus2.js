import { Box } from '@mui/material';
import React from 'react';
import { MapFrame } from './geslimap/mapframe';


export class Testaus2 extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            valmis: false
        };
    }

    componentDidMount() {
        const fetchOpts: RequestInit = {
            cache: "force-cache",
            referrerPolicy: "no-referrer-when-downgrade",
            headers: {
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'en-US,en;q=0.9,fi;q=0.8',
                'Connection': 'keep-alive',
                'Host': 'koletldatadev.blob.core.windows.net',
                'Accept': '*/*',
                'Origin': null,
                'Sec-Fetch-Dest': null,
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'en-US,en;q=0.9,fi;q=0.8'
            }
        };

        fetch("https://koletldatadev.blob.core.windows.net/publicfiles/pono_kosa.json", fetchOpts)
            .then(response => response.json())
            .then(data => {
                console.log("Valmis");
                this.setState({ valmis: true });
            });
    }

    // use media query -> Desktop / Mobile

    render() {
        return (
            <Box>
                {/*<MapFrame />*/}
                {this.state.valmis ? "Valmis" : "Ladataan..." }
            </Box>
        )
    }
}