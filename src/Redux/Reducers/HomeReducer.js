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
  let generalPurposeReg = null;

  switch (action.type) {
    case "UPDATE_LOGGIN_DATA":
      console.log(action.payload);
      newState.userData.loginData = action.payload;
      //...
      return { ...state, ...newState };

    case "UPDATE_CURRENT_LOCATION_METADATA":
      //? Optmimized
      try {
        //Update the current location metadata - only if different
        if (
          newState.userCurrentLocationMetaData !== undefined &&
          newState.userCurrentLocationMetaData.city !== undefined
        ) {
          //Had some old data
          generalPurposeReg = new RegExp(JSON.stringify(action.payload));
          if (
            generalPurposeReg.test(
              JSON.stringify(newState.userCurrentLocationMetaData)
            )
          ) {
            //Same data - don't update state
            return state;
          } //New data -update state
          else {
            newState.userCurrentLocationMetaData = action.payload;
            //...
            return { ...state, ...newState };
          }
        } //No data at all - update state
        else {
          newState.userCurrentLocationMetaData = action.payload;
          //...
          return { ...state, ...newState };
        }
      } catch (error) {
        console.error(error);
        return state;
      }

    case "UPDATE_TRIPS_DATA":
      //?Optimized
      if (
        `${JSON.stringify(newState.tripsData)}` !==
        `${JSON.stringify(action.payload)}`
      ) {
        //New data received
        newState.tripsData = action.payload;

        return { ...state, ...newState };
      } //Same data
      else {
        return state;
      }
    default:
      return state;
  }
};

export default combineReducers({
  App: HomeReducer,
});
