import React from 'react';
import { authFetch, authPost } from "./../authProvider";
import { LanguageContext } from './LanguageContext';
import * as flatbuffers from 'flatbuffers';
import { BoxAndWhiskerMeasure } from './Flatbuffer/geoservice/box-and-whisker-measure';
import * as _ from 'lodash';
import * as math from 'mathjs';
import {
    VictoryChart,
    VictoryTheme,
    VictoryScatter,
    VictoryTooltip,
    VictoryBoxPlot,
    VictoryZoomContainer,
    VictoryVoronoiContainer,
    VictoryAxis,
    VictoryGroup
} from "victory";

/* Näkymäkohtaiset muuttujat ja vakiot */
const API_PREFIX = 'api/BoxAndWhisker';

class CustomChart extends React.Component {
    constructor(props) {
        super();
        this.entireDomain = this.getEntireDomain(props);
        this.state = {
            zoomedXDomain: this.entireDomain.x,
            zoomedYDomain: this.entireDomain.y,
            chart_width: 900,
            chart_height: 400,
            chart_padding: 70,
            area_width: 900 - 70 * 2,
            area_height: 400 - 70 * 2,
            ball_px: 10,
        };
    }

    onDomainChange(domain) {
        this.setState({
            zoomedXDomain: domain.x,
            zoomedYDomain: domain.y,
        });
    }

    getEntireDomain(props) {
        return {
            x: [1, 6] //["Espoo;2011", "Espoo;2021", "Helsinki;2011", "Helsinki;2021", "Vantaa;2011", "Vantaa;2021"]
        };
    }

    getZoomFactor() {
        const { zoomedXDomain } = this.state;
        const factor = 10 / (zoomedXDomain[1] - zoomedXDomain[0]);
        return _.round(factor, factor < 3 ? 1 : 0);
    }

    getZoomSize() {
        const { zoomedXDomain } = this.state;
        const factor = 2 / (zoomedXDomain[1] - zoomedXDomain[0]);
        return factor < 4 ? 4 : _.round(factor, 0);
    }

    beeswarm = (scatterdata) => {
        const { area_width, area_height, ball_px, zoomedXDomain } = this.state;

        let retval = new Set();
        let chart_w = area_width
        let domain_w = zoomedXDomain[1] - zoomedXDomain[0];
        let domain_w_px = chart_w / domain_w;
        let ball_max = domain_w_px / ball_px;
        // Palloyksikön x
        let ball_x = (ball_max != 0) ? 1 / ball_max : 0;

        if (scatterdata) {
            for (var i = Math.max(Math.floor(zoomedXDomain[0]), 0); i < Math.min(scatterdata.categoriesLength(), Math.ceil(zoomedXDomain[1])); i++) {

                // Maksimi havaintomäärä kyseisessä kategoriassa
                let cat_max = 0;
                for (var j = 0; j < scatterdata.categories(i).histogramLength(); j++) {
                    cat_max = Math.max(cat_max, scatterdata.categories(i).histogram(j).count());
                }

                // Kategorian numeerinen arvo
                let cat_x = i + 1;

                for (var j = 0; j < scatterdata.categories(i).histogramLength(); j++) {
                    let hist_count = scatterdata.categories(i).histogram(j).count();
                    let hist_level = scatterdata.categories(i).histogram(j).lowerbound();
                    let perc = hist_count / cat_max;
                    let ball_num = Math.min(Math.floor(ball_max * perc), scatterdata.categories(i).valuebins(j).valuesLength());

                    let left_x = Math.max(cat_x - (ball_num * ball_x / 2), zoomedXDomain[0]);
                    let right_x = Math.min(cat_x - (ball_num * ball_x / 2) + (ball_num * ball_x), zoomedXDomain[1]);
                    ball_num = Math.min(ball_num, ((right_x - left_x) / ball_x));

                    for (var k = 0; k < ball_num; k++) {
                        let x = cat_x - (ball_num * ball_x / 2) + (k * ball_x);

                        retval.add({
                            x: x,
                            y: hist_level,
                            label: (scatterdata.label() + ": " + parseInt(scatterdata.categories(i).valuebins(j).values(k)) +
                                "\nHavaintoja " +
                                parseInt(scatterdata.categories(i).histogram(j).lowerbound()) + " - " +
                                parseInt(scatterdata.categories(i).histogram(j).upperbound()) + ": " +
                                parseInt(scatterdata.categories(i).histogram(j).count()) + " kpl")
                        });
                    }
                }
            }
        }

        return Array.from(retval);
    }

    render() {
        const { chart_width, chart_height, chart_padding, ball_px } = this.state;
        const { scatterdata, boxplotdata } = this.props;

        return (
            <div>
                <VictoryChart
                    padding={chart_padding}
                    width={chart_width}
                    height={chart_height}
                    domainPadding={{ x: 30, y: 30 }}
                    containerComponent={<VictoryZoomContainer
                        onZoomDomainChange={this.onDomainChange.bind(this)}
                        zoomDimension="x"
                    />}
                >
                    {boxplotdata ?
                        (<VictoryGroup offset={this.getZoomFactor() * 3 + 10}>
                            <VictoryBoxPlot
                                boxWidth={this.getZoomFactor() * 3 + 10}
                                data={(boxplotdata || [])[0]}
                            />
                            <VictoryBoxPlot
                                boxWidth={this.getZoomFactor() * 3 + 10}
                                data={(boxplotdata || [])[1]}
                            />
                            <VictoryBoxPlot
                                boxWidth={this.getZoomFactor() * 3 + 10}
                                data={(boxplotdata || [])[2]}
                            />
                        </VictoryGroup>) :
                        null
                    }
                    {/*<VictoryScatter
                        labelComponent={<VictoryTooltip renderInPortal={false} />}
                        style={{ data: { fill: "#7030a0", stroke: "black", strokeWidth: 1 } }}
                        size={ball_px / 2}
                        data={this.beeswarm(scatterdata)}
                    />*/}
                    <VictoryAxis dependentAxis />
                    <VictoryAxis fixLabelOverlap />
                </VictoryChart>

            </div>
        );
    }
}

/* Luokka */
export class BoxAndWhisker extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props);

        // State alustukset
        this.state = {
            loading: true,
            dataset: null
        };
    };

    componentDidMount() {

        //Items
        authFetch(this.props.pca, API_PREFIX + '/Read')
            .then(response => response.arrayBuffer())
            .then(buffer => {
                const data = new Uint8Array(buffer);
                const buf = new flatbuffers.ByteBuffer(data);
                const dataset = BoxAndWhiskerMeasure.getRootAsBoxAndWhiskerMeasure(buf);

                this.setState({ dataset: dataset });

            });

        let data = []

        for (let i = 0; i < 3; i++) {
            let arr = Array.from({ length: 6 }, (_, i) => {
                let nums = math.random([100], 1, 25000)
                return {
                    x: i + 1,
                    y: math.quantileSeq(nums, [0, 0.25, 0.5, 0.75, 1], false),
                    label: math.mean(nums)
                };
            });
            data.push(arr);
        }

        this.setState({ boxplotdata: data });

    };

    render = () => {
        return (
            <div style={{ width: 900, height: 400, padding: 20 }}>
                <CustomChart scatterdata={this.state.dataset} boxplotdata={this.state.boxplotdata} />
            </div>
        );
    }
}