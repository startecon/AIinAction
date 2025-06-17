import { Box } from '@mui/material';
import React from 'react';


export class Testaus1 extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            valmis: false
        };
    }

    // use media query -> Desktop / Mobile

    render() {
        return (
            <Box>
                <iframe title="kukkuu" src="/testaus2" width="1000px" height="1000px" />
            </Box>
        )
    }
}