import { combineReducers } from "redux";
import STATE from "../Constants/State";
/**
 * Reducer responsible for all the home actions (trip booking, tracking, etc)
 * Centralized file.
 */

const INIT_STATE = STATE;

const HomeReducer = (state = INIT_STATE, action) => {
  //Predefined variables
  let newState = state;

  switch (action.type) {
    case "UPDATE_LOGGIN_DATA":
      console.log(action.payload);
      newState.userData.loginData = action.payload;
      //...
      return { ...state, ...newState };
    default:
      return state;
  }
};

export default combineReducers({
  App: HomeReducer,
});
