import React from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { connect } from 'react-redux';

import Header from './shared/Header';
import Graph from './shared/Graph';

import Home from './pages/Home';

const BaseLayout = props => {
    return (
        <div>
            <Header/>
            {props.children}
            <Graph/>
        </div>
    )
}

const App = props => {
    return (
        <Router history={browserHistory}>
                <Route component={BaseLayout}>
                    <Route path="/" name="home" component={Home} />
                </Route>
        </Router>
    )
}

export default App;