import React from 'React';
import { connect } from 'react-redux';

class List extends React.Component {

    render() {
        return (
            <div class="container">
                <h2>Stocks in {this.props.page}</h2>
                <div class="list row">
                    <div class="item col-sm-6">
                        <div class="symbol">SJVN</div>
                        <div class="stat down">-3.5% (10)</div>
                        <div class="stat up">+3.2% (50)</div>
                        <div class="stat up">+15.3% (200)</div>
                        <div class="balance up">+300.64</div>
                    </div>
                </div>
            </div>
        )
    }

}


const mapStateToProps = state => {
    return {page: state.view}
}

export default connect(mapStateToProps)(List);