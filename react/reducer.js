import initalState from "./state";

const reducer = (state=initalState, action) => {

    switch ( action.type ) {

        case "PAGE_CHANGE":
            state = {...state, page:action.payload};
            break;

    }
    return state;
}

export default reducer;