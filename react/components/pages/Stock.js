import React from 'react';
import axios from 'axios';


const Track = props => {

    let shortBtn, buyBtn;

    if ( props.watchlist ) {
        shortBtn = <button onClick={e => props.update({watchlist: false})} class="btn btn-xs btn-danger">Remove</button>
    } else {
        shortBtn = <button onClick={e => props.update({watchlist: true})} class="btn btn-xs btn-success">Add</button>
    }

    if ( props.purchased ) {
        buyBtn = <button onClick={e => props.update({purchased: false})} class="btn btn-xs btn-danger">Sell</button>
    } else {
        buyBtn = <button onClick={e => props.update({purchased: true})} class="btn btn-xs btn-success">Buy</button>
    }


    return (
        <div class="pull-right">
            {shortBtn}
            {buyBtn}
        </div>
    )

}

class Graph extends React.Component {

    constructor(props) {
        super(props);
        this.state = {period: '1Y', loading: false}
    }

    componentDidMount(props) {
        if ( !props ) props = this.props;
        console.log(props);
        const { symbol } = props;
        if ( !symbol ) return;
        this.setState({loading: true});
        axios.get(`/api/ema/${symbol}/?t=${this.state.period}`).then(res => {
            this.setState({loading: false});
            this.loadGraph(res.data)
        })
    }

    componentWillReceiveProps(nextProps) {
        if ( nextProps.symbol == this.props.symbol ) return;
        this.componentDidMount(nextProps);
    }

    changePeriod(period) {
        this.setState({period: period, loading: true})
        setTimeout(this.componentDidMount.bind(this), 200);
    }

    loadGraph(data) {
        const elm = document.getElementById('chart');
        const hide = ['1Y', '2Y', 'Max'];
        const pointRadius = hide.indexOf(this.state.period) == -1 ? 2 : 0.5;
        new Chart(elm, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        data: data.prices,
                        label: 'Price',
                        borderColor: '#bbb',
                        fill: true,
                        pointRadius: pointRadius,
                    },
                    {
                        data: data.short,
                        label: 'EMA(10)',
                        borderColor: '#85a',
                        pointRadius: pointRadius,
                    },
                    {
                        data: data.mid,
                        label: 'EMA(50)',
                        borderColor: '#3b9',
                        pointRadius: pointRadius,
                    },
                    {
                        data: data.long,
                        label: 'EMA(200)',
                        borderColor: '#c55',
                        pointRadius: pointRadius,
                    },
                ]
            },
            options: {
                elements: {
                    line: {
                        //  Enable this to disable bezier curves
                        //  Disabling bezier curves also improves rendering performance
                        tension: 0
                    }
                },
            }
        })
    }

    render() {
        const { symbol } = this.props;
        if ( !symbol || this.state.loading ) return null;

        const periodOptions = ['1W', '1M', '3M', '6M', '1Y', '2Y', 'Max'];
        const periods = periodOptions.map((period, i) => {
            const postfix = (this.state.period == period) ? 'primary' : 'default';
            const elmClass = 'btn btn-xs btn-' + postfix;
            return (<button key={i} type="button" onClick={e => this.changePeriod(period)} class={elmClass}>{period}</button>);
        })

        return (
            <div class="graph">
                <div class="pull-left">
                    { periods }
                </div>
                <Track {...this.props} />
                <canvas id="chart"></canvas>
            </div>

        )
    }

}


const List = props => {
    const data = props.data.map((entry, i) => {
        return <div key={i}>{entry[props.field]}</div>
    })
    return (
        <div>{data}</div>
    )
}


const Table = props => {
    if ( props.data.length == 0 ) return null;

    const styles = {
        table: {
            marginTop: '2em'
        }
    }

    const data = props.data.map((stock, i) => {
        return (
            <tr key={i}>
                <td>{stock.date}</td>
                <td>{stock.price}</td>
                <td>{stock.quantity}</td>
                <td>{stock.delivery}</td>
            </tr>
        )
    })

    return (
        <table class="table table-striped" style={styles.table}>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Price</th>
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


export default class Stock extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            symbol: props.routeParams.symbol,
            purchased: null,
            watchlist: null,
            data: []
        }
    }

    componentDidMount() {
        const url = `/api/stock/${this.state.symbol}/`;
        axios.get(url).then(res => this.setState({...res.data, loading: false}));
    }

    update(data) {
        const url = `/api/stock/${this.state.symbol}/`;
        axios.post(url, data).then(res => this.setState({...res.data}));
    }

    render() {
        const { symbol, data, purchased, watchlist, loading } = this.state;
        if ( !symbol || loading ) return null;
        return (
            <div class="container">
                <h4 class="text-center">Stock: {symbol}</h4>
                <div class="row">
                    <div class="col-md-1">
                        <h5>Qty</h5>
                        <List data={data} field="quantity" />
                    </div>
                    <div class="col-md-10">
                        <Graph {...this.state} update={this.update.bind(this)} />
                    </div>
                    <div class="col-md-1">
                        <h5>Delivery</h5>
                        <List data={data} field="delivery" />
                    </div>
                    <div class="col-md-8 col-md-offset-2">
                        <Table data={data} />
                    </div>
                </div>
            </div>
        )
    }

}
