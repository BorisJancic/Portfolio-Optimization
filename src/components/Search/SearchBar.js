import React, { useEffect, useState } from 'react'
import './SearchBar.css';

const SearchBar = ({ setTickers, isFocused, darkMode }) => {
    const [input, setInput] = useState("");

    useEffect(() => {
        setInput("");
        setTickers([]);
    }, [isFocused]);

    const fetchData = (value) => {
        if (value === "") {
            setTickers([]);
            return;
        }
        let url = `https://query1.finance.yahoo.com/v1/finance/search?q=${value}`
        url = 'https://corsproxy.io/?' + encodeURIComponent(url);

        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error();
                }
                return response.json()}
            ).then((json) => {
                if (json['quotes']) {
                    const tickers = json['quotes'].filter((stock) => {
                        return (
                            value &&
                            stock &&
                            (stock.exchange === "NYQ" || stock.exchange === "NMS") &&
                            stock.shortname
                        )
                    });
                    setTickers(tickers);
                } else { setTickers([]); }
            }).catch(() => {});
    }

    const handleChange = (value) => {
        setInput(value)
        fetchData(value)
    }

    return (
      <div className='input-wrapper'>
        <input
            placeholder='Search stocks...'
            value={input}
            onChange={ (e) => handleChange(e.target.value) }
        />
      </div>
    );
  }
  
  export default SearchBar;