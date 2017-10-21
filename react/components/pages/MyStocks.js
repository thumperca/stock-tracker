import React from 'react';
import axios from 'axios';


const purchasedIcon = <span class="stat up"><i class="glyphicon glyphicon-ok"></i></span>;
const notPurchasedIcon = <span class="stat down"><i class="glyphicon glyphicon-remove"></i></span>;


export default class MyStocks extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            stocks: []
        }
    }

    componentDidMount() {
        document.title = 'My Stocks';
        axios.get('/api/my-stocks/').then(res => this.setState({stocks: res.data}))
    }


    render() {
        const { stocks } = this.state;
        let data;

        if ( stocks.length ) {
            data = stocks.map((stock, i) => {
                const url = '/stock/' + stock.symbol;
                const icon = stock.purchased ? purchasedIcon : notPurchasedIcon
                return (
                    <tr key={i}>
                        <td><a target="_blank" href={url}>{stock.symbol}</a></td>
                        <td>{stock.price}</td>
                        <td>{icon}</td>
                    </tr>
                )
            })
        }

        return (
            <div class="container">
                <div class="col-md-6 col-md-offset-3">
                     <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Price</th>
                                <th>Purchased</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
