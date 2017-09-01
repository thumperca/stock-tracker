import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';


class Graph extends React.Component {

    constructor(props) {
        super(props);
        this.state = {period: '1Y', loading: false}
    }

    componentDidMount(props) {
        if ( !props ) props = this.props;
        const { stock } = props;
        if ( !stock ) return;
        this.setState({loading: true});
        axios.get(`/api/stock/${stock}/?t=${this.state.period}`).then(res => {
            this.setState({loading: false});
            this.loadGraph(res.data)
        })
    }

    componentWillReceiveProps(nextProps) {
        if ( nextProps.stock == this.props.stock ) return;
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
        const { stock } = this.props;
        if ( !stock ) return null;

        if ( this.state.loading ) return null;

        const periodOptions = ['1W', '1M', '3M', '6M', '1Y', '2Y', 'Max'];
        const periods = periodOptions.map((period, i) => {
            const postfix = (this.state.period == period) ? 'primary' : 'default';
            const elmClass = 'btn btn-xs btn-' + postfix;
            return (<button type="button" onClick={e => this.changePeriod(period)} class={elmClass}>{period}</button>);
        })

        return (
            <div class="modal fade in" style={{'display': 'block'}}>
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-body">
                            <button type="button" class="close" onClick={e => this.props.close()}>&times;</button>
                            <h4>Graph for {stock} - </h4>
                            { periods }
                            <canvas id="chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}


const mapStateToProps = state => {
    return {stock: state.stock}
}

const mapDispatchToProps = dispatch => {
    return {
        close: e => dispatch({type: 'SELECT', payload: null})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Graph)
