import './GraphWeights.css';

import { memo, useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const GraphWeights = memo(({frontierConstrained, darkMode}) => {
  const WHITE_BACKGROUND = '#f2f2f2';
  const WHITE_BORDER = '#F0F0F0';
  const BLACK_BACKGROUND = '#1A1A1A';
  const BLACK_BORDER = '#0F0F0F';
  const [plotFontColor, setPlotFontColor] = useState('black');
  const [plotBackgroundColor, setPlotBackgroundColor] = useState('white');
  const [graphWidth, setGraphWidth] = useState(window.innerWidth);
  const [graphHeight, setGraphHeight] = useState(window.innerWidth);

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
    const MAX_HEIGHT = 800;
    const MIN_WIDTH = 150;
    const MAX_WIDTH = 1200;
    const ASPECT_RATIO = 1.6;
  
    const availableHeight = Math.min(Math.max(window.innerHeight, MIN_HEIGHT), MAX_HEIGHT);
    const availableWidth = Math.min(Math.max(window.innerWidth, MIN_WIDTH), MAX_WIDTH);
    let finalHeight = Math.min(availableHeight, availableWidth / ASPECT_RATIO);      let finalWidth = finalHeight * ASPECT_RATIO;
  
    if (finalWidth > availableWidth) {
      finalWidth = availableWidth;
      finalHeight = finalWidth / ASPECT_RATIO;
    }
  
    setGraphWidth(finalWidth / 2 + 125);
    setGraphHeight(finalHeight / 2 + 125);
  };    
    const colorScale = [
        [0, 'rgb(184, 247, 212)'],
        [0.35, 'rgb(111, 231, 219)'],
        [1, 'rgb(131, 90, 241)'],
      ];
    
      function interpolateColor(color1, color2, t) {
        let dimFactor = 1;
        if (darkMode) { dimFactor = 0.8; }
        const colorToRgbArray = (color) => color.match(/\d+/g).map(Number);
        const rgb1 = colorToRgbArray(color1);
        const rgb2 = colorToRgbArray(color2);
        const interpolate = (start, end, t) => Math.round(start + (end - start) * t);
        const r = Math.round(interpolate(rgb1[0], rgb2[0], t) * dimFactor);
        const g = Math.round(interpolate(rgb1[1], rgb2[1], t) * dimFactor);
        const b = Math.round(interpolate(rgb1[2], rgb2[2], t) * dimFactor);
        return `rgb(${r}, ${g}, ${b})`;
      }
      
      function getColor(index, total) {
        const t = index / (total - 1);
        let lowerColorStop = colorScale[0];
        let upperColorStop = colorScale[colorScale.length - 1];
      
        for (let i = 0; i < colorScale.length - 1; i++) {
          if (t >= colorScale[i][0] && t <= colorScale[i + 1][0]) {
            lowerColorStop = colorScale[i];
            upperColorStop = colorScale[i + 1];
            break;
          }
        }
        const localT = (t - lowerColorStop[0]) / (upperColorStop[0] - lowerColorStop[0]);
        return interpolateColor(lowerColorStop[1], upperColorStop[1], localT);
      }
    
    
      let transposedYData = [];
      if (frontierConstrained[2] && frontierConstrained[2].length > 0) {
        const yData = frontierConstrained[2];
        transposedYData = yData[0].map((_, colIndex) =>
          yData.map(row => row[colIndex])
        );
      }
      const xValues = frontierConstrained[0].map((r, _) => r);
      
      function getEveryNth(arr, nth) {
        return arr.filter((_, index) => (index + 1) % (nth + 1) === 0);
      }
      const stepSize = Math.ceil(xValues.length / 10) + 1;
      const reducedTickVals = getEveryNth(xValues, stepSize);
      const reducedTickText = getEveryNth(frontierConstrained[1].map(val => Math.round(val)), stepSize);
    
      const baseTrace = {
        x: xValues,
        type: 'scatter',
        mode: 'lines',
        line: { width: 2 },
        stackgroup: 'one',
        showlegend: true,
        hoverinfo: 'skip',
      };
      const data = [
        ...transposedYData.map((y, index) => {
          const name = (frontierConstrained[3][index] + '').padEnd(4);
          return {
            ...baseTrace,
            y: y,
            name: name,
            text: name,
            hovertemplate: `<span style="font-family: monospace;">${name}: %{y:.2f}</span><br><extra></extra>`,  // No x-coordinate here
            line: {
              ...baseTrace.line,
              color: getColor(index, transposedYData.length)
            }
          };
        }),
        transposedYData && transposedYData.length > 0 ? {
          ...baseTrace,
          y: frontierConstrained[1],
          type: 'scattergl',
          xaxis: 'x2',
          showlegend: false,
          line: { color: 'rgba(0,0,0,0)' },
          hovertemplate: `<span style="font-family: monospace;">Return:   %{x:.1f}%<br>Volatility: %{y:.1f}%<br><extra></extra>`,
        } : null
      ]
    
      const layout = {
        title: {
          text: 'Optimal Portfolio Allocation',
          font: {
            family: 'Arial, sans-serif', // Font family for the main title
            size: 24,                    // Font size for the main title
            color: plotFontColor          // Font color for the main title
          }
        },
        xaxis: { title: "Return μ (%)", zeroline: false, color: plotFontColor },
        xaxis2: {
          title: {
            text: 'Volatility σ (%)',
            standoff: 5,
            hovertemplate: 'none',
            color: plotFontColor
          },
          showgrid: false,
          overlaying: 'x',
          side: 'top',
          tickvals: reducedTickVals,
          ticktext: reducedTickText,
          zeroline: false,
          color: plotFontColor
        },
        yaxis: { title: "Weight", range: [0, 1], color: plotFontColor },
        hovermode: 'x unified',
        width: graphWidth,
        height: graphHeight,
        margin: { t: 100, b: 60, l: 50, r: 50 },
        paper_bgcolor: plotBackgroundColor,  // Entire plot background color
        // plot_bgcolor: plotAreaBackgroundColor,  // Plot (inside the graph) background color
        legend: {
            font: {
                family: "Arial, sans-serif",  // Set the font for the legend
                size: 12,                     // Legend font size
                color: plotFontColor           // Legend font color
            }
        },
        dragmode: false,
      };

    return (
        <div>
            <Plot
                data={data}
                layout={layout}
                config={{
                    displayModeBar: false,
                    scrollZoom: false,
                }}
                onLegendClick={() => { return false; }}
            />
        </div>
    );
})
export default GraphWeights;