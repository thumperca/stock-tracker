import React from 'react';
import axios from 'axios';

const List = props => {
    const stocks = props.stocks.map((stock, i) => {
        return <div key={i}><strong>{stock[0]}</strong> {stock[1]}</div>
    })
    return (
        <div class="col-sm-6">
            {stocks}
        </div>
    )
}


const Stocks = props => {
    if ( props.stocks.length == 0 ) return null;
    const breakPoint = Math.ceil(props.stocks.length / 2);
    const list_one = props.stocks.slice(0, breakPoint);
    const list_two = props.stocks.slice(breakPoint);

    return (
        <div class="row">
            <List stocks={list_one} />
            <List stocks={list_two} />
        </div>
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
