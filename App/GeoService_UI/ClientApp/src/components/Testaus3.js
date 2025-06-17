import { Box } from '@mui/material';
import React from 'react';
import { MapFrame } from './geslimap/mapframe';


export class Testaus3 extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            kunnat: null
        };
    }

    // use media query -> Desktop / Mobile

    render() {
        return (
            <Box>
                <MapFrame data={this.state.kunnat} />
            </Box>
        )
    }
}