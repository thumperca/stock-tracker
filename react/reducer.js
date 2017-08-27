import initalState from "./state";

const reducer = (state=initalState, action) => {

    const { payload } = action;

    switch ( action.type ) {

        case "TYPE_CHANGE":
            state = {...state, view: payload};
            break;

    }
    return state;
}

export default reducer;