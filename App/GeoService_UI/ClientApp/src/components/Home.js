import { Box } from '@mui/material';
import React from 'react';
import { HomeDesktop } from './HomeDesktop';
import { HomeMobile } from './HomeMobile';


export class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    // use media query -> Desktop / Mobile

    render() {
        return (
            <div>
                <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}>
                    <HomeDesktop pca={this.props.pca} />
                </Box>
                <Box sx={{ flexGrow: 1, display: { xs: 'block', md: 'none' } }}>
                    <HomeMobile pca={this.props.pca} />
                </Box>
            </div>
        )
    }

}