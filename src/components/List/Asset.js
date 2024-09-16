import './Asset.css';


const Asset = ({stock, changeSelection, removeStock, deleteStock}) => {
    const handleChangeSelection = () => { changeSelection(stock.shortname); }
    const handleRemove = () => { removeStock(stock); }
    const handleDelete = () => { deleteStock(stock); }

    return (
        <div className='asset-container'>
            <div className='info'>
                {stock.symbol}
                {/* {stock.shortname}<br/> μσ*/}
                <br/>
                Return: {(stock.return).toFixed(0)}%<br/>
                Volatility: {Math.sqrt(stock.variance).toFixed(0)}%
            </div>
            <div className='info options'>
                <div className='remove' onClick={handleChangeSelection}>
                    <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-440v-80h560v80H200Z"/></svg>
                </div>
                <div className='delete' onClick={handleDelete}>
                    <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
                </div>
            </div>
        </div>
    );
}
export default Asset;