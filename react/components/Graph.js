import React from 'react';
import { connect } from 'react-redux';


class Graph extends React.Component {

    render() {
        if ( !this.props.stock ) return null;
        return (
            <div class="modal fade in" style={{'display': 'block'}}>
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" onClick={e => this.props.close()}>&times;</button>
                            <h4 class="modal-title">Modal title</h4>
                        </div>
                        <div class="modal-body">
                            Lorem ipsum dolor sit amet.
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
