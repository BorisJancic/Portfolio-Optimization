import { useEffect, useState } from 'react';
import './SearchResult.css';

const SearchResult = ({
        ticker,
        failedTickers,
        stocks,
        addStock,
        deleteStock,
        darkMode
}) => {
    const handleClick = () => {
        if (failedTickers.includes(ticker.shortname)) {
            return;
        } else if (stocks.some(stock => stock.shortname === ticker.shortname)) {
            deleteStock(ticker);
        } else {
            addStock(ticker);
        }
    }

    const [statusClass, setStatusClass] = useState('neutral');
    useEffect(() => {
        if (failedTickers.includes(ticker.shortname)) {
            setStatusClass('failed');
        } else if (stocks.some(stock => stock.shortname === ticker.shortname && stock.selected)) {
            setStatusClass('selected');
        } else if (stocks.some(stock => stock.shortname === ticker.shortname && !stock.selected)) {
            setStatusClass('unselected');
        } else {
            setStatusClass('neutral');
        }
    }, [failedTickers, stocks, ticker.shortname]);
    const className = `search-result ${statusClass}`;

    return (
        <div
            className={className}
            onClick={handleClick}
        >
            {ticker.symbol}: {ticker.shortname}
        </div>
    );
}
export default SearchResult;