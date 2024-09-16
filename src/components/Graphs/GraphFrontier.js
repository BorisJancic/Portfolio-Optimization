import './GraphFrontier.css';

import { memo, useEffect, useState } from 'react';
import Plot from 'react-plotly.js';


const GraphFrontier = memo(({
    frontierUnconstrained,
    frontierConstrained,
    scatterUnconstrained,
    scatterConstrained,
    stockPoints,
    darkMode
}) => {
    const WHITE_BACKGROUND = '#f2f2f2';
    const WHITE_BORDER = '#F0F0F0';
    const BLACK_BACKGROUND = '#1A1A1A';
    const BLACK_BORDER = '#0F0F0F';

    const [visibility, setVisibility] = useState([true, true, true, true, true]);
    const [graphWidth, setGraphWidth] = useState(window.innerWidth);
    const [graphHeight, setGraphHeight] = useState(window.innerWidth);
    const [plotFontColor, setPlotFontColor] = useState('black');
    const [plotBackgroundColor, setPlotBackgroundColor] = useState('white');

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();
    }, []);

    useEffect(() => {
        if (darkMode) {
            setPlotFontColor(WHITE_BORDER);
            setPlotBackgroundColor(BLACK_BACKGROUND);
        } else {
            setPlotFontColor(BLACK_BORDER);
            setPlotBackgroundColor(WHITE_BACKGROUND);
        }
    }, [darkMode]);
    
    const handleResize = () => {
        const MIN_HEIGHT = 100;
        const MAX_HEIGHT = 1000;
        const MIN_WIDTH = 160;
        const MAX_WIDTH = 1600;
        const ASPECT_RATIO = 1.;
    
        const availableHeight = Math.min(Math.max(window.innerHeight, MIN_HEIGHT), MAX_HEIGHT);
        const availableWidth = Math.min(Math.max(window.innerWidth, MIN_WIDTH), MAX_WIDTH);
        let finalHeight = Math.min(availableHeight, availableWidth / ASPECT_RATIO);
        let finalWidth = finalHeight * ASPECT_RATIO;
    
        if (finalWidth > availableWidth) {
            finalWidth = availableWidth;
            finalHeight = finalWidth / ASPECT_RATIO;
        }
    
        setGraphWidth(finalWidth / 2);
        setGraphHeight(finalHeight / 2);
    };

    function updateLegend(event) {
        setVisibility(visibility.map((visible, index) =>
            index === event.expandedIndex ? !visible : visible
        ));
        return false;
    }

    const generateHoverData = (weights, labels) => {
        const hoverTexts = weights.map(weightList => weightList.map((weight, index) => {
            const label = (labels[index] + ':').padEnd(6);
            return `<span style="font-family: monospace;">  ${label} ${weight.toFixed(2)}</span>`;
        }).join('<br>'));
        const hovertemplate = '<span style="font-family: monospace;">' +
                              'σ: %{x:.1f}<br>' +
                              'μ: %{y:.1f}<br><br>' +
                              'Weights:<br>' +
                              '%{text}';
      
        return { text: hoverTexts, hovertemplate };
    };
    const frontierUnconstrainedData = generateHoverData(frontierUnconstrained[2], frontierUnconstrained[3]);
    const frontierConstrainedData = generateHoverData(frontierConstrained[2], frontierConstrained[3]);
    const scatterUnconstrainedData = generateHoverData(scatterUnconstrained[2], scatterUnconstrained[3]);
    const scatterConstrainedData = generateHoverData(scatterConstrained[2], scatterConstrained[3]);

    return (
        <div>
            {frontierUnconstrained && frontierConstrained && scatterUnconstrained && scatterConstrained && 
            <Plot
                data={[
                {
                    x: frontierUnconstrained[1],
                    y: frontierUnconstrained[0],
                    type: "scatter",
                    mode: "lines+markers",
                    line: { shape: "spline" },
                    marker: { color: "red" },
                    name: "Frontier with Short Selling",
                    visible: visibility[0] ? true : 'legendonly',
                    ...frontierUnconstrainedData,
                },
                {
                    x: frontierConstrained[1],
                    y: frontierConstrained[0],
                    type: "scatter",
                    mode: "lines+markers",
                    line: { shape: "spline" },
                    marker: { color: "blue" },
                    name: "Frontier without Short Selling",
                    visible: visibility[1] ? true : 'legendonly',
                    ...frontierConstrainedData,
                },
                {
                    x: scatterUnconstrained[1],
                    y: scatterUnconstrained[0],
                    type: "scatter",
                    mode: "markers",
                    marker: { color: "orange", size: 1.5 },
                    name: 'Simulation with Short Selling',
                    visible: visibility[2] ? true : 'legendonly',
                    ...scatterUnconstrainedData,
                },
                {
                    x: scatterConstrained[1],
                    y: scatterConstrained[0],
                    type: "scatter",
                    mode: "markers",
                    marker: { color: "green", size: 1.5 },
                    name: "Simulation without Short Selling",
                    visible: visibility[3] ? true : 'legendonly',
                    ...scatterConstrainedData,
                },
                {
                    x: stockPoints[1],
                    y: stockPoints[0],
                    type: "scatter",
                    mode: "markers",
                    marker: {
                    color: "gold",
                    size: 5,
                    line: {
                        color: 'black', // Outline color
                        width: 1 // Width of the outline
                    }
                    },
                    name: "Stocks",
                    text: stockPoints[2],
                    visible: visibility[4] ? true : 'legendonly',
                    hovertemplate: `<span style="font-family: monospace;">%{text}<br>Return:   %{x:.1f}%<br>Volatility: %{y:.1f}%<br><extra></extra>`,
                },
                ]}
                layout={{
                    paper_bgcolor: plotBackgroundColor, // Background color for the entire plot area (outside graph)
                    plot_bgcolor: 'rgba(255, 255, 255, 0)', // Set the plot background (inside graph), adjust as needed
                    titlefont: { color: plotFontColor },
                    tickfont: { color: plotFontColor },
                    width: graphWidth * 1.5,
                    height: graphHeight,
                    title: "Optimal Sharp Ratio",
                    xaxis: { title: "Volatility σ (%)", color: plotFontColor, zeroline: false },
                    yaxis: { title: "Return μ (%)", color: plotFontColor, zeroline: false },
                    margin: { l: 80, r: 40, t: 80, b: 80 },
                    
                    legend: { font: { size: 10, color: plotFontColor }, x: 1, }                
                }}
                onLegendClick={updateLegend}
            />}
        </div>
    );
});
export default GraphFrontier;