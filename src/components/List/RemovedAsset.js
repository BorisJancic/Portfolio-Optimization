import './RemovedAsset.css';


const RemovedAsset = ({stock, changeSelection, deleteStock, addStock}) => {
    const handleChangeSelection = () => { changeSelection(stock.shortname); }
    const handleDelete = () => { deleteStock(stock); }
    const handleAdd = () => { addStock(stock); }

    return (
        <div className='asset-container'>
            <div className='removed-info'>
                {stock.symbol}
                {/* {stock.shortname}<br/> μσ*/}
                <br/>
                Return: {(stock.return).toFixed(0)}%<br/>
                Volatility: {Math.sqrt(stock.variance).toFixed(0)}%
            </div>
            <div className='removed-info options'>
                <div className='removed-add' onClick={handleChangeSelection}>
                    <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
                </div>
                <div className='removed-delete' onClick={handleDelete}>
                    <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
                </div>
            </div>
        </div>
    );
}
export default RemovedAsset;