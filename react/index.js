import React from "react";
import { render } from "react-dom";
import {Provider} from "react-redux";
import store from "./store";
import axios from 'axios';

//  Axios link with Django's CSRF security filter
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

import App from "./components/app";

render(<Provider store={store}><App/></Provider>, window.document.getElementById("app"));
