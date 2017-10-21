import React from 'react';
import axios from 'axios';

import { Stock } from './shared/List';


export default class Signals extends React.Component {

    constructor(props) {
        super(props);
        this.state = {loading: true, stocks: []}
    }

    componentDidMount() {
        document.title = 'Buy Signals';
        axios.get('/api/signals').then(res => this.setState({loading: false, stocks: res.data}))
    }

    render() {
        const { loading, stocks } = this.state;
        let page;

        if ( loading ) {
            page = <h4>Loading...</h4>
        } else if ( !stocks.length ) {
            page = <h4>No Signals found</h4>
        } else {
            page = stocks.map((stock, i) => {
                return (
                    <div class="col-sm-6" key={i}>
                        <Stock className="item" {...stock} />
                        <div class="signal-info">
                            <span>Short: {stock.signals.short || '-'}</span>
                            <span>Long: {stock.signals.long || '-'}</span>
                        </div>
                    </div>
                )
            })
        }

        return (
            <div class="container">
                <h2>Sell/buy signal</h2>
                <div class="row list">
                    {page}
                </div>
            </div>
        )
    }

}
