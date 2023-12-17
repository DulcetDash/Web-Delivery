import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
// import { UpdateLoggingData } from "../Redux/HomeActionsCreators";
import classes from "../../styles/DeliveryNode.module.css";
import {
  AiTwotoneCheckCircle,
  AiTwotoneCalculator,
  AiFillPlusCircle,
  AiTwotoneProject,
  AiFillEnvironment,
  AiFillTag,
} from "react-icons/ai";
import {
  FiTrash2,
  FiChevronDown,
  FiUser,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import {
  MdAccessTime,
  MdDeleteSweep,
  MdNearMe,
  MdCheckCircle,
  MdTrendingFlat,
  MdReportProblem,
} from "react-icons/md";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import ReactMapGL, {
  GeolocateControl,
  Marker,
  WebMercatorViewport,
} from "react-map-gl";
import SOCKET_CORE from "../../Helper/managerNode";
// import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { TailSpin as Loader } from "react-loader-spinner";
import PolylineOverlay from "../../Helper/PolylineOverlay";
import TextField from "@mui/material/TextField";
import DateAdapter from "@mui/lab/AdapterMoment";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import StaticDateTimePicker from "@mui/lab/StaticDateTimePicker";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`;

const SIZE = 20;

const applyToArray = (func, array) => func.apply(Math, array);
const getBoundsForPoints = (points, mapPrimitiveDimensionsObj) => {
  // console.log(mapPrimitiveDimensionsObj);
  // Calculate corner values of bounds
  const pointsLong = points.map((point) => point.longitude);
  const pointsLat = points.map((point) => point.latitude);
  const cornersLongLat = [
    [applyToArray(Math.min, pointsLong), applyToArray(Math.min, pointsLat)],
    [applyToArray(Math.max, pointsLong), applyToArray(Math.max, pointsLat)],
  ];
  // Use WebMercatorViewport to get center longitude/latitude and zoom
  const viewport = new WebMercatorViewport({
    width: mapPrimitiveDimensionsObj.width,
    height: mapPrimitiveDimensionsObj.height,
  }).fitBounds(cornersLongLat, { padding: 50 }); // Can also use option: offset: [0, -100]
  const { longitude, latitude, zoom } = viewport;
  return { longitude, latitude, zoom };
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "1px solid #fff",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

class DeliveryNode extends React.Component {
  constructor(props) {
    super(props);

    this.SOCKET_CORE = SOCKET_CORE;

    this.state = {
      //Will contain all the drop off destination data as they also increase
      pickup_destination: null,
      dropOff_destination: [
        {
          id: 1,
          data: null,
        },
      ],
      //Will hold all the search results and display them accordingly
      focusedInput: 0, //The input in which the search should look at
      shouldShowSearch: true, //? Whether or not to show the search
      loaderStateSearch: true, //?Whether to render the loader or not
      search_querySearch: "", //! Objective search var
      searchResults: [],
      shoudAllowRequest: false, //Whether or not to allow trips based on the data validity: inputs & fare estimation
      fareETAEstimations: {}, //Will hold all the fare and ETA dynaimcally generation on user actions
      isLoadingForFare: false, //Whether or not the fare is being computed
      //....
      latitude: -22.575694, //User latitude
      longitude: 17.083251, //User longitude
      zoom: 13, //Map zoom
      //...
      customFitboundsCoords: {}, //Will contain the lat, long and zoom
      snapshotsToDestination: [], //Will contain the route information to the destinations
      isLoadingEta: false, //Whether or not the eta is being loaded
      scheduledTime: new Date(), //The time scheduled
      isScheduledTrip: false, //Whether or not the request is scheduled
      showDateTimePicker: false, //Whether or not the show the date time picker
      hasCustomPickupLocation: false, //If false will take the current pickup location data
      isLoadingGeneral: false, //General loader
      didRequestJustBeenMade: false, //To know if a request had just been made
      isThereRequestError: false, //To know if there was an error when requesting
      shouldShowModal: false, //TO show modal or not
      destinationNotCompleted: [], //Will hold the destination not well completed
      error_message_onRequest: (
        <>
          Sorry we were unable to make this request due to an unexpected error,
          please refresh you web page and try again. If it persists please
          contact us at <strong>support@taxiconnectna.com</strong>
        </>
      ), //THe merror message to show
      error_onRequest_nature: "error", //The type of error that happended after the request
    };
  }

  componentDidMount() {
    let globalObject = this;

    //! Update current location to the current one by default --------------
    this.resetCurrentPickupLocationToThis();
    //! ---------------------------------------------------------------------

    //Handle socket events
    this.SOCKET_CORE.on("getLocations-response", function (response) {
      // console.log(response);
      //...
      if (
        response !== false &&
        response.result !== undefined &&
        response.result !== false
      ) {
        if (globalObject.state.search_querySearch.length !== 0) {
          globalObject.setState({
            searchResults: response.result.result,
            loaderStateSearch: false,
            shouldShowSearch: true,
            // search_querySearch: "",
          });
        } //No queries to be processed
        else {
          globalObject.setState({
            searchResults: [],
            loaderStateSearch: false,
            shouldShowSearch: false,
            // search_querySearch: "",
          });
        }
      } else {
        //If the search results contained previous results, leave that
        if (globalObject.state.searchResults.length > 0) {
          globalObject.setState({
            loaderStateSearch: false,
            shouldShowSearch: true,
          }); //? Stop the animation loader
        } else {
          globalObject.setState({
            loaderStateSearch: false,
            shouldShowSearch: false,
            // search_querySearch: "",
          }); //? Stop the animation loader
        }
      }
    });

    /**
     * GET FARE ESTIMATION LIST FOR ALL THE RELEVANTS RIDES
     * @event: getPricingForRideorDelivery
     * ? Responsible for getting the list of fare estimates based on the user-selected parameters
     * ? from the pricing service.
     * ! If invalid fare received, try again - leave that to the initiated interval persister.
     */
    this.SOCKET_CORE.on(
      "getPricingForRideorDelivery-response",
      function (response) {
        if (response !== false && response.response === undefined) {
          //Estimates computed
          //Convert to object
          if (typeof response === String) {
            try {
              response = JSON.parse(response);
              let previousFareData = globalObject.state.fareETAEstimations;
              previousFareData["fareData"] = response;
              //...
              globalObject.setState({
                isLoadingForFare: false,
                fareETAEstimations: previousFareData,
                shoudAllowRequest: true,
              });
            } catch (error) {
              response = response;
              let previousFareData = globalObject.state.fareETAEstimations;
              previousFareData["fareData"] = response;
              //...
              globalObject.setState({
                isLoadingForFare: false,
                fareETAEstimations: previousFareData,
                shoudAllowRequest: true,
              });
            }
          } //Try to parse
          else {
            try {
              response = JSON.parse(response);
              let previousFareData = globalObject.state.fareETAEstimations;
              previousFareData["fareData"] = response;
              //...
              globalObject.setState({
                isLoadingForFare: false,
                fareETAEstimations: previousFareData,
                shoudAllowRequest: true,
              });
            } catch (error) {
              response = response;
              let previousFareData = globalObject.state.fareETAEstimations;
              previousFareData["fareData"] = response;
              //...
              globalObject.setState({
                isLoadingForFare: false,
                fareETAEstimations: previousFareData,
                shoudAllowRequest: true,
              });
            }
          }
        }
        //! No valid estimates due to a problem, try again
        else {
          //? Force the estimates try again.
          //globalObject.getFareEstimation();
          globalObject.setState({
            isLoadingForFare: false,
            fareETAEstimations: {},
            shoudAllowRequest: false,
          });
        }
      }
    );

    /**
     * GET ROUTE SNAPSHOTS RESPONSES
     */
    this.SOCKET_CORE.on(
      "getRoute_to_destinationSnapshot-response",
      function (response) {
        let previousSnapshots = globalObject.state.snapshotsToDestination;
        previousSnapshots.push(response);
        //Remove all zero distances
        previousSnapshots = previousSnapshots.filter((snap) => {
          return snap.distance !== 0 && snap.eta !== "0 sec away";
        });
        //...
        globalObject.setState({
          snapshotsToDestination: previousSnapshots,
          isLoadingEta: false,
        });
      }
    );

    /**
     * CHECK IF A RIDE WAS ACCEPTED
     * @event: requestRideOrDeliveryForThis
     * ? Responsible for handling the request ride or wallet response after booking
     * ? to know whether the request was successfully dispatched or not.
     */
    this.SOCKET_CORE.on(
      "requestRideOrDeliveryForThis-response",
      function (response) {
        if (
          response !== false &&
          response.response !== undefined &&
          /successfully_requested/i.test(response.response)
        ) {
          globalObject.setState({
            isLoadingGeneral: false,
            didRequestJustBeenMade: true,
            isThereRequestError: false,
          });
        } else if (
          response !== false &&
          response.response !== undefined &&
          /Unable_to_make_the_request_unsufficient_funds/i.test(
            response.response
          )
        ) {
          globalObject.setState({
            isLoadingGeneral: false,
            didRequestJustBeenMade: true,
            isThereRequestError: true,
            error_message_onRequest: (
              <>
                Sorry you don't have enough funds in your wallet to perform this
                request, please purchase a package and try again. For more
                assistance please contact us at{" "}
                <strong>support@taxiconnectna.com</strong>
              </>
            ),
            error_onRequest_nature:
              "Unable_to_make_the_request_unsufficient_funds",
          });
        }
        //An unxepected error occured
        else if (
          response !== false &&
          response.response !== undefined &&
          /already_have_a_pending_request/i.test(response.response)
        ) {
          globalObject.setState({
            isLoadingGeneral: false,
            didRequestJustBeenMade: true,
            isThereRequestError: true,
            error_message_onRequest: (
              <>
                Sorry we were unable to make this request due to an unexpected
                error, please refresh you web page and try again. If it persists
                please contact us at <strong>support@taxiconnectna.com</strong>
              </>
            ),
            error_onRequest_nature: "already_have_a_pending_request",
          });
        } else {
          globalObject.setState({
            isLoadingGeneral: false,
            didRequestJustBeenMade: true,
            isThereRequestError: true,
            error_message_onRequest: (
              <>
                Sorry we were unable to make this request due to an unexpected
                error, please refresh you web page and try again. If it persists
                please contact us at <strong>support@taxiconnectna.com</strong>
              </>
            ),
            error_onRequest_nature: "error",
          });
        }
      }
    );
  }

  /**
   * Reset current pickup location to the default one
   */
  resetCurrentPickupLocationToThis() {
    let pickupLocation =
      this.props.App.userCurrentLocationMetaData !== undefined &&
      this.props.App.userCurrentLocationMetaData.city !== undefined
        ? {
            data: {
              locationData: {
                averageGeo: 0,
                city: this.props.App.userCurrentLocationMetaData.city,
                coordinates: [
                  this.props.App.latitude,
                  this.props.App.longitude,
                ],
                country: this.props.App.userCurrentLocationMetaData.country,
                indexSearch: 0,
                location_id: this.props.App.userCurrentLocationMetaData.osm_id,
                location_name:
                  this.props.App.userCurrentLocationMetaData.street,
                query: "current_location_auto",
                state: this.props.App.userCurrentLocationMetaData.state.replace(
                  " Region",
                  ""
                ),
                street: this.props.App.userCurrentLocationMetaData.street,
                suburb: false,
              },
            },
          }
        : null;
    //...
    this.setState({ pickup_destination: pickupLocation });
  }

  /***
   * Render the destination input
   */
  renderDestinationinput() {
    return this.state.dropOff_destination.map((destination, index) => {
      //? Initialize data array if null
      this.state.dropOff_destination[index].data =
        this.state.dropOff_destination[index].data === null
          ? {
              expandedAccordion: false,
              useSameAs1: false, //If to use the same receiver's values as for drop off 1
              name_error_color: "#d0d0d0",
              phone_error_color: "#d0d0d0",
              receiverInfos: {
                receiver_name: "",
                receiver_phone: "",
              },
              locationData: null, //Will store up all the location data
            }
          : this.state.dropOff_destination[index].data;

      //? Get important data
      let localData = this.state.dropOff_destination[index];
      //1. Receiver's infos
      let receiverName = localData.data.receiverInfos.receiver_name;
      let receiverPhone = localData.data.receiverInfos.receiver_phone;
      //? -----
      return (
        <div
          key={index.toString()}
          className={classes.higherOrderPrimitiveContainer}>
          <div
            className={classes.dropOffPrimitiveContainer}
            style={{ display: "flex", flexDirection: "column" }}>
            <input
              key={index.toString()}
              type="text"
              placeholder={`Enter drop off location${
                this.state.dropOff_destination.length > 1 ? ` ${index + 1}` : ""
              }`}
              className={classes.formBasicInput}
              onFocus={() => {
                this.setState({ focusedInput: index });
              }}
              value={
                this.state.dropOff_destination[index] !== undefined &&
                this.state.dropOff_destination[index] !== null &&
                this.state.dropOff_destination[index].data !== null &&
                this.state.dropOff_destination[index].data !== undefined &&
                this.state.dropOff_destination[index].data.locationData !== null
                  ? this.state.dropOff_destination[index].data.locationData
                      .location_name
                  : ""
              }
              onChange={(event) => {
                //? Update the input field
                let oldState = this.state.dropOff_destination;
                oldState[index].data["locationData"] = {
                  location_name: event.target.value,
                };
                //?---
                this.setState({ dropOff_destination: oldState });
                //?----
                this._searchForThisQuery(event.target.value, 0);
              }}
            />
            {index > 0 ? (
              <FiTrash2
                onClick={() => this.removeGivenDropOffLocation(index)}
                className={classes.removeDropOffIco}
                title="Remove"
              />
            ) : null}

            {/* Search */}
            {this.state.focusedInput === index ? (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  bottom: 63,
                  left: 3,
                }}>
                {this.renderSearchBar()}
              </div>
            ) : null}
          </div>
          <div className={classes.receiverDetails}>
            {/* Case 1: Add a new receiver */}
            <div className={classes.addNewReceiver}>
              <Accordion
                expanded={
                  this.state.dropOff_destination[index].data.expandedAccordion
                }
                onChange={(event, isExpanded) => {
                  let oldState = this.state.dropOff_destination;
                  oldState[index].data.expandedAccordion = isExpanded; //Updated
                  //...
                  if (
                    this.state.dropOff_destination[index].data.receiverInfos
                      .receiver_name !== undefined &&
                    this.state.dropOff_destination[
                      index
                    ].data.receiverInfos.receiver_name.trim().length > 0 &&
                    isValidPhoneNumber(
                      this.state.dropOff_destination[index].data.receiverInfos
                        .receiver_phone
                    )
                  ) {
                    //All good data
                    this.setState({ dropOff_destination: oldState });
                  } //Incomplete data - reset them
                  else {
                    oldState[index].data.receiverInfos.receiver_name = "";
                    oldState[index].data.receiverInfos.receiver_phone = "";
                    //...
                    this.setState({ dropOff_destination: oldState });
                  }
                }}
                className={classes.accordionClassics}
                style={{ boxShadow: "none" }}>
                <AccordionSummary
                  expandIcon={
                    <FiChevronDown className={classes.accordionIcoClassics} />
                  }
                  aria-controls="panel1a-content"
                  id="panel1a-header">
                  {receiverName === undefined ||
                  receiverName.length === 0 ||
                  receiverPhone === undefined ||
                  receiverPhone.length === 0 ? (
                    <div className={classes.addReceiverVirginInsider}>
                      <FiUser
                        style={{
                          position: "relative",
                          bottom: 1,
                          marginRight: 2,
                        }}
                      />{" "}
                      Add a receiver
                    </div>
                  ) : (
                    <div className={classes.addReceiverFilledInsider}>
                      <div>
                        <FiUser
                          style={{
                            position: "relative",
                            top: 1,
                            marginRight: 2,
                          }}
                        />{" "}
                        {
                          this.state.dropOff_destination[index].data
                            .receiverInfos.receiver_name
                        }
                      </div>
                      <div>
                        <FiPhone
                          style={{
                            position: "relative",
                            top: 2,
                            marginRight: 2,
                          }}
                        />{" "}
                        {
                          this.state.dropOff_destination[index].data
                            .receiverInfos.receiver_phone
                        }
                      </div>
                    </div>
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <div>
                    {/* Make same button - avoid first drop off */}
                    {index > 0 &&
                    this.state.dropOff_destination[0].data.receiverInfos
                      .receiver_name.length > 0 &&
                    isValidPhoneNumber(
                      this.state.dropOff_destination[0].data.receiverInfos
                        .receiver_phone
                    ) ? (
                      <div className={classes.makeSameContainer}>
                        <input
                          type="checkbox"
                          onChange={(event) => {
                            let newValue = event.target.checked;
                            let currentState = this.state.dropOff_destination;
                            //...
                            if (
                              newValue &&
                              currentState[0].data.receiverInfos.receiver_name
                                .length > 0 &&
                              isValidPhoneNumber(
                                currentState[0].data.receiverInfos
                                  .receiver_phone
                              )
                            ) {
                              //Valid receiver 1 infos - update
                              currentState[
                                index
                              ].data.receiverInfos.receiver_name =
                                currentState[0].data.receiverInfos.receiver_name;
                              currentState[
                                index
                              ].data.receiverInfos.receiver_phone =
                                currentState[0].data.receiverInfos.receiver_phone;
                              //...
                              this.setState({
                                dropOff_destination: currentState,
                              });
                            } //Remove as same
                            else {
                              currentState[
                                index
                              ].data.receiverInfos.receiver_name = "";
                              currentState[
                                index
                              ].data.receiverInfos.receiver_phone = "";
                              //...
                              this.setState({
                                dropOff_destination: currentState,
                              });
                            }
                          }}
                        />
                        <div className={classes.textSideMakeSameContainer}>
                          <div className={classes.mainTitleMakeSameContainer}>
                            Make same as 1
                          </div>
                          <div className={classes.descrMakeSameContainer}>
                            Make this receiver the same as for the drop off 1.
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {/* Rest */}
                    <input
                      type="text"
                      placeholder="Receiver's name"
                      value={
                        this.state.dropOff_destination[index].data.receiverInfos
                          .receiver_name
                      }
                      onChange={(event) => {
                        let newData = event.target.value;
                        let oldState = this.state.dropOff_destination;
                        oldState[index].data.receiverInfos.receiver_name =
                          newData; //Updated
                        //...
                        this.setState({ dropOff_destination: oldState });
                      }}
                      onFocus={() => {
                        let oldState = this.state.dropOff_destination;
                        oldState[index].data.name_error_color = "#d0d0d0"; //Updated
                        //...
                        this.setState({ dropOff_destination: oldState });
                      }}
                      style={{
                        borderColor:
                          this.state.dropOff_destination[index].data
                            .name_error_color,
                      }}
                      className={classes.formBasicInputClassics}
                      spellCheck={false}
                      autocomplete="new-password"
                      autoCapitalize="false"
                      autoCorrect="false"
                    />
                    <br />
                    <PhoneInput
                      defaultCountry="NA"
                      international
                      withCountryCallingCode
                      countryCallingCodeEditable={false}
                      placeholder="Enter phone number"
                      value={
                        this.state.dropOff_destination[index].data.receiverInfos
                          .receiver_phone
                      }
                      onChange={(value) => {
                        let oldState = this.state.dropOff_destination;
                        oldState[index].data.receiverInfos.receiver_phone =
                          value; //Updated
                        //...
                        this.setState({ dropOff_destination: oldState });
                      }}
                      onFocus={() => {
                        let oldState = this.state.dropOff_destination;
                        oldState[index].data.phone_error_color = "#d0d0d0"; //Updated
                        //...
                        this.setState({ dropOff_destination: oldState });
                      }}
                      className={classes.formBasicInputClassics}
                      autocomplete="new-password"
                      style={{
                        borderColor:
                          this.state.dropOff_destination[index].data
                            .phone_error_color,
                      }}
                    />
                    <br />
                    {/* Update */}
                    <div className={classes.updateReceiverInsideContainer}>
                      <div
                        className={
                          classes.formBasicSubmitBttnClassicsReceiverInfos
                        }
                        onClick={() => {
                          //Check that every variables is in order
                          if (
                            this.state.dropOff_destination[index].data
                              .receiverInfos.receiver_name !== undefined &&
                            this.state.dropOff_destination[
                              index
                            ].data.receiverInfos.receiver_name.trim().length > 0
                          ) {
                            //Good
                            if (
                              isValidPhoneNumber(
                                this.state.dropOff_destination[index].data
                                  .receiverInfos.receiver_phone
                              )
                            ) {
                              //All good
                              //? Close accordion
                              let oldState = this.state.dropOff_destination;
                              oldState[index].data.expandedAccordion = false; //Updated
                              //...
                              this.setState({ dropOff_destination: oldState });
                            } //Invalid phone
                            else {
                              let oldState = this.state.dropOff_destination;
                              oldState[index].data.phone_error_color = "red"; //Updated
                              //...
                              this.setState({ dropOff_destination: oldState });
                            }
                          } //Receiver name missing
                          else {
                            let oldState = this.state.dropOff_destination;
                            oldState[index].data.name_error_color = "red"; //Updated
                            //...
                            this.setState({ dropOff_destination: oldState });
                          }
                        }}>
                        Save
                      </div>
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
            </div>
          </div>
        </div>
      );
    });
  }

  /**
   * Remove given drop off location
   * @param index
   */
  removeGivenDropOffLocation(index) {
    let currentArr = this.state.dropOff_destination;
    currentArr.splice(index, 1);
    this.setState({
      dropOff_destination: currentArr,
      shoudAllowRequest: false,
    });
    //? Get the new prices
    this.getFareEstimationOnValidData();
    //? Call recenter map estimator
    this.recenterMapEstimator();
  }

  /**
   * Responsible for adding additional drop off destination
   * !Limit based on the current package
   */
  addAdditionalDestination() {
    //! Check the current number of destination nodes presents
    if (
      this.state.dropOff_destination.length <
      parseInt(this.props.App.userData.loginData.plans.delivery_limit)
    ) {
      //Can add more
      let dropOffModel = {
        id: this.state.dropOff_destination.length + 1,
        data: null,
      };
      //..
      let currentArr = this.state.dropOff_destination;
      currentArr.push(dropOffModel);
      this.setState({
        dropOff_destination: currentArr,
        shoudAllowRequest: false,
      });
      this.forceUpdate();
    } //Limit reached
    else {
      console.log("Drop off locations limit reached");
    }
  }

  /**
   * Responsible for evaluating and computing the fares based on valid data.
   */
  getFareEstimationOnValidData() {
    //Check if all the pickup and drop off are valid
    let areDataValid = false; //False by default
    //? Check the pickup location
    areDataValid =
      this.state.pickup_destination.data.locationData === null ||
      this.state.pickup_destination.data.locationData === undefined ||
      this.state.pickup_destination.data.locationData.coordinates ===
        undefined ||
      this.state.pickup_destination.data.locationData.coordinates === null
        ? false
        : true;
    //? Check the drop off location
    let invalidDropOff = this.state.dropOff_destination.filter((location) => {
      return (
        location.data.locationData === null ||
        location.data.locationData === undefined ||
        location.data.locationData.coordinates === undefined ||
        location.data.locationData.coordinates === null
      );
    });
    //...add in the data for the drop off
    areDataValid = areDataValid && (invalidDropOff.length > 0 ? false : true);

    if (areDataValid) {
      //? Get the fare
      let deliveryPricingInputDataRaw = {
        user_fingerprint: this.props.App.userData.loginData.company_fp,
        connectType: "ConnectUs",
        country: "Namibia",
        isAllGoingToSameDestination: false,
        isGoingUntilHome: false,
        naturePickup: "PrivateLocation",
        passengersNo: this.state.dropOff_destination.length,
        rideType: "DELIVERY",
        timeScheduled: "now",
        pickupData: this.state.pickup_destination.data.locationData,
        destinationData: {
          passenger1Destination: false,
          passenger2Destination: false,
          passenger3Destination: false,
          passenger4Destination: false,
        },
      };
      //Complete the destination data
      this.state.dropOff_destination.map((location, index) => {
        let keyIndex = `passenger${index + 1}Destination`;
        //...
        deliveryPricingInputDataRaw.destinationData[keyIndex] =
          location.data.locationData;
      });
      //...
      //? Activate the fare loader
      this.setState({
        isLoadingForFare: true,
        fareETAEstimations: {},
        shoudAllowRequest: false,
      });
      //..ask
      this.SOCKET_CORE.emit(
        "getPricingForRideorDelivery",
        deliveryPricingInputDataRaw
      );
    }
  }

  /**
   * Render Search results
   */
  renderSearchResults() {
    if (
      (this.state.searchResults.length > 0 ||
        this.state.searchResults.length > 0) &&
      this.state.shouldShowSearch
    ) {
      //Has some results
      return this.state.searchResults.map((location, index) => {
        return (
          <div
            key={index.toString()}
            className={classes.searchSingleItem}
            style={{
              borderBottomColor:
                index + 1 === this.state.searchResults.length
                  ? "#fff"
                  : "#d0d0d0",
            }}
            onClick={() => {
              if (this.state.focusedInput === -1) {
                //!Input location
                this.state.pickup_destination.data.locationData = location;
                //Call the fare estimator
                this.getFareEstimationOnValidData();
                //...Clear the search data
                this.setState({
                  searchResults: [],
                  search_querySearch: "",
                  shouldShowSearch: false,
                  hasCustomPickupLocation: true,
                });
              } //? Drop off locations
              else {
                this.state.dropOff_destination[
                  this.state.focusedInput
                ].data.locationData = location;
                //Call the fare estimator
                this.getFareEstimationOnValidData();
                //...Clear the search data
                this.setState({
                  searchResults: [],
                  search_querySearch: "",
                  shouldShowSearch: false,
                });
              }
              //? Call recenter map estimator
              this.recenterMapEstimator();
            }}>
            <AiFillEnvironment />
            <div className={classes.searchedInfosTextContainer}>
              <div className={classes.locationNameSearched}>
                {location.location_name}
              </div>
              <div className={classes.detailsLocationSearched}>
                {`${
                  location.street !== undefined &&
                  location.street !== false &&
                  location.street !== null
                    ? `${
                        location.street.length > 20
                          ? `${location.street.substring(0, 20)}.`
                          : location.street
                      }, `
                    : ""
                }${
                  location.suburb !== undefined &&
                  location.suburb !== false &&
                  location.suburb !== null
                    ? `${location.suburb}, `
                    : ""
                }${location.city}`}
              </div>
            </div>
          </div>
        );
      });
    } else {
      return <></>;
    }
  }

  renderSearchBar() {
    if (
      this.state.search_querySearch.length > 0 &&
      this.state.shouldShowSearch
    ) {
      return (
        <div className={classes.searchPrimitiveContainer}>
          {this.state.loaderStateSearch === false ? (
            this.renderSearchResults()
          ) : (
            <div
              style={{
                margin: "auto",
                marginTop: "5%",
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Loader
                type="TailSpin"
                color="#000"
                height={20}
                width={20}
                timeout={300000000} //3 secs
              />
            </div>
          )}
        </div>
      );
    } else {
      return <></>;
    }
  }

  /**
   * @func _searchForThisQuery()
   * @param {*} query
   * Responsible for launching the server request for a specific query props.App typed by the user.
   */
  _searchForThisQuery(query, inputFieldIndex) {
    this.search_time_requested = new Date();
    this.state.search_querySearch = query.trim();

    //! Disable default pickup location - activate custom one
    if (inputFieldIndex === -1) {
      if (this.state.hasCustomPickupLocation === false) {
        this.setState({ hasCustomPickupLocation: true });
      }
    }
    //! -----
    if (query.length > 0) {
      if (this.state.search_querySearch.length !== 0) {
        //Has some query
        //Alright
        let requestPackage = {};
        requestPackage.user_fp = this.props.App.userData.loginData.company_fp;
        requestPackage.query = this.state.search_querySearch;
        requestPackage.city = "Windhoek"; //Default city to windhoek
        requestPackage.country = "Namibia"; //Default country to Namibia
        //Submit to API
        //! Disable the ability to request temporarily as well
        this.setState({
          loaderStateSearch: true,
          shouldShowSearch: true,
          shoudAllowRequest: false,
          fareETAEstimations: {},
        });

        this.SOCKET_CORE.emit("getLocations", requestPackage);
      } //NO queries to process
      else {
        this.setState({ loaderStateSearch: false, searchResults: [] });
      }
    } //Empty search
    else {
      this.setState({ loaderStateSearch: false, searchResults: [] });
    }
  }

  /**
   * Render pickup marker
   */
  renderPickupMarker() {
    if (
      this.state.pickup_destination !== null &&
      this.state.pickup_destination.data !== undefined &&
      this.state.pickup_destination.data.locationData !== null &&
      this.state.pickup_destination.data.locationData.coordinates !==
        undefined &&
      this.state.hasCustomPickupLocation
    ) {
      return (
        <Marker
          latitude={
            this.state.pickup_destination.data.locationData.coordinates[0]
          }
          longitude={
            this.state.pickup_destination.data.locationData.coordinates[1]
          }
          offsetLeft={-20}
          offsetTop={-10}>
          <svg
            height={25}
            viewBox="0 0 24 24"
            style={{
              cursor: "pointer",
              fill: "#096ED4",
              stroke: "none",
            }}>
            <path d={ICON} />
          </svg>
        </Marker>
      );
    } else {
      return <></>;
    }
  }

  /**
   * Render drop off marker
   */
  renderDropoffMarker() {
    return this.state.dropOff_destination.map((location) => {
      if (
        location.data !== undefined &&
        location.data.locationData !== null &&
        location.data.locationData.coordinates !== undefined
      ) {
        return (
          <Marker
            latitude={location.data.locationData.coordinates[0]}
            longitude={location.data.locationData.coordinates[1]}
            offsetLeft={-20}
            offsetTop={-10}>
            <svg
              height={25}
              viewBox="0 0 24 24"
              style={{
                cursor: "pointer",
                fill: "red",
                stroke: "none",
                zIndex: 1000,
              }}>
              <path d={ICON} />
            </svg>
          </Marker>
        );
      } else {
        return <></>;
      }
    });
  }

  /**
   * Responsible for determining of the map should be recentered or rezoomed to fit all the coords as bounds
   */
  recenterMapEstimator() {
    //! Take the current location if nothing was customized
    let pickupPoint =
      this.state.hasCustomPickupLocation === false
        ? {
            latitude: this.props.App.latitude,
            longitude: this.props.App.longitude,
          }
        : this.state.pickup_destination !== null &&
          this.state.pickup_destination.data !== undefined &&
          this.state.pickup_destination.data.locationData !== null &&
          this.state.pickup_destination.data.locationData.coordinates !==
            undefined
        ? {
            latitude:
              this.state.pickup_destination.data.locationData.coordinates[0],
            longitude:
              this.state.pickup_destination.data.locationData.coordinates[1],
          }
        : false;

    let dropOffPoints = this.state.dropOff_destination.map((location) => {
      return location.data !== undefined &&
        location.data.locationData !== null &&
        location.data.locationData.coordinates !== undefined
        ? {
            latitude: location.data.locationData.coordinates[0],
            longitude: location.data.locationData.coordinates[1],
          }
        : false;
    });
    //...
    let areValidForFitBounds =
      dropOffPoints.filter((el) => el !== false).length ===
        this.state.dropOff_destination.length && pickupPoint !== false;
    //...
    // console.log(pickupPoint);
    // console.log(dropOffPoints);
    // console.log(`Are valid for bounds: ${areValidForFitBounds}`);

    if (areValidForFitBounds) {
      let pointsBundle = dropOffPoints;
      pointsBundle.push(pickupPoint);
      //..
      this.setState({
        customFitboundsCoords: getBoundsForPoints(
          pointsBundle,
          this.refs.mapPrimitiveContainer.getBoundingClientRect()
        ),
        snapshotsToDestination: [],
        isLoadingEta: true,
      });
      this.forceUpdate();

      //! Compute the route and ETA
      dropOffPoints = dropOffPoints.filter((el) => el !== false);
      //...
      let parentPromises = dropOffPoints.map((dropOff) => {
        return new Promise((resCompute) => {
          let tmpBundleSnapShot = {
            org_latitude: pickupPoint.latitude,
            org_longitude: pickupPoint.longitude,
            dest_latitude: dropOff.latitude,
            dest_longitude: dropOff.longitude,
            user_fingerprint: this.props.App.userData.loginData.company_fp,
          };
          //...
          //   console.log(tmpBundleSnapShot);
          this.SOCKET_CORE.emit(
            "getRoute_to_destinationSnapshot",
            tmpBundleSnapShot
          );
          //..
          resCompute(true);
        });
      });
      ///...
      Promise.all(parentPromises)
        .then((result) => {
          // console.log(result);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  /**
   * Responsible for rendering the polyline if all the destinations have been set
   */
  renderClusteredPolyline() {
    if (this.state.snapshotsToDestination.length > 0) {
      return this.state.snapshotsToDestination.map((snap) => {
        return <PolylineOverlay points={snap.routePoints} />;
      });
    } else {
      return <></>;
    }
  }

  /**
   * Compute the total ETA time and render a unified time
   */
  renderUnifiedETATime() {
    if (this.state.snapshotsToDestination.length > 0) {
      let unifiedTimeSec = 0;
      this.state.snapshotsToDestination.map((snap) => {
        let time =
          snap !== undefined &&
          snap !== null &&
          snap.eta !== undefined &&
          snap.eta !== null
            ? parseInt(snap.eta.split(" ")[0].trim())
            : 0;
        //...
        if (/min/i.test(snap.eta)) {
          //Minutes
          unifiedTimeSec += time * 60;
        } else if (/sec/i.test(snap.eta)) {
          //Seconds
          unifiedTimeSec += time;
        }
      });
      //...
      if (unifiedTimeSec >= 60) {
        //Put in min
        unifiedTimeSec = `${Math.round(unifiedTimeSec / 60)} min`;
        return unifiedTimeSec;
      } else {
        unifiedTimeSec = `${Math.round(unifiedTimeSec)} sec`;
        return unifiedTimeSec;
      }
    } else {
      return <></>;
    }
  }

  /**
   * Responsible for making the request
   */
  makeDeliveryRequest() {
    let globalObject = this;
    //Check that all the receivers had been specified
    let receiversInOrder = true;
    this.state.dropOff_destination.map((tmpLocation, index) => {
      if (
        tmpLocation.data.receiverInfos.receiver_name !== undefined &&
        tmpLocation.data.receiverInfos.receiver_name !== null &&
        tmpLocation.data.receiverInfos.receiver_name.length > 0 &&
        tmpLocation.data.receiverInfos.receiver_phone !== undefined &&
        tmpLocation.data.receiverInfos.receiver_phone !== null &&
        tmpLocation.data.receiverInfos.receiver_phone.length > 0
      ) {
        //Okay
      } //Details not detected
      else {
        receiversInOrder = false;
        globalObject.state.destinationNotCompleted.push(index + 1);
        // globalObject.forceUpdate();
      }
    });

    if (receiversInOrder) {
      //...Get fare
      let tmpFare = 0;
      globalObject.state.fareETAEstimations.fareData.map((fare) => {
        if (/carDelivery/i.test(fare.car_type)) {
          tmpFare = fare.base_fare;
        }
      });
      globalObject.setState({
        isLoadingGeneral: true,
        didRequestJustBeenMade: false,
        isThereRequestError: false,
      });
      //Package all the data
      let RIDE_OR_DELIVERY_BOOKING_DATA = {
        user_fingerprint: globalObject.props.App.userData.loginData.company_fp,
        connectType: "ConnectUs",
        country: globalObject.props.App.userCurrentLocationMetaData.country,
        isAllGoingToSameDestination: false, //If all the passengers are going to the same destination
        isGoingUntilHome: false, //! Will double the fares for the Economy - Set to false for the DELIVERY
        naturePickup: "PrivateLocation", //Force PrivateLocation type if nothing found or delivery request,  -Nature of the pickup location (privateLOcation,etc)
        passengersNo: globalObject.state.dropOff_destination.length, //Force to 1 passenger for deliveries
        actualRider: "me",
        actualRiderPhone_number:
          globalObject.props.App.userData.loginData.phone,
        //DELIVERY SPECIFIC INFOS (receiver infos:name and phone)
        receiverName_delivery: false,
        receiverPhone_delivery: false,
        packageSizeDelivery: "Small",
        //...
        rideType: "DELIVERY", //Ride or delivery
        paymentMethod: "Wallet", //Payment method
        timeScheduled: globalObject.state.isScheduledTrip
          ? globalObject.state.scheduledTime
          : "now",
        pickupNote: false, //Additional note for the pickup
        carTypeSelected: "carDelivery", //Ride selected, Economy normal taxis,etc
        request_globality: "corporate", //!Extremely important
        subscribed_plan:
          globalObject.props.App.userData.loginData.plans.subscribed_plan, //!Extremely important
        fareAmount: tmpFare, //Ride fare
        pickupData: {
          coordinates: [
            globalObject.state.pickup_destination.data.locationData
              .coordinates[0],
            globalObject.state.pickup_destination.data.locationData
              .coordinates[1],
          ],
          location_name:
            globalObject.state.pickup_destination.data.locationData
              .location_name,
          street_name:
            globalObject.state.pickup_destination.data.locationData.street,
          city: globalObject.state.pickup_destination.data.locationData.city,
        },
        destinationData: {},
      };

      //Complete the destination data
      globalObject.state.dropOff_destination.map((location, index) => {
        let keyIndex = `passenger${index + 1}Destination`;
        location.data.locationData["receiver_infos"] =
          location.data.receiverInfos;
        //...
        RIDE_OR_DELIVERY_BOOKING_DATA.destinationData[keyIndex] =
          location.data.locationData;
      });
      //...
      // console.log(RIDE_OR_DELIVERY_BOOKING_DATA);
      //! Make a single request - risky
      //Not yet request and no errors
      //Check wheher an answer was already received - if not keep requesting
      globalObject.SOCKET_CORE.emit(
        "requestRideOrDeliveryForThis",
        RIDE_OR_DELIVERY_BOOKING_DATA
      );
    } //!Receivers infos not in order
    else {
      this.setState({ shouldShowModal: true });
    }
  }

  render() {
    //Initialize the input data
    this.state.pickup_destination =
      this.state.pickup_destination !== null
        ? this.state.pickup_destination
        : {};
    this.state.pickup_destination["data"] =
      this.state.pickup_destination === null ||
      this.state.pickup_destination.data === null ||
      this.state.pickup_destination.data === undefined
        ? {
            name_error_color: "#d0d0d0",
            phone_error_color: "#d0d0d0",
            receiverInfos: {
              receiver_name: "",
              receiver_phone: "",
            },
            locationData: null, //Will store up all the location data
          }
        : this.state.pickup_destination.data;

    return (
      <div className={classes.deliverNode}>
        <Modal
          open={this.state.shouldShowModal}
          onClose={() =>
            this.setState({
              shouldShowModal: false,
              destinationNotCompleted: [],
            })
          }
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description">
          <Box sx={style}>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              style={{ fontWeight: "bold", fontSize: 15, color: "#b22222" }}>
              Attention required
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Please check that all the receivers information has been provided.
            </Typography>
            <br />
            {this.state.destinationNotCompleted.map((errorNode) => {
              return (
                <div style={{ fontWeight: "bold", marginBottom: 15 }}>
                  - Destination {errorNode}
                </div>
              );
            })}
          </Box>
        </Modal>

        {this.state.didRequestJustBeenMade === false ? (
          <>
            <div className={classes.inputDataContainer}>
              {/* Line esthetique */}
              <div style={{ padding: "10px", paddingTop: "20px" }}>
                <div className={classes.primitiveContainer}>
                  <div className={classes.lineSideDeco}>
                    <AiTwotoneCheckCircle className={classes.decoShapes} />
                    <div className={classes.lineAssocDeco}></div>
                    <AiTwotoneCalculator
                      className={classes.decoShapes}
                      style={{ color: "#096ED4" }}
                    />
                  </div>
                  <div className={classes.locationsInputsContainer}>
                    {/* Pickup location */}
                    <div className={classes.pickupLocationPrimitiveContainer}>
                      <div className={classes.inputPrimitiveContainer}>
                        <input
                          type="text"
                          placeholder="Enter pickup location"
                          className={classes.formBasicInput}
                          onFocus={() => {
                            //Update focused input index
                            this.setState({ focusedInput: -1 });
                          }}
                          value={
                            this.state.pickup_destination !== undefined &&
                            this.state.pickup_destination !== null &&
                            this.state.pickup_destination.data !== null &&
                            this.state.pickup_destination.data !== undefined &&
                            this.state.pickup_destination.data.locationData !==
                              null
                              ? this.state.pickup_destination.data.locationData
                                  .location_name
                              : ""
                          }
                          onChange={(event) => {
                            //? Update the input field
                            let oldState = this.state.pickup_destination;
                            oldState.data["locationData"] = {
                              location_name: event.target.value,
                            };
                            //?---
                            this.setState({ pickup_destination: oldState });
                            //?----
                            this._searchForThisQuery(event.target.value, 0);
                          }}
                          style={{
                            position: "relative",
                            left: "3px",
                            // paddingRight: "60px",
                            // width: "77.8%",
                          }}
                        />
                        <div
                          className={classes.findMyLocationInputContainer}
                          onClick={() => {
                            this.resetCurrentPickupLocationToThis();
                            this.setState({ hasCustomPickupLocation: false });
                          }}>
                          <MdNearMe
                            style={{ width: 23, height: 23 }}
                            title={"Set to your current location"}
                          />
                        </div>
                      </div>
                      {/* Search */}
                      {this.state.focusedInput === -1
                        ? this.renderSearchBar()
                        : null}
                    </div>
                    {/* Drop locations */}
                    {this.renderDestinationinput()}
                  </div>
                </div>

                {this.props.App.userData.loginData.plans.delivery_limit !==
                undefined ? (
                  <div
                    className={classes.addMoreDropOffBtn}
                    style={{
                      opacity:
                        this.state.dropOff_destination.length <
                        parseInt(
                          this.props.App.userData.loginData.plans.delivery_limit
                        )
                          ? 1
                          : 0.3,
                    }}
                    onClick={() =>
                      this.state.dropOff_destination.length <
                      parseInt(
                        this.props.App.userData.loginData.plans.delivery_limit
                      )
                        ? this.addAdditionalDestination()
                        : {}
                    }>
                    <AiFillPlusCircle
                      style={{
                        color: "#0e8491",
                        marginRight: 5,
                        position: "relative",
                        bottom: 1,
                      }}
                    />
                    Add additional drop off
                  </div>
                ) : null}
              </div>
              <div className={classes.gloalTripInfos}>
                <div className={classes.elGlobalTripIfos}>
                  {this.state.fareETAEstimations.fareData !== undefined &&
                  this.state.isLoadingForFare === false ? (
                    <>
                      <div className={classes.globalInfosPrimitiveContainer}>
                        <AiTwotoneProject
                          className={classes.icoGlobalTripsIfos1}
                        />
                      </div>
                      Estimated fare{" "}
                      <strong style={{ position: "relative", marginLeft: 5 }}>
                        {this.state.fareETAEstimations.fareData.map((fare) => {
                          if (/carDelivery/i.test(fare.car_type)) {
                            return `N$${fare.base_fare}`;
                          }
                        })}
                      </strong>
                      .
                    </>
                  ) : this.state.isLoadingForFare ? (
                    <div
                      style={{
                        // border: "1px solid black",
                        display: "flex",
                        flexDirection: "row",
                        marginBottom: 5,
                      }}>
                      <Loader
                        type="TailSpin"
                        color="#000"
                        height={15}
                        width={15}
                        timeout={300000000} //3 secs
                      />
                      <span
                        style={{
                          position: "relative",
                          marginLeft: 4,
                          color: "#0e8491",
                        }}>
                        Estimating your fare...
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className={classes.elGlobalTripIfos}>
                  {this.state.isLoadingEta ? (
                    <div
                      style={{
                        // border: "1px solid black",
                        display: "flex",
                        flexDirection: "row",
                        marginBottom: 5,
                      }}>
                      <Loader
                        type="TailSpin"
                        color="#000"
                        height={15}
                        width={15}
                        timeout={300000000} //3 secs
                      />
                      <span
                        style={{
                          position: "relative",
                          marginLeft: 4,
                          color: "#0e8491",
                        }}>
                        Estimating your ETA...
                      </span>
                    </div>
                  ) : this.state.snapshotsToDestination.length > 0 ? (
                    <>
                      <div className={classes.globalInfosPrimitiveContainer}>
                        <AiTwotoneProject
                          className={classes.icoGlobalTripsIfos1}
                        />
                      </div>
                      ETA
                      <strong style={{ position: "relative", marginLeft: 5 }}>
                        {this.renderUnifiedETATime()}
                      </strong>
                    </>
                  ) : (
                    <>
                      <div className={classes.globalInfosPrimitiveContainer}>
                        <AiTwotoneProject
                          className={classes.icoGlobalTripsIfos1}
                        />
                      </div>
                      Please fill in all the locations.
                    </>
                  )}
                </div>
              </div>
              <div className={classes.requestBtnContainer}>
                <div
                  className={classes.elGlobalTripIfos2}
                  style={{ fontSize: 13 }}>
                  <div className={classes.globalInfosPrimitiveContainer}>
                    <AiFillTag className={classes.icoGlobalTripsIfos2} />
                  </div>
                  The receivers can track their deliveries.
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    marginTop: 20,
                  }}>
                  {/* <input
                type="submit"
                value="Request for delivery"
                className={classes.formBasicSubmitBttnClassics}
                style={{
                  marginRight: 25,
                  opacity: this.state.shoudAllowRequest ? 1 : 0.2,
                  width: "80%",
                  fontSize: 17,
                }}
                onClick={() =>
                  this.state.shoudAllowRequest === false
                    ? {}
                    : console.log("Request for delivery")
                }
              /> */}
                  <div
                    className={classes.formBasicSubmitBttnClassics}
                    style={{
                      marginRight: 25,
                      opacity: this.state.shoudAllowRequest ? 1 : 0.2,
                      width: "80%",
                      fontSize: 17,
                      flexDirection: "column",
                    }}
                    onClick={() =>
                      this.state.shoudAllowRequest === false
                        ? {}
                        : this.state.isLoadingGeneral === false
                        ? this.makeDeliveryRequest()
                        : {}
                    }>
                    {this.state.isLoadingGeneral === false ? (
                      <>
                        Request for delivery
                        {this.state.isScheduledTrip ? (
                          <div className={classes.dateExtrDeliveryBtn}>
                            {`${
                              this.state.scheduledTime
                                .toDateString()
                                .split(" ")[0]
                            }, ${this.state.scheduledTime
                              .toLocaleDateString()
                              .replaceAll("/", "-")} at ${
                              this.state.scheduledTime
                                .toLocaleString()
                                .split(", ")[1]
                                .split(":")[0]
                            }:${
                              this.state.scheduledTime
                                .toLocaleString()
                                .split(", ")[1]
                                .split(":")[1]
                            }`}
                          </div>
                        ) : (
                          <></>
                        )}
                      </>
                    ) : (
                      <Loader
                        type="TailSpin"
                        color="#fff"
                        height={27}
                        width={27}
                        timeout={300000000} //3 secs
                      />
                    )}
                  </div>

                  <div
                    className={classes.formBasicSubmitBttnClassics}
                    style={{
                      backgroundColor: "#d0d0d0",
                      color: "black",
                      borderColor: "#d0d0d0",
                      //opacity: this.state.shoudAllowRequest ? 1 : 0.2,
                      opacity: 0.2,
                      width: 70,
                      zIndex: 100000,
                      cursor: "default",
                    }}
                    onClick={
                      () => {}
                      // this.state.shoudAllowRequest === false
                      //   ? {}
                      //   : this.state.isScheduledTrip
                      //   ? this.setState({
                      //       showDateTimePicker: false,
                      //       scheduledTime: new Date(),
                      //       isScheduledTrip: false,
                      //     })
                      //   : this.state.showDateTimePicker
                      //   ? {}
                      //   : this.setState({
                      //       showDateTimePicker: true,
                      //       scheduledTime: new Date(),
                      //     })
                    }>
                    {this.state.showDateTimePicker ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: "0px 0px 15px 1px rgba(0, 0, 0, 0.14)",
                          marginBottom: 150,
                        }}>
                        <LocalizationProvider dateAdapter={DateAdapter}>
                          <StaticDateTimePicker
                            displayStaticWrapperAs="mobile"
                            toolbarTitle={"Select the delivery date"}
                            value={this.state.scheduledTime}
                            onChange={(newValue) => {
                              this.setState({
                                scheduledTime: new Date(newValue._d),
                              });
                            }}
                            ampmInClock={false}
                            ampm={false}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </LocalizationProvider>
                        <div
                          className={classes.formBasicSubmitBttnClassics}
                          style={{
                            width: "99.45%",
                            backgroundColor: "#096ED4",
                            borderColor: "#096ED4",
                            borderRadius: 0,
                          }}
                          onClick={() => {
                            this.setState({
                              showDateTimePicker: false,
                              isScheduledTrip: true,
                            });
                          }}>
                          Set delivery date
                        </div>
                      </div>
                    ) : this.state.isScheduledTrip ? (
                      <MdDeleteSweep style={{ width: 28, height: 28 }} />
                    ) : (
                      <MdAccessTime style={{ width: 28, height: 28 }} />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.mapContainer} ref="mapPrimitiveContainer">
              <ReactMapGL
                mapLib={import("mapbox-gl")}
                width={"100%"}
                height={"100%"}
                latitude={
                  this.state.customFitboundsCoords.latitude !== undefined &&
                  this.state.customFitboundsCoords.longitude !== undefined
                    ? this.state.customFitboundsCoords.latitude
                    : this.state.pickup_destination !== null &&
                      this.state.pickup_destination.data !== undefined &&
                      this.state.pickup_destination.data.locationData !==
                        null &&
                      this.state.pickup_destination.data.locationData
                        .coordinates !== undefined
                    ? this.state.pickup_destination.data.locationData
                        .coordinates[0]
                    : this.state.latitude
                }
                longitude={
                  this.state.customFitboundsCoords.latitude !== undefined &&
                  this.state.customFitboundsCoords.longitude !== undefined
                    ? this.state.customFitboundsCoords.longitude
                    : this.state.pickup_destination !== null &&
                      this.state.pickup_destination.data !== undefined &&
                      this.state.pickup_destination.data.locationData !==
                        null &&
                      this.state.pickup_destination.data.locationData
                        .coordinates !== undefined
                    ? this.state.pickup_destination.data.locationData
                        .coordinates[1]
                    : this.state.longitude
                }
                zoom={
                  this.state.customFitboundsCoords.latitude !== undefined &&
                  this.state.customFitboundsCoords.longitude !== undefined &&
                  this.state.customFitboundsCoords.zoom
                    ? this.state.customFitboundsCoords.zoom
                    : this.state.zoom
                }
                mapStyle={"mapbox://styles/mapbox/streets-v11"}
                mapboxApiAccessToken={
                  "pk.eyJ1IjoiZG9taW5pcXVlLWt0dCIsImEiOiJjbG9ldXA2djIwbjloMmtwbDV5ZGU5ZTZwIn0.AqyhJNSuN2sMTr0vOOLSqA"
                }
                onViewportChange={(newArgs) => {
                  //   console.log(newArgs);
                  this.setState({
                    zoom: newArgs.zoom,
                  });
                }}
                onViewStateChange={(newArgs) => {
                  //   console.log(newArgs);
                }}
                // asyncRender={true}
                dragPan={true}
                scrollZoom={true}>
                <GeolocateControl
                  style={{
                    top: 15,
                    left: 15,
                    opacity: 0,
                  }}
                  positionOptions={{ enableHighAccuracy: true }}
                  trackUserLocation={true}
                  showAccuracyCircle={false}
                  showUserLocation={true}
                  auto
                  onGeolocate={(position) => {
                    console.log(position);
                    if (
                      position.coords !== undefined &&
                      position.coords !== null &&
                      position.coords.latitude !== undefined &&
                      position.coords.longitude !== undefined
                    ) {
                      //?Update the global app state as well as the local state
                      this.props.App.latitude = position.coords.latitude;
                      this.props.App.longitude = position.coords.longitude;
                      //?----
                      this.setState({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                      });
                    }
                  }}
                />
                {this.renderClusteredPolyline()}
                {this.renderPickupMarker()}
                {this.renderDropoffMarker()}
                {/* <PolylineOverlay
              points={[
                [17.0809507, -22.5654531],
                [17.0818734, -22.5685244],
                [17.0821095, -22.5692575],
                [17.0819807, -22.5714965],
                [17.0816159, -22.5725665],
                [17.081058, -22.5738742],
                [17.0808434, -22.5747658],
              ]}
            /> */}
              </ReactMapGL>
            </div>
          </>
        ) : this.state.isThereRequestError === false ? (
          <div
            style={{
              //   border: "1px solid black",
              display: "flex",
              height: 400,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              margin: "auto",
              width: "70%",
              textAlign: "center",
            }}>
            <MdCheckCircle
              style={{ width: 35, height: 35, marginBottom: 25 }}
              color={"#09864A"}
            />
            Your request has been successfully made, you can track it in real
            time by clicking on "Track my delivery", below.
            <div
              className={classes.formBasicSubmitBttnClassicsReceiverInfos}
              style={{ marginTop: 60, borderRadius: 3 }}
              onClick={() => {
                window.location.href = "/MyDeliveries";
              }}>
              Track my delivery
            </div>
            <div
              style={{
                marginTop: 30,
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => (window.location.href = "Delivery")}>
              Or make another one{" "}
              <MdTrendingFlat
                style={{ position: "relative", top: 2, marginLeft: 5 }}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              //   border: "1px solid black",
              display: "flex",
              height: 400,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              margin: "auto",
              width: "70%",
              textAlign: "center",
            }}>
            <MdReportProblem
              style={{ width: 35, height: 35, marginBottom: 25 }}
              color={"#b22222"}
            />
            {this.state.error_message_onRequest}
            <div
              style={{
                marginTop: 30,
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontWeight: "bold",
                color: "#096ED4",
              }}
              onClick={() =>
                /Unable_to_make_the_request_unsufficient_funds/i.test(
                  this.state.error_onRequest_nature
                )
                  ? (window.location.href = "/Settings")
                  : (window.location.href = "/Delivery")
              }>
              {/Unable_to_make_the_request_unsufficient_funds/i.test(
                this.state.error_onRequest_nature
              )
                ? "Profile"
                : "Try fixing the issue"}{" "}
              <MdTrendingFlat
                style={{ position: "relative", top: 2, marginLeft: 5 }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { App } = state;
  return { App };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      // UpdateLoggingData,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryNode);
