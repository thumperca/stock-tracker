import React from 'react';
import { connect } from 'react-redux';

import Header from './Header';
import List from './List';
import Graph from './Graph';

class App extends React.Component {

    render() {
        return (
            <div>
                <Header/>
                <List/>
                <Graph/>
            </div>
        )
    }

}


const mapStateToProps = state => {
    return {page: state.view}
}

export default connect(mapStateToProps)(App);
