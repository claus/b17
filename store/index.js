import React, { createContext, useReducer, useContext } from 'react';
import PropTypes from 'prop-types';

const StateContext = createContext();
const DispatchContext = createContext();

export const SET_JPEG = 'SET_JPEG';
export const SET_BUSY = 'SET_BUSY';

const reducer = (state, action) => {
    switch (action.type) {
        case SET_JPEG: {
            return { ...state, jpeg: action.jpeg };
        }
        case SET_BUSY: {
            return { ...state, busy: action.busy };
        }
        default: {
            throw new Error(`Unhandled action type ${action.type}.`);
        }
    }
};

const defaultState = {
    jpeg: null,
    busy: false,
};

export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, defaultState);
    return (
        <DispatchContext.Provider value={dispatch}>
            <StateContext.Provider value={state}>
                {children}
            </StateContext.Provider>
        </DispatchContext.Provider>
    );
};

GlobalProvider.propTypes = {
    children: PropTypes.node,
};

export const useStateContext = () => useContext(StateContext);
export const useDispatchContext = () => useContext(DispatchContext);
