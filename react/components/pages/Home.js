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
            //  list of stocks to show on screen
            stocks: []
        }
    }

    //  load stocks on page load
    componentDidMount(props) {
        if ( !props ) props = this.props;
        this.setState({loading: true})
        axios.get('/api/stocks?q='+props.page).then(res => this.setState({loading: false, stocks: res.data}))
    }

    //  update stock when user switches b/w portfolio & watchlist
    componentWillReceiveProps(nextProps) {
        if ( nextProps.view == this.props.view ) return;
        this.componentDidMount(nextProps);
    }

    render() {
        const { stocks, loading } = this.state;
        //  Page loading
        if ( loading ) return <h3>Loading...</h3>;
        //  Main JSX
        return (
            <div class="container">
                <h2>Stocks in Shortlist</h2>
                <List stocks={stocks} />
            </div>
        )
    }

}
