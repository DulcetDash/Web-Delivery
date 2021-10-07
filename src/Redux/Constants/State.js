const STATE = {
  //ASSETS
  userData: {
    //Will contain all the user infos
    loginData: null, //Will contain all the logging related data
  },

  userCurrentLocationMetaData: {}, //Metadata of the user's current location - directly geocoded and shallowly processed
  latitude: 0,
  longitude: 0,

  tripsData: [], //Will hold all the trips data
  temporaryPackagePurchaseVars: {
    planName: null,
    amount: 0,
  },
};

export default STATE;
