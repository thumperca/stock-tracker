import React from 'React';
import axios from 'axios';
import { connect } from 'react-redux';



const Table = props => {
    if ( props.stocks.length == 0 ) return null;

    const getDiff = (stock, key) => {
        const diff = stock[key]
        if ( diff.direction == 'up' ) {
            return <span class="stat up">+{diff.difference}%</span>
        } else if ( diff.direction == 'down' ) {
            return <span class="stat down">-{diff.difference}%</span>
        } else {
            return ''
        }
    }

    const data = props.stocks.map((stock, i) => {
        const url = '/stock/' + stock.symbol;
        return (
            <tr key={i}>
                <td><a target="_new" href={url}>{stock.symbol}</a></td>
                <td>{getDiff(stock, '3m')}</td>
                <td>{getDiff(stock, '6m')}</td>
                <td>{getDiff(stock, '12m')}</td>
                <td>{stock.price}</td>
                <td>{stock.quantity}</td>
                <td>{stock.delivery}</td>
            </tr>
        )
    })

    return (
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Symbol</th>
                    <th>3m</th>
                    <th>6m</th>
                    <th>12m</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Delivery</th>
                </tr>
            </thead>
            <tbody>
                {data}
            </tbody>
        </table>
    )
}


export default class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            //  loading status of page
            //  true when loading data from server
            loading: false,
            //  list of stocks loaded from server
            all : [],
            //  list of stocks to show on screen
            stocks: []

        }
    }

    //  load stocks on page load
    componentDidMount(props) {
        if ( !props ) props = this.props;
        this.setState({loading: true})
        axios.get('/api/stocks/').then(res => {
            this.setState({loading: false, stocks: res.data, all: res.data})
        })
    }

    //  update stock when user switches b/w portfolio & watchlist
    componentWillReceiveProps(nextProps) {
        if ( nextProps.view == this.props.view ) return;
        this.componentDidMount(nextProps);
    }

    search(event) {
        let value = event.target.value.replace(' ', '').toUpperCase();
        if ( !value.length ) {
            this.setState({stocks: this.state.all});
            return;
        }
        const stocks = this.state.all;
        let list = [];
        for ( let i in stocks ) {
            let symbol = stocks[i].symbol;
            if ( symbol.indexOf(value) == -1 ) continue;
            list.push(stocks[i]);
        }
        this.setState({stocks: list});
    }

    render() {
        const { stocks, loading, all } = this.state;
        //  Page loading
        if ( loading ) return <h3>Loading...</h3>;
        //  Main JSX
        return (
            <div class="container">
                <div class="col-md-8 col-md-offset-2">
                    <h2>All Stocks ({all.length})</h2>
                    <input id="quick-search" onChange={e => this.search(e)} type="search" class="form-control" placeholder="Search..." />
                    <Table stocks={stocks} />
                </div>
            </div>
        )
    }

}
