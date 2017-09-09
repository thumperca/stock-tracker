import React from 'React';
import axios from 'axios';
import { connect } from 'react-redux';

import List from './shared/List';


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
        axios.get('/api/stocks?q='+props.page).then(res => {
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
        const { stocks, loading } = this.state;
        //  Page loading
        if ( loading ) return <h3>Loading...</h3>;
        //  Main JSX
        return (
            <div class="container">
                <h2>Stocks in Shortlist</h2>
                <input id="quick-search" onChange={e => this.search(e)} type="search" class="form-control" placeholder="Search..." />
                <List stocks={stocks} />
            </div>
        )
    }

}
