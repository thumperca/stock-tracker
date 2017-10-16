import React from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { connect } from 'react-redux';

import Header from './shared/Header';

import Home from './pages/Home';
import Screener from './pages/Screener';
import Signals from './pages/Signals';
import Gains from './pages/Gains';
import Stock from './pages/Stock';

const BaseLayout = props => {
    return (
        <div>
            <Header/>
            {props.children}
        </div>
    )
}

const App = props => {
    return (
        <Router history={browserHistory}>
                <Route component={BaseLayout}>
                    <Route path="/" name="home" component={Home} />
                    <Route path="/screener" name="screener" component={Screener} />
                    <Route path="/signals" name="signals" component={Signals} />
                    <Route path="/gains" name="gains" component={Gains} />
                    <Route path="/stock/:symbol" name="stock" component={Stock} />
                </Route>
        </Router>
    )
}

export default App;