import React from 'react';
import axios from 'axios';

import List from './shared/List';


export default class Screener extends React.Component {

    constructor(props) {
        super(props);
        this.state = {loading: false, ema: null, stocks: []}
    }

    componentDidMount() {
        document.title = 'EMA Screener';
        this.change(null, '200');
    }

    change(event, ema) {
        if ( event ) event.preventDefault();
        if ( ema == this.state.ema ) return;
        this.setState({ema: ema, loading: true});
        axios.get('/api/screener?q='+ema).then(res =>this.setState({loading: false, stocks: res.data}))
    }

    render() {
        const { loading, stocks, ema } = this.state;
        if ( !ema ) return null;

        const emas = ['50', '100', '200'];
        const tabs = emas.map((em) => {
            const elmClass = em == this.state.ema ? 'active' : null;
            return (
                <li class={elmClass} key={em}>
                    <a href="#" onClick={e => this.change(e, em)}>{em}</a>
                </li>
            )
        })

        let page;
        if ( loading ) {
            page = <h3>Loading</h3>;
        } else if ( !stocks.length ) {
            page = <h4>No stocks founds</h4>;
        } else {
            page = <List stocks={stocks} />;
        }

        return (
            <div class="container">
                <h2>Stocks below moving average</h2>
                <ul class="nav nav-tabs" role="tablist">
                    {tabs}
                </ul>
                {page}
            </div>
        )
    }

}
