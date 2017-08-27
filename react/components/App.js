import React from 'react';
import { connect } from 'react-redux';

import Header from './Header';

class App extends React.Component {

    render() {
        return (
            <div>
                <Header/>
            </div>
        )
    }

}


const mapStateToProps = state => {
    return {page: state.view}
}

export default connect(mapStateToProps)(App);
