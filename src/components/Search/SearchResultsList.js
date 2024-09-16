import './SearchResultsList.css';

import SearchResult from './SearchResult';

const SearchResultsList = ({
        tickers,
        failedTickers,
        stocks,
        addStock,
        deleteStock,
        darkMode
}) => {
    return (
        <div className='results-list'>
            {tickers.map((ticker, id) => {
                return (
                    <SearchResult
                        key={id}
                        ticker={ticker}
                        failedTickers={failedTickers}
                        stocks={stocks}
                        addStock={addStock}
                        deleteStock={deleteStock}
                    />
                )
            })}
        </div>
    );
}
export default SearchResultsList;