import './SelectedList.css';

import Asset from './Asset';
import RemovedAsset from './RemovedAsset';

const SelectedList = ({stocks, changeSelection, removeStock, deleteStock, darkMode }) => {
    return (
        <div className='selected-list-container'>
            <div className='selected-list-header'>
                <h3>Selected Stocks</h3><br/>
            </div>
            <div className='selected-list-wrapper'>
                <div className='selected-list'>
                    {stocks.map((stock, index) => (
                        stock.selected ? <Asset
                            key={index}
                            stock={stock}
                            changeSelection={changeSelection}
                            removeStock={removeStock}
                            deleteStock={deleteStock}
                        /> :
                        <RemovedAsset
                            key={index}
                            stock={stock}
                            changeSelection={changeSelection}
                            removeStock={removeStock}
                            deleteStock={deleteStock}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
export default SelectedList;