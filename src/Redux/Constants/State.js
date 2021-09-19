import React from "react";
import SOCKET_CORE from "../../Helper/managerNode";
// import carIcon_black from "../../Assets/Images/caradvanced_black.png";
// import {Animated} from 'react-native';
// import {Dimensions} from 'react-native';
// const windowWidth = Dimensions.get('window').width;
// const windowHeight = Dimensions.get('window').height;
// //Default no GPRS background image
// const backgroundVirgin = require('../../../Media_assets/Images/background.jpg');
// const supportMainImage = require('../../../Media_assets/Images/faq.jpg');
// //Images res
// const packageIco = require('../../../Media_assets/Images/box_delivery.png');
// const carChooseIco = require('../../../Media_assets/Images/car_selection_img.png');
// const taxiRankIco = require('../../../Media_assets/Images/taxi-stop-sign.png');
// //Car on MAP
// const carIcon = require("../../Assets/Images/cargreentop100.png");
// //...
// const privateLocationIco = require('../../../Media_assets/Images/home.jpeg');
// const airportLocationIco = require('../../../Media_assets/Images/flight.png');
// //Economy
// const carImageNormalRide = require('../../../Media_assets/Images/normaltaxieconomy.jpg');
// const carIconElectricRode = require('../../../Media_assets/Images/electricEconomy.jpg');
// //Comfort
// const comfortrideNormal = require('../../../Media_assets/Images/comfortrideNormal_e.jpg');
// const comfortrideElectric = require('../../../Media_assets/Images/comfortrideElectric_d.jpg');
// //Luxury
// const luxuryRideNormal = require('../../../Media_assets/Images/luxuryRideNormal_d.jpg');
// const luxuryRideElectric = require('../../../Media_assets/Images/luxuryRideElectric.jpg');
// //DELIVERY
// //Standard
// //Ebikes
// const bikesdeliveryElectric = require('../../../Media_assets/Images/bikesdeliveryElectric.jpg');
// //Normal bikes
// const bikesdeliveryNormal = require('../../../Media_assets/Images/bikesdeliveryNormal_d.jpg');
// //Large capacity
// //Car
// const cardeliveryNormal = carImageNormalRide;
// //Mini van
// const vandeliveryNormal = require('../../../Media_assets/Images/vandeliveryNormal_c.jpg');
// //COMPLIMENTS IMAGES
// const cleanAndTidy = require('../../../Media_assets/Images/Compliments/spray.png');
// const excellentService = require('../../../Media_assets/Images/Compliments/excellence.png');
// const greatMusic = require('../../../Media_assets/Images/Compliments/music-note.png');
// const greatNavigation = require('../../../Media_assets/Images/Compliments/navigation.png');
// const greatConversation = require('../../../Media_assets/Images/Compliments/chat.png');
import timeIco from "../../Images/stopwatch.png";

const STATE = {
  //ASSETS
  // windowWidth: windowWidth,
  // windowHeight: windowHeight,
  // backgroundVirgin: backgroundVirgin,
  // supportMainImage: supportMainImage,
  timeIco: timeIco,
  //On map assets
  // carIcon: carIcon,
  // carIcon_black: carIcon_black,
  //Compliments
  // cleanAndTidy: cleanAndTidy,
  // excellentService: excellentService,
  // greatMusic: greatMusic,
  // greatNavigation: greatNavigation,
  // greatConversation: greatConversation,
  // //...
  // packageIco: packageIco,
  // carChooseIco: carChooseIco,
  // taxiRankIco: taxiRankIco,
  // privateLocationIco: privateLocationIco,
  // airportLocationIco: airportLocationIco,
  // carImageNormalRide: carImageNormalRide,
  // carIconElectricRode: carIconElectricRode,
  // //Comfort
  // comfortrideNormal: comfortrideNormal,
  // comfortrideElectric: comfortrideElectric,
  // //Luxury
  // luxuryRideNormal: luxuryRideNormal,
  // luxuryRideElectric: luxuryRideElectric,
  // //Delivery
  // bikesdeliveryElectric: bikesdeliveryElectric,
  // bikesdeliveryNormal: bikesdeliveryNormal,
  // cardeliveryNormal: cardeliveryNormal,
  // vandeliveryNormal: vandeliveryNormal,
  // tripCurrentlySelectedFp: null,    //The fp of the currently selected trip
  userData: {
    //Will contain all the user infos
    loginData: null, //Will contain all the logging related data
  },

  userCurrentLocationMetaData: {}, //Metadata of the user's current location - directly geocoded and shallowly processed
  latitude: 0,
  longitude: 0,
};

export default STATE;
