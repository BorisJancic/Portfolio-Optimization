import { useEffect, useState, useRef } from 'react';
import Plot from 'react-plotly.js';
import './App.css';

import SearchBar from './components/Search/SearchBar';
import SearchResultsList from './components/Search/SearchResultsList';
import SelectedList from './components/List/SelectedList';

import getFormattedDates from './helper_functions/FormatDates';
import gaussianElimination from './helper_functions/GassianElimination';
import { solveQP } from './helper_functions/quadprog';
import GraphFrontier from './components/Graphs/GraphFrontier';
import GraphWeights from './components/Graphs/GraphWeights';
import GraphCorrelation from './components/Graphs/GraphCorrelation'
import DarkModeSelector from './components/DarkModeSelector';

function App() {
// TODO
// Iterrations slider (line on graph?)
// Display weights on curser
// Default Graph Visibility
// CSS
// Dark mode
// Segment into different files
// Sliders for desired Var and Return
// Interest rates and line
// Clean up request logic

  const containerRef = useRef(null);
  const [showPlots, setShowPlots] = useState(false)
  const [isFocused, setIsFocused] = useState(false);
  
  const [tickers, setTickers] = useState([]);
  const [failedTickers, setFailedTickers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [removedStocks, setRemovedStocks] = useState([]);

  const [frontierUnconstrained, setFrontierUnconstrained] = useState([[], [], [], []]);
  const [frontierConstrained, setFrontierConstrained] = useState([[], [], [], []]);
  const [scatterUnconstrained, setScatterUnconstrained] = useState([[], [], [], []]);
  const [scatterConstrained, setScatterConstrained] = useState([[], [], [], []]);
  const [corrMatrix, setCorrMatrix] = useState([]);
  const [stockPoints, setStockPoints] = useState([[], [], []]);
  const [tickerSymbols, setTickerSymbols] = useState([]);

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const indexes = [];
    const selectedStocks = [];
    stocks.forEach((stock, index) => {
      if (stock.selected) {
        const stockCopy = { ...stock };
        stockCopy.covariance = [...stock.covariance];
        selectedStocks.push(stockCopy);
      } else {
        indexes.push(index);
      }
    });
    selectedStocks.forEach((selectedStock) => {
      selectedStock.covariance = selectedStock.covariance.filter((_, index) => !indexes.includes(index));
    });

    if (selectedStocks.length < 2) {
      setShowPlots(false);
      return;
    }

    let iterations = 50;
    let min_return = Number.MAX_SAFE_INTEGER;
    let max_return = Number.MIN_SAFE_INTEGER;
    for (let i = 0; i < selectedStocks.length; i++) {
      if (selectedStocks[i].return < min_return) { min_return = selectedStocks[i].return; }
      if (selectedStocks[i].return > max_return) { max_return = selectedStocks[i].return; }
    } max_return *= 1.0;
    let extra_iterations = 3;
    let x_vals = new Array(iterations + extra_iterations).fill(0);
    let y_vals = new Array(iterations + extra_iterations).fill(0);
    let w_vals = new Array(iterations + extra_iterations);
    for (let i = 0; i < iterations + extra_iterations; i++) {
      let desired_return = min_return + i * (max_return - min_return) / (iterations - 1);
      let result = optimize_portfolio_unconstrained(desired_return, selectedStocks);
      x_vals[i] = result[0];
      y_vals[i] = Math.sqrt(result[1]);
      w_vals[i] = result[2];
    }
    let ticker_symbols = [];
    selectedStocks.forEach(stock => { ticker_symbols.push(stock.symbol); });
    setFrontierUnconstrained([x_vals, y_vals, w_vals, ticker_symbols]);

    x_vals = new Array(iterations).fill(0);
    y_vals = new Array(iterations).fill(0);
    w_vals = new Array(iterations).fill(0);
    for (let i = 0; i < iterations; i++) {
      let desired_return = min_return + i * (max_return - min_return) / (iterations - 1);
      let result = optimize_portfolio_constrained(desired_return, selectedStocks);
      x_vals[i] = result[0];
      y_vals[i] = Math.sqrt(result[1]);
      w_vals[i] = result[2];
    }
    setFrontierConstrained([x_vals, y_vals, w_vals, ticker_symbols]);

    // volatility, not variances
    let [returns, variances, weights] = simulate_portfolio(1_000, true, selectedStocks);
    setScatterUnconstrained([returns, variances, weights, ticker_symbols]);

    [returns, variances, weights] = simulate_portfolio(1_000, false, selectedStocks);
    setScatterConstrained([returns, variances, weights, ticker_symbols]);

    [returns, variances] = get_stock_points(selectedStocks);
    setStockPoints([returns, variances, ticker_symbols]);

    let corr = get_corr_matrix(selectedStocks);
    setCorrMatrix(corr);

    setTickerSymbols(ticker_symbols);

    setShowPlots(true);
    console.log("variable States Set")
  }, [stocks]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      document.querySelector('link[rel="icon"]').href = `${process.env.PUBLIC_URL}/favicon-dark.ico`
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      document.querySelector('link[rel="icon"]').href = `${process.env.PUBLIC_URL}/favicon.ico`
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }, [darkMode]);

  function get_stock_points(selectedStocks) {
    let returns = new Array(selectedStocks.length).fill(0);
    let volatilities = new Array(selectedStocks.length).fill(0);
    for (let i = 0; i < selectedStocks.length; i++) {
      returns[i] = selectedStocks[i].return;
      volatilities[i] = Math.sqrt(selectedStocks[i].variance);
    }
    return [returns, volatilities];
  }

  function get_corr_matrix(selectedStocks) {
    let n = selectedStocks.length;
    let corr = Array.from({ length: n }, () => new Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        corr[i][j] = selectedStocks[i].covariance[j];
        corr[i][j] /= Math.sqrt(selectedStocks[i].variance * selectedStocks[j].variance);
      }
    }
    return corr;
  }


  function compute_return(returns, weights) {
    let portfolio_return = 0;
    for (let i = 0; i < returns.length; i++) {
      portfolio_return += returns[i] * weights[i];
    }
    return portfolio_return;
  }
  function compute_variance(cov, weights) {
    let variance = 0;
    let x = new Array(cov.length).fill(0);
    for (let i = 0; i < cov.length; i++) {
      for (let j = 0; j < cov.length; j++) {
        x[i] += cov[i][j] * weights[j];
      }
      variance += x[i] * weights[i];
    }
    return variance;
  }

  function optimize_portfolio_constrained(desired_return, selectedStocks) {
    let n = selectedStocks.length;
    let D = Array.from({ length: n }, () => new Array(n).fill(0));
    let d = new Array(n).fill(0);
    let A = Array.from({ length: n }, () => new Array(n + 2).fill(0));
    let b = new Array(n + 2).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        D[i][j] = 2 * selectedStocks[i].covariance[j];
      }
    }
    b[0] = desired_return;
    b[1] = 1;
    for (let i = 0; i < n; i++) {
      A[i][0] = selectedStocks[i].return;
      A[i][1] = 1;
      A[i][2 + i] = 1; 
    }

    let result = solveQP(D, d, A, b, 2, false);
    let weights = result.solution;

    let returns = new Array(n).fill(0);
    let cov = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        cov[i][j] = selectedStocks[i].covariance[j];
      } returns[i] = selectedStocks[i].return;
    }

    let variance = compute_variance(cov, weights);
    let portfolio_return = compute_return(returns, weights);

    return [portfolio_return, variance, weights];
  }

  function simulate_portfolio(iterations, short, selectedStocks) {
    let n = selectedStocks.length;
    let weights = new Array(n).fill(0);
    let portfolio_returns = [];
    let portfolio_variances = [];
    let portfolio_weigths = [];
    let cov = Array.from({ length: n }, () => new Array(n).fill(0));
    let returns = Array(n).fill(0);
    let max_variance = Number.MIN_SAFE_INTEGER;
    let min_return = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        cov[i][j] = selectedStocks[i].covariance[j];
      }
      returns[i] = selectedStocks[i].return;
      if (max_variance < selectedStocks[i].variance) { max_variance = selectedStocks[i].variance; }
      if (min_return > selectedStocks[i].return) { min_return = selectedStocks[i].return; }
    }

    for (let i = 0; i < iterations; i++) {
      for (let j = 0; j < n; j++) {
        if (!short) { weights[j] = Math.random(); }
        else { weights[j] = (Math.random() * 2) - 1; }
      }
      let norm = weights.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      for (let j = 0; j < n; j++) {
        weights[j] = weights[j] / norm;
      }

      let variance = compute_variance(cov, weights);
      let portfolio_return = compute_return(returns, weights);

      if (variance > max_variance*1.0 || portfolio_return < min_return) { continue; }
      portfolio_returns.push(portfolio_return);
      portfolio_variances.push(Math.sqrt(variance));
      portfolio_weigths.push(weights);

    }
    return [portfolio_returns, portfolio_variances, portfolio_weigths];
  }

  function optimize_portfolio_unconstrained(desired_return, selectedStocks) {
    let n = selectedStocks.length;
    let returns = new Array(n).fill(0);
    let cov = Array.from({ length: n }, () => new Array(n).fill(0));

    let A = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0));
    let b = new Array(n + 2).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        A[i][j] = 2 * selectedStocks[i].covariance[j];
      }
    }
    for (let i = 0; i < n; i++) {
      A[i][n] = -selectedStocks[i].return;
      A[i][n + 1] = -1;
      A[n][i] = selectedStocks[i].return;
      A[n + 1][i] = 1;
    }
    b[n] = desired_return;
    b[n + 1] = 1;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        cov[i][j] = selectedStocks[i].covariance[j];
      } returns[i] = selectedStocks[i].return;
    }

    let weights = gaussianElimination(A, b).slice(0, cov.length);
    let variance = compute_variance(cov, weights);
    let portfolio_return = compute_return(returns, weights);
    
    return [portfolio_return, variance, weights];
  }

  function compute_covariance(prices_A, prices_B) {
    let prices_A_B = [];
    let i = prices_A.length - 1;
    let j = prices_B.length - 1;

    while (i >= 0 && j >= 0) {
      while (i >= 0 && j >= 0 && prices_A[i][0] !== prices_B[j][0]) {
        if (prices_A[i][0] > prices_B[j][0]) { --j; }
        else { --i; }
      }
      if (i >= 0 && j >= 0 && prices_A[i][0] === prices_B[j][0]) {
        prices_A_B.push([prices_A[i][0], prices_A[i][1], prices_B[j][1]]);
      }
      --i;
      --j;
    }

    let returns_A = new Array(prices_A_B.length - 1);
    let returns_B = new Array(prices_A_B.length - 1);
    let m_A = 0;
    let m_B = 0;
    let cov = 0;

    for (let i = 0; i < prices_A_B.length - 1; i++) {
      returns_A[i] = prices_A_B[i+1][1] / prices_A_B[i][1] - 1;
      returns_B[i] = prices_A_B[i+1][2] / prices_A_B[i][2] - 1;
      m_A += returns_A[i];
      m_B += returns_B[i];
    }
    m_A /= returns_A.length;
    m_B /= returns_B.length;

    for (let i = 0; i < prices_A_B.length - 1; i++) {
      cov += (returns_A[i] - m_A) * (returns_B[i] - m_B);
    }
    return 1_000_000 * cov / (returns_A.length - 1);
  }

  function update_covariance_and_return(new_stocks) {
    const n = new_stocks.length;
    for (let i = 0; i < n; i++) {
      new_stocks[i].covariance = [...new_stocks[i].covariance, 0];
    }

    for (let i = 0; i < n; i++) {
      let cov = compute_covariance(
        new_stocks[i].price_data,
        new_stocks[n-1].price_data
      );
      new_stocks[i].covariance[n-1] = cov;
      new_stocks[n-1].covariance[i] = cov;
    }
    new_stocks[n-1].variance = new_stocks[n-1].covariance[n-1];
    new_stocks[n-1].return = 100 * ((new_stocks[n-1].price_data[0][1] / new_stocks[n-1].price_data.at(-1)[1]) - 1);
    
    return;
  }

  async function get_price_data(ticker, retries) {
    const dates = getFormattedDates();
    const start_date = dates.start_date;
    const end_date = dates.end_date;

    const api_key = '0d51927fb8154248926a806fb9828836'
    const url = 'https://api.twelvedata.com/time_series?' +
            `&apikey=${api_key}` +
            `&interval=1day&type=stock&symbol=${ticker}` +
            `&${start_date}&${end_date}&format=CSV`
    console.log(ticker)

    const price_array = [];

    // console.time("fetch");
    for (let i = 0; i <= retries; i++) {
      await fetch(url).then((response) => {
        if (!response.ok) { throw new Error(response.status); }
        else { return response.text(); }
      }).catch(() => { /* handle invalid entry here */ })
      .then(csv => {
        // console.timeEnd("fetch");
        // console.time("compute");
        let rows = csv.split('\n')
        if (rows[0].includes('"code":429')) {
          // handle request limit exceeded
          throw new Error(429);
        }

        if (rows.length < 100) { return; }

        for (let j = 1; j < rows.length; j++) {
          if (rows[j] === "") { continue; }
          const split_row = rows[j].split(';')
          const date_str = split_row[0];
          const [year, month, day] = date_str.split('-');
          const price = parseFloat(split_row[1]);
          const date = parseInt(`${year}${month}${day}`);

          price_array.push([date, price]);
        }

        // console.timeEnd("compute");
      }).catch((error) => { console.log("Catch: 2")})

      if (price_array.length > 0) { break; }
    }
    return price_array;
  }

  const addStock = (stock) => {
    for (let i = 0; i < stocks.length; i++) {
      if (stocks[i].shortname === stock.shortname) { return; }
    }

    get_price_data(stock.symbol, 0).then((received) => {
      if (received.length > 0) {
        const new_stock = {
          selected: true,
          shortname: stock.shortname,
          symbol: stock.symbol,
          price_data: received,
          return: 0,
          variance: 0,
          covariance: new Array(stocks.length).fill(0),
        }

        const updatedStocks = [...stocks, new_stock];
        update_covariance_and_return(updatedStocks);
        setStocks(updatedStocks);
        // console.log("setStocks")
      } else {
        setFailedTickers((prevStocks) => [...prevStocks, stock.shortname]);
        // console.log("Not Recieved")
      }
    });
  }

  const changeSelection = (shortname) => {
    setStocks((prevStocks) =>
      prevStocks.map((stock) =>
        stock.shortname === shortname
          ? { ...stock, selected: !stock.selected }
          : stock
      )
    );
  }
  
  const addRemovedStock = (stockToAdd) => {
    console.log(stockToAdd.shortname);
  }

  const deleteStock = (stockToDelete) => {
    setStocks((prevStocks) => {
      const index = prevStocks.findIndex(stock => stock.shortname === stockToDelete.shortname);
      const filteredStocks = prevStocks.filter(stock => stock.shortname !== stockToDelete.shortname);
      const updatedStocks = filteredStocks.map(stock => {
          const updatedCovariance = [...stock.covariance];
          updatedCovariance.splice(index, 1);
          return { ...stock, covariance: updatedCovariance };
      });
      return updatedStocks;
    });
  }
  const removeStock = (stockToRemove) => {
    setStocks((prevStocks) => {
      const index = prevStocks.findIndex(stock => stock.shortname === stockToRemove.shortname);
      const filteredStocks = prevStocks.filter(stock => stock.shortname !== stockToRemove.shortname);
      const updatedStocks = filteredStocks.map(stock => {
          const updatedCovariance = [...stock.covariance];
          updatedCovariance.splice(index, 1);
          return { ...stock, covariance: updatedCovariance };
      });
      return updatedStocks;
    });

    setRemovedStocks([...removedStocks, stockToRemove]);

    console.log("Removed");
  }

  const handleFocus = () => { setIsFocused(true); };
  const handleBlur = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget)) {
      setIsFocused(false);
    }
  };

  return (
    <div className="App">
      <div className="name_container">
        <p className="name_paragraph">Boris Jancic</p>
        <a href="https://github.com/BorisJancic/Portfolio-Optimization" target="_blank" className="github_link">
          {!darkMode && <svg viewBox="0 0 64 64" width="48px" height="48px"><path d="M 32 10 C 19.85 10 10 19.85 10 32 C 10 44.15 19.85 54 32 54 C 44.15 54 54 44.15 54 32 C 54 19.85 44.15 10 32 10 z M 32 14 C 41.941 14 50 22.059 50 32 C 50 40.238706 44.458716 47.16934 36.904297 49.306641 C 36.811496 49.1154 36.747844 48.905917 36.753906 48.667969 C 36.784906 47.458969 36.753906 44.637563 36.753906 43.601562 C 36.753906 41.823563 35.628906 40.5625 35.628906 40.5625 C 35.628906 40.5625 44.453125 40.662094 44.453125 31.246094 C 44.453125 27.613094 42.554688 25.720703 42.554688 25.720703 C 42.554688 25.720703 43.551984 21.842266 42.208984 20.197266 C 40.703984 20.034266 38.008422 21.634812 36.857422 22.382812 C 36.857422 22.382813 35.034 21.634766 32 21.634766 C 28.966 21.634766 27.142578 22.382812 27.142578 22.382812 C 25.991578 21.634813 23.296016 20.035266 21.791016 20.197266 C 20.449016 21.842266 21.445312 25.720703 21.445312 25.720703 C 21.445312 25.720703 19.546875 27.611141 19.546875 31.244141 C 19.546875 40.660141 28.371094 40.5625 28.371094 40.5625 C 28.371094 40.5625 27.366329 41.706312 27.265625 43.345703 C 26.675939 43.553637 25.872132 43.798828 25.105469 43.798828 C 23.255469 43.798828 21.849984 42.001922 21.333984 41.169922 C 20.825984 40.348922 19.7845 39.660156 18.8125 39.660156 C 18.1725 39.660156 17.859375 39.981656 17.859375 40.347656 C 17.859375 40.713656 18.757609 40.968484 19.349609 41.646484 C 20.597609 43.076484 20.574484 46.292969 25.021484 46.292969 C 25.547281 46.292969 26.492043 46.171872 27.246094 46.068359 C 27.241926 47.077908 27.230199 48.046135 27.246094 48.666016 C 27.251958 48.904708 27.187126 49.114952 27.09375 49.306641 C 19.540258 47.168741 14 40.238046 14 32 C 14 22.059 22.059 14 32 14 z" fill="#222222"/></svg>}
          {darkMode && <svg viewBox="0 0 64 64" width="48px" height="48px"><path d="M 32 10 C 19.85 10 10 19.85 10 32 C 10 44.15 19.85 54 32 54 C 44.15 54 54 44.15 54 32 C 54 19.85 44.15 10 32 10 z M 32 14 C 41.941 14 50 22.059 50 32 C 50 40.238706 44.458716 47.16934 36.904297 49.306641 C 36.811496 49.1154 36.747844 48.905917 36.753906 48.667969 C 36.784906 47.458969 36.753906 44.637563 36.753906 43.601562 C 36.753906 41.823563 35.628906 40.5625 35.628906 40.5625 C 35.628906 40.5625 44.453125 40.662094 44.453125 31.246094 C 44.453125 27.613094 42.554688 25.720703 42.554688 25.720703 C 42.554688 25.720703 43.551984 21.842266 42.208984 20.197266 C 40.703984 20.034266 38.008422 21.634812 36.857422 22.382812 C 36.857422 22.382813 35.034 21.634766 32 21.634766 C 28.966 21.634766 27.142578 22.382812 27.142578 22.382812 C 25.991578 21.634813 23.296016 20.035266 21.791016 20.197266 C 20.449016 21.842266 21.445312 25.720703 21.445312 25.720703 C 21.445312 25.720703 19.546875 27.611141 19.546875 31.244141 C 19.546875 40.660141 28.371094 40.5625 28.371094 40.5625 C 28.371094 40.5625 27.366329 41.706312 27.265625 43.345703 C 26.675939 43.553637 25.872132 43.798828 25.105469 43.798828 C 23.255469 43.798828 21.849984 42.001922 21.333984 41.169922 C 20.825984 40.348922 19.7845 39.660156 18.8125 39.660156 C 18.1725 39.660156 17.859375 39.981656 17.859375 40.347656 C 17.859375 40.713656 18.757609 40.968484 19.349609 41.646484 C 20.597609 43.076484 20.574484 46.292969 25.021484 46.292969 C 25.547281 46.292969 26.492043 46.171872 27.246094 46.068359 C 27.241926 47.077908 27.230199 48.046135 27.246094 48.666016 C 27.251958 48.904708 27.187126 49.114952 27.09375 49.306641 C 19.540258 47.168741 14 40.238046 14 32 C 14 22.059 22.059 14 32 14 z" fill="#eeeeee"/></svg>}
        </a>
      </div>
      <div className='header-container'>
        <div className='centered-text'>
          <h1 style={{textAlign:'center'}}>Portfolio Optimization</h1>
        </div>
        <div className='right-div'>
          <DarkModeSelector
              darkMode={darkMode}
              recvDarkMode={setDarkMode}
          />
        </div>
      </div>
      <br/>
      <div 
          className='search-bar-container'
          ref={containerRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex="-1"
      >
        <SearchBar
            setTickers={setTickers}
            isFocused={isFocused}
            darkMode={darkMode}
        />
        {isFocused && <SearchResultsList
            tickers={tickers}
            failedTickers={failedTickers}
            stocks={stocks}
            addStock={addStock}
            deleteStock={deleteStock}
            darkMode={darkMode}
        />}
      </div>
      <br/>

      {!showPlots && <div className='placeholder'>
        <h2>Select At Least 2 Stocks...</h2>
        <br/>
        <h3>...or more</h3>
      </div>}
      
      {stocks.length > 0 && <SelectedList
          stocks={stocks}
          changeSelection={changeSelection}
          removeStock={removeStock}
          deleteStock={deleteStock}
          darkMode={darkMode}
      />}

      {showPlots ? <div className='graphs-container'>
        <GraphFrontier
            frontierUnconstrained={frontierUnconstrained}
            frontierConstrained={frontierConstrained}
            scatterUnconstrained={scatterUnconstrained}
            scatterConstrained={scatterConstrained}
            stockPoints={stockPoints}
            darkMode={darkMode}
        />
        <GraphWeights
            frontierConstrained={frontierConstrained}
            darkMode={darkMode}
        />
        <GraphCorrelation
            tickerSymbols={tickerSymbols}
            corrMatrix={corrMatrix}
            darkMode={darkMode}
        />
      </div> : <div>
        <br/><br/><br/><br/>
      </div>}
      <div className='info-section'>
        <br/>
        <hr style={{ border: 'none', height: '5px', backgroundColor: 'currentColor', marginRight: '5%' }} />
        <br/>
        <h3>What is Portfolio Optimization?</h3>
        <p>The Markowitz portfolio optimization scheme aims to minimize the volatility of a portfolio while maximizing its return.</p>
        <p>The efficiency frontier is the curve of minimum volatility for any given return.</p>
        <p>Without short selling, returns are bounded by the assets held.</p>
        <p>When allowing for shorting, one can achieve both a higher maximum return, as well as lower volatility in many cases.</p>
        <p>In practice, there are limits to how much one can borrow.</p>
        <br/>
        <h3>Does it Work?</h3>
        <h4>Theoretically: Yes... Practically: No</h4>
        <p>It will find what <i>would have been</i> the optimal portfolio to have held last year.</p>
        <p>However, this year's returns, volatilities, and correlations won't be the same as they were previously.</p><br/>
        <p>...Also, who's to say that an optimal portfolio minimizes variance. Why should a long-term investor care?</p>
        <br/>
        <h3>Useful Sources</h3>
        <p>Wikipedia: <a href='https://en.wikipedia.org/wiki/Efficient_frontier'>Efficiency Frontier</a></p>
        <p>Wikipedia: <a href='https://en.wikipedia.org/wiki/Modern_portfolio_theory'>Modern Portfolio Theory</a></p>
        <p>Corporate Finance Institute: <a href='https://corporatefinanceinstitute.com/resources/career-map/sell-side/capital-markets/modern-portfolio-theory-mpt/'>Modern Portfolio Theory</a></p>
      </div>
    </div>
  );
}

export default App;
