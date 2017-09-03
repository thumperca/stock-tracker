import React from 'React';
import axios from 'axios';
import { connect } from 'react-redux';


//  Overview for a single stock
const StockOverview = props => {
    //  Stock statistics
    const stats = props.stats.map((stat, i) => {
        const elmClass = 'stat ' + stat.direction;
        const symbol = stat.direction == 'up' ? '+' : '-';
        return <div class={elmClass} key={i}>{symbol}{stat.difference}% ({stat.days})</div>
    })
    //  return JSX
    return (
        <div class="item col-sm-6" onClick={e => props.select(props.symbol)}>
            <div class="symbol">{props.symbol}</div>
            { stats }
            {/*<div class="balance up">+300.64</div>*/}
        </div>
    )
}

const mapDispatchToProps = dispatch => {
    return {
        select: stock => dispatch({type: 'SELECT', payload: stock})
    }
}

const Stock = connect(null, mapDispatchToProps)(StockOverview);


const List = props => {
    const stocks = props.stocks.map((stock, i) => <Stock {...stock} key={i} />)
    return (
        <div class="list row">
            { stocks }
        </div>
    )
}

export default List;