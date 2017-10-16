import React from 'react';
import axios from 'axios';


const Stocks = props => {
    if ( props.stocks.length == 0 ) return null;

    const styles = {
        table: {
            maxWidth: '600px',
            marginLeft: '3em',
            marginTop: '2em'
        }
    }

    const data = props.stocks.map((stock, i) => {
        return (
            <tr key={i}>
                <td><a href="#">{stock.symbol}</a></td>
                <td>{stock.gain}%</td>
                <td>{stock.qty}</td>
                <td>{stock.delivery}%</td>
            </tr>
        )
    })

    return (
        <table class="table table-striped" style={styles.table}>
            <thead>
                <tr>
                    <th>Symbol</th>
                    <th>Gain %age</th>
                    <th>Trade Qty</th>
                    <th>Delivery %age</th>
                </tr>
            </thead>
            <tbody>
                {data}
            </tbody>
        </table>
    )
}


export default class Gains extends React.Component {

    constructor(props) {
        super(props);
        this.state = {loading: false, range: null, stocks: []}
    }

    componentDidMount() {
        this.change(null, '3D');
    }

    change(event, range) {
        if ( event ) event.preventDefault();
        if ( range == this.state.range ) return;
        this.setState({range: range, loading: true});
        axios.get('/api/gains?q='+range).then(res => {
            this.setState({loading: false, stocks: res.data});
        })
    }

    render() {
        const { loading, stocks, range } = this.state;
        if ( !range ) return null;

        const options = ['1D', '2D', '3D', '1W', '2W', '1M', '3M', '6M', '1Y', '2Y'];
        const tabs = options.map((em) => {
            const elmClass = em == this.state.range ? 'active' : null;
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
            page = <Stocks stocks={stocks} />;
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
