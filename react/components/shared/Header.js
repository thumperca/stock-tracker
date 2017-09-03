import React from 'React';
import { connect } from 'react-redux';

const Header = props => {

    const options = ['Portfolio', 'Shortlist'];
    const btns = options.map((option, i) => {
        const elmclass = option == props.view ? 'active' : '';
        return <a key={i} href="" onClick={e => props.change(e, option)} class={elmclass}>{option}</a>
    })

    return (
        <nav class="clearfix">
            <div class="container">
                <div class="pull-left">
                    <img src="/static/logo.png" />
                </div>
                <div class="pull-right">
                   {btns}
                </div>
            </div>
        </nav>
    )

}

const mapStateToProps = state => {
    return {view: state.view}
}

const mapDispatchToProps = dispatch => {
    return {
        change: (event, option) => {
            event.preventDefault();
            dispatch({type: 'TYPE_CHANGE', payload: option})
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
