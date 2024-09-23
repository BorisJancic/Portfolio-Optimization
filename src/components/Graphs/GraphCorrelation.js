import './GraphCorrelation.css';

import { useEffect, memo, useState } from 'react';
import Plot from 'react-plotly.js';


const GraphCorrelation = memo(({tickerSymbols, corrMatrix, darkMode}) => {
    const WHITE_BORDER = '#F0F0F0';
    const BLACK_BORDER = '#0F0F0F';
    const [plotFontColor, setPlotFontColor] = useState('black');
    const [graphLength, setGraphLength] = useState(window.innerWidth);
  
    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();
    }, []);

    useEffect(() => {
        if (darkMode) {
            setPlotFontColor(WHITE_BORDER);
        } else {
            setPlotFontColor(BLACK_BORDER);
        }
    }, [darkMode]);

    const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const length = Math.min(width, height);
        const len = Math.round(Math.min(Math.max(length , 200), 400));
        setGraphLength(len);
    };

    const colorScale = darkMode
        ? [
            ['0.0', 'rgb(249, 222, 159)'],
            ['0.1', 'rgb(243, 198, 142)'],
            ['0.2', 'rgb(236, 174, 129)'],
            ['0.3', 'rgb(226, 150, 120)'],
            ['0.4', 'rgb(215, 126, 114)'],
            ['0.5', 'rgb(201, 104, 111)'],
            ['0.6', 'rgb(184, 83, 109)'],
            ['0.7', 'rgb(163, 64, 109)'],
            ['0.8', 'rgb(140, 47, 109)'],
            ['0.9', 'rgb(113, 35, 108)'],
            ['1.0', 'rgb(113, 35, 108)']
          ]
        : [
            ['0.0', 'rgb(165,0,38)'],
            ['0.111111111111', 'rgb(215,48,39)'],
            ['0.222222222222', 'rgb(244,109,67)'],
            ['0.333333333333', 'rgb(253,174,97)'],
            ['0.444444444444', 'rgb(254,224,144)'],
            ['0.555555555556', 'rgb(224,243,248)'],
            ['0.666666666667', 'rgb(171,217,233)'],
            ['0.777777777778', 'rgb(116,173,209)'],
            ['0.888888888889', 'rgb(69,117,180)'],
            ['1.0', 'rgb(49,54,149)']
        ];
    
    return (
        <div>
            <Plot
                data={
                [{
                    x: tickerSymbols,
                    y: tickerSymbols,
                    z: corrMatrix,
                    type: 'heatmap',
                    colorscale: colorScale,
                    zmin: -1,
                    zmax: 1,
                    colorbar: { tickfont: { color: plotFontColor } },
                    hovertemplate: '%{x}<br>%{y}<br>Correlation: %{z:.3f}<extra></extra>',
                }]
                }
                layout={{
                    title: {
                        text: 'Correlation Matrix',
                        font: {
                            family: 'Arial, sans-serif', // Font family for the title
                            size: 24,                    // Font size for the title
                            color: plotFontColor          // Font color for the title
                        },
                        pad: { t: 0, l: 0, r: 0, b: 0 }
                    },
                    xaxis: { 
                        title: null, 
                        scaleanchor: 'y',
                        tickfont: {
                            color: plotFontColor         // Font color for x-axis ticks
                        },
                        titlefont: {
                            color: plotFontColor         // Font color for x-axis title
                        }
                    },
                    yaxis: { 
                        title: null, 
                        autorange: 'reversed',
                        tickfont: {
                            color: plotFontColor         // Font color for y-axis ticks
                        },
                        titlefont: {
                            color: plotFontColor         // Font color for y-axis title
                        }
                    },
                    autosize: false,
                    width: 400,
                    height: 400,
                    margin: { l: 60, r: 50, t: 100, b: 50 },
                    paper_bgcolor: 'rgba(0, 0, 0, 0)',
                    plot_bgcolor: 'rgba(0, 0, 0, 0)',
 
                    width: graphLength,
                    height: graphLength,
                }}
                config={{
                    displayModeBar: false,
                    scrollZoom: false,
                }}
            />
        </div>
    );
})
export default GraphCorrelation;