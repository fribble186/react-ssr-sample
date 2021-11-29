import { FETCH_USERS } from "./users.actions";

const defaultState = {
    users: [],
}

const reducer = (state = defaultState, action) => {
    switch (action.type) {
        case FETCH_USERS:
            return {
                ...state,
                users: action.payload,
            };
        default:
            return state;
    }
};

export default reducer;