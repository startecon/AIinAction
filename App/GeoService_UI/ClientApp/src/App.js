import React from 'react';
import { MsalContext } from "@azure/msal-react";
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { EcoWind } from './components/EcoWind';
import { AdminProfiili } from './components/AdminProfiili';
import { AdminRooli } from './components/AdminRooli';
import { AdminRoolit } from './components/AdminRoolit';
import { AdminRooliOikeudet } from './components/AdminRooliOikeudet';
import { AdminTila } from './components/AdminTila';
import { Koodi } from './components/Koodi';
import { Koodiryhma } from './components/Koodiryhma';
import { Tehtava } from './components/Tehtava';
import { Asiakas } from './components/Asiakas';
import { Projekti } from './components/Projekti';
import { Ajo } from './components/Ajo';
import { Agentti } from './components/Agentti';
import { Ajastus } from './components/Ajastus';
import { Toiminnot } from './components/Toiminnot';
import { Help } from './components/Help';
import { AdminPalvelupaketti } from './components/AdminPalvelupaketti';
import { AdminMarketplace } from './components/AdminMarketplace';
import { AdminRaportti } from './components/AdminRaportti';
import { Routing } from './components/Routing';
import { ReportContent } from './components/ReportContent';
import { Lokitus } from './components/Lokitus';
import { Carbon } from './components/Carbon';
import { BoxAndWhisker } from './components/BoxAndWhisker';
import { RotatingMap } from './components/RotatingMap';

import { Testi } from './components/Testi';
import { Testaus1 } from './components/Testaus1';
import { Testaus2 } from './components/Testaus2';
import { Testaus3 } from './components/Testaus3';
import { Raportti } from './components/Raportti';
import { KayttajaTili } from './components/KayttajaTili';
import { NotFound } from './components/NotFound';
import { Laitteet } from './components/Laitteet';


export default class App extends React.Component {
    static contextType = MsalContext;

    render() {
        const { instance } = this.context;

        return (
            <Layout>
                <Routes>
                    <Route exact path='/' element={<EcoWind pca={instance} />} />
                    <Route path='/help' element={<Help pca={instance} />} />
                    <Route path='/profiilit' element={<AdminProfiili pca={instance} />} />
                    <Route path='/roolit' element={<AdminRooli pca={instance} />} />
                    <Route path='/profiiliroolit' element={<AdminRoolit pca={instance} />} />
                    <Route path='/roolioikeudet' element={<AdminRooliOikeudet pca={instance} />} />
                    <Route path='/tila' element={<AdminTila pca={instance} />} />
                    <Route path='/koodi' element={<Koodi pca={instance} />} />
                    <Route path='/koodiryhma' element={<Koodiryhma pca={instance} />} />
                    <Route path='/asiakas' element={<Asiakas pca={instance} />} />
                    <Route path='/projekti' element={<Projekti pca={instance} />} />
                    <Route path='/tehtava' element={<Tehtava pca={instance} />} />
                    <Route path='/ajo' element={<Ajo pca={instance} />} />
                    <Route path='/agentti' element={<Agentti pca={instance} />} />
                    <Route path='/ajastus' element={<Ajastus pca={instance} />} />
                    <Route path='/toiminnot' element={<Toiminnot pca={instance} />} />
                    <Route path="/palvelupaketti" element={<AdminPalvelupaketti pca={instance} />} />
                    <Route path="/marketplace" element={<AdminMarketplace pca={instance} />} />
                    <Route path="/routing" element={<Routing pca={instance} />} />
                    <Route path="/rotatingmap" element={<RotatingMap pca={instance} />} />
                    <Route path="/lokitus" element={<Lokitus pca={instance} />} />
                    <Route path="/powerbi" element={<ReportContent pca={instance} />} />
                    <Route path="/carbon" element={<Carbon pca={instance} />} />
                    <Route path="/boxandwhisker" element={<BoxAndWhisker pca={instance} />} />
                    <Route path="/testi" element={<Testi pca={instance} />} />
                    <Route path="/raportti" element={<Raportti pca={instance} />} />
                    <Route path="/kayttajatili" element={<KayttajaTili pca={instance} />} />
                    <Route path='/raportit' element={<AdminRaportti pca={instance} />} />
                    <Route path='/testaus1' element={<Testaus1 pca={instance} />} />
                    <Route path='/testaus2' element={<Testaus2 pca={instance} />} />
                    <Route path='/testaus3' element={<Testaus3 pca={instance} />} />
                    <Route path="*" element={<NotFound pca={instance} />} />
                    <Route path='/Laitteet' element={<Laitteet pca={instance} />} />
                </Routes>
            </Layout>
        );
    }
}
