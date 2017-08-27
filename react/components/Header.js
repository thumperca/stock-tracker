import React from 'React';


export default class Header extends React.Component {

    render() {
        return (
            <nav class="clearfix">
                <div class="container">
                    <div class="pull-left">
                        <img src="/static/logo.png" />
                    </div>
                    <div class="pull-right">
                        <a href="" class="active">Portfolio</a>
                        <a href="">Shortlist</a>
                    </div>
                </div>
            </nav>
        )
    }

}
