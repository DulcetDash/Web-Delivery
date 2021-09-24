/**
 * ACTIONS CREATORS FOR MAINLY HOME GLOBAL STATE
 * This file maps all the actions mainly targeting the home screen, but can also
 * include other screens actions.
 * For actions without a specific payload, defaults the payload to - true.
 */

//1. Update the loggin data
export const UpdateLoggingData = (dataReceived) => ({
  type: "UPDATE_LOGGIN_DATA",
  payload: dataReceived,
});

//2. Update current location metadata
//Responsible for updating the current location metadata of the user
//@param currentLocationMtd: metadata of the current user location.
export const UpdateCurrentLocationMetadat = (currentLocationMtd) => ({
  type: "UPDATE_CURRENT_LOCATION_METADATA",
  payload: currentLocationMtd,
});

//1. Update the trips data
export const UpdateTripsData = (dataReceived) => ({
  type: "UPDATE_TRIPS_DATA",
  payload: dataReceived,
});

//3. Log out
export const LogOut = () => ({
  type: "LOG_OUT",
});

//4. Update the plan that's about to be pruchased
export const UpdatePlanPurchaseData = (dataReceived) => ({
  type: "UPDATE_PLAN_PURCHASE_DATA",
  payload: dataReceived,
});
