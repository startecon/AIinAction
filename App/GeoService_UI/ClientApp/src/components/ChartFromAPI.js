import React, { useEffect, useState } from "react";
import {
    VictoryChart,
    VictoryLine,
    VictoryScatter,
    VictoryTooltip,
    VictoryVoronoiContainer,
    VictoryTheme,
} from "victory";

const ChartFromAPI = () => {
    const [minData, setMinData] = useState([]);
    const [tsData, setTsData] = useState([]);
    const [maxData, setMaxData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("https://aiinaction-437756229690.europe-west1.run.app/");
                const data = await response.json();
                console.log("Fetched data:", data);
                setMinData(data.min || []);
                setTsData(data.ts || []);
                setMaxData(data.max || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <VictoryChart
            theme={VictoryTheme.clean}
            width={500}
            height={200}
            containerComponent={<VictoryVoronoiContainer />}
        >
            <VictoryLine data={minData} style={{ data: { stroke: "#8b46ff" } }} />
            <VictoryScatter
                data={minData}
                size={0}
                style={{ data: { fill: "transparent" } }}
                labels={({ datum }) => `x: ${datum.x}, y: ${datum.y}`}
                labelComponent={
                    <VictoryTooltip
                        cornerRadius={3}
                        flyoutPadding={{ top: 5, bottom: 5, left: 10, right: 10 }}
                        style={{ fill: "white", fontSize: 12, fontWeight: "bold" }}
                        flyoutStyle={{ fill: "#333", stroke: "#8b46ff", strokeWidth: 1 }}
                    />
                }
            />
            <VictoryLine data={tsData} style={{ data: { stroke: "#2d7ff9" } }} />
            <VictoryScatter
                data={tsData}
                size={0}
                style={{ data: { fill: "transparent" } }}
                labels={({ datum }) => `x: ${datum.x}, y: ${datum.y}`}
                labelComponent={
                    <VictoryTooltip
                        cornerRadius={3}
                        flyoutPadding={{ top: 5, bottom: 5, left: 10, right: 10 }}
                        style={{ fill: "white", fontSize: 12, fontWeight: "bold" }}
                        flyoutStyle={{ fill: "#333", stroke: "#2d7ff9", strokeWidth: 1 }}
                    />
                }
            />
            <VictoryLine data={maxData} style={{ data: { stroke: "#00bfa5" } }} />
            <VictoryScatter
                data={maxData}
                size={0}
                style={{ data: { fill: "transparent" } }}
                labels={({ datum }) => `x: ${datum.x}, y: ${datum.y}`}
                labelComponent={
                    <VictoryTooltip
                        cornerRadius={3}
                        flyoutPadding={{ top: 5, bottom: 5, left: 10, right: 10 }}
                        style={{ fill: "white", fontSize: 12, fontWeight: "bold" }}
                        flyoutStyle={{ fill: "#333", stroke: "#00bfa5", strokeWidth: 1 }}
                    />
                }
            />
        </VictoryChart>
    );
};

export default ChartFromAPI;
