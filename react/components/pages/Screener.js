import React from 'react';
import axios from 'axios';

import List from './shared/List';


export default class Screener extends React.Component {

    constructor(props) {
        super(props);
        this.state = {ema: '200', stocks: []}
    }

    change(event, ema) {
        event.preventDefault();
        this.setState({ema: ema});
    }

    render() {
        const { loading, stocks } = this.state;

        const emas = ['50', '100', '200'];
        const tabs = emas.map((ema, i) => {
            const elmClass = ema == this.state.ema ? 'active' : null;
            return (
                <li class={elmClass}>
                    <a href="#" onClick={e => this.change(e, ema)}>{ema}</a>
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
