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
