import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';


class Graph extends React.Component {

    componentDidMount(props) {
        if ( !props ) props = this.props;
        const { stock } = props;
        if ( !stock ) return;
        axios.get(`/api/stock/${stock}/`).then(res => this.loadGraph(res.data))
    }

    componentWillReceiveProps(nextProps) {
        if ( nextProps.stock == this.props.stock ) return;
        this.componentDidMount(nextProps);
    }

    loadGraph(data) {
        const elm = document.getElementById('chart');
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
                        borderWidth: 1,
                        pointStyle: 'line',
                    },
                    {
                        data: data.short,
                        label: 'EMA(10)',
                        borderColor: '#85a',
                        pointStyle: 'line',
                    },
                    {
                        data: data.mid,
                        label: 'EMA(50)',
                        borderColor: '#3b9',
                        pointStyle: 'line',
                    },
                    {
                        data: data.long,
                        label: 'EMA(200)',
                        borderColor: '#c55',
                        pointStyle: 'line',
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
        return (
            <div class="modal fade in" style={{'display': 'block'}}>
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-body">
                            <button type="button" class="close" onClick={e => this.props.close()}>&times;</button>
                            <h4>Graph for {stock}</h4>
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
