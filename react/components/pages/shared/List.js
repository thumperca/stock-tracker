import React from 'React';
import axios from 'axios';
import { connect } from 'react-redux';


//  Overview for a single stock
export const Stock = props => {
    const openUrl = symbol => {
        const url = '/stock/' + symbol;
        var win = window.open(url, '_blank');
        win.focus();
    }
    //  Stock statistics
    const stats = props.stats.map((stat, i) => {
        const elmClass = 'stat ' + stat.direction;
        const symbol = stat.direction == 'up' ? '+' : '-';
        return <div class={elmClass} key={i}>{symbol}{stat.difference}% ({stat.months}M)</div>
    })
    const className = props.className ? props.className : 'item col-sm-6';
    //  return JSX
    return (
        <div class={className} onClick={e => openUrl(props.symbol)}>
            <div class="symbol">{props.symbol}</div>
            { stats }
            {/*<div class="balance up">+300.64</div>*/}
        </div>
    )
}



const List = props => {
    const stocks = props.stocks.map((stock, i) => <Stock {...stock} key={i} />)
    return (
        <div class="list row">
            { stocks }
        </div>
    )
}

export default List;