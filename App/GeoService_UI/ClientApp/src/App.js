import React from 'react';
import { MsalContext } from "@azure/msal-react";
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { EcoWind } from './components/EcoWind';
import { NotFound } from './components/NotFound';



export default class App extends React.Component {
    static contextType = MsalContext;

    render() {
        const { instance } = this.context;

        return (
            <Layout>
                <Routes>
                    <Route exact path='/' element={<EcoWind pca={instance} />} />
                    <Route path="*" element={<NotFound pca={instance} />} />
                </Routes>
            </Layout>
        );
    }
}
