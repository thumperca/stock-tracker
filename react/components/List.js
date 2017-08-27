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


class List extends React.Component {

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
        //  Page loading
        if ( this.state.loading ) return 'Loading...';
        //  Single Stock entry
        const stocks = this.state.stocks.map((stock, i) => <Stock {...stock} key={i} />)
        //  Main JSX
        return (
            <div class="container">
                <h2>Stocks in {this.props.page}</h2>
                <div class="list row">
                    { stocks }
                </div>
            </div>
        )
    }

}


const mapStateToProps = state => {
    return {page: state.view}
}

export default connect(mapStateToProps)(List);