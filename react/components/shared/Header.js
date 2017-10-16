import React from 'React';
import { Link } from 'react-router';
import { connect } from 'react-redux';

const Header = props => {

    return (
        <nav class="clearfix">
            <div class="container">
                <div class="pull-left">
                    <img src="/static/logo.png" />
                </div>
                <div class="pull-right">
                   <Link to="/" activeClassName="active">Shortlist</Link>
                   <Link to="/screener" activeClassName="active">Screener</Link>
                   <Link to="/gains" activeClassName="active">Gains</Link>
                   <Link to="/signals" activeClassName="active">Signals</Link>
                </div>
            </div>
        </nav>
    )

}

export default Header;