import React from "react";
import { render } from "react-dom";

import axios from 'axios';

//  Axios link with Django's CSRF security filter
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

import App from "./components/App";

render(<App/>, window.document.getElementById("app"));