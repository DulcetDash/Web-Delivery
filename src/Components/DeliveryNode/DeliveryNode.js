import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
// import { UpdateLoggingData } from "../Redux/HomeActionsCreators";
import classes from "../../styles/DeliveryNode.module.css";
import {
  AiTwotoneCheckCircle,
  AiTwotoneCalculator,
  AiFillPlusCircle,
  AiTwotoneDelete,
  AiTwotoneProject,
  AiFillEnvironment,
} from "react-icons/ai";
import {
  FiTrash2,
  FiChevronDown,
  FiUser,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import ReactMapGL from "react-map-gl";
import SOCKET_CORE from "../../Helper/managerNode";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";

class DeliveryNode extends React.Component {
  constructor(props) {
    super(props);

    //! DEBUG
    this.props.App.userData.loginData.plans.subscribed_plan = "starter";
    this.props.App.userData.loginData.plans["delivery_limit"] = 2;
    //! ----------

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
    };
  }

  componentDidMount() {
    let globalObject = this;

    //Handle socket events
    this.SOCKET_CORE.on("getLocations-response", function (response) {
      console.log(response);
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
          className={classes.higherOrderPrimitiveContainer}
        >
          <div
            className={classes.dropOffPrimitiveContainer}
            style={{ display: "flex", flexDirection: "column" }}
          >
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
                }}
              >
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
                style={{ boxShadow: "none" }}
              >
                <AccordionSummary
                  expandIcon={
                    <FiChevronDown className={classes.accordionIcoClassics} />
                  }
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
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
                        }}
                      >
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
    this.setState({ dropOff_destination: currentArr });
    this.forceUpdate();
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
      this.setState({ dropOff_destination: currentArr });
      this.forceUpdate();
    } //Limit reached
    else {
      console.log("Drop off locations limit reached");
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
                //...Clear the search data
                this.setState({
                  searchResults: [],
                  search_querySearch: "",
                  shouldShowSearch: false,
                });
              } //? Drop off locations
              else {
                this.state.dropOff_destination[
                  this.state.focusedInput
                ].data.locationData = location;
                //...Clear the search data
                this.setState({
                  searchResults: [],
                  search_querySearch: "",
                  shouldShowSearch: false,
                });
              }
            }}
          >
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
              }}
            >
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
        this.setState({ loaderStateSearch: true, shouldShowSearch: true });
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
                      this.state.pickup_destination.data.locationData !== null
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
                  />
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
                }
              >
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
              <div className={classes.globalInfosPrimitiveContainer}>
                <AiTwotoneProject className={classes.icoGlobalTripsIfos1} />
              </div>
              Will cost in total{" "}
              <strong style={{ width: 40, textAlign: "center" }}>N$50</strong>.
            </div>
            <div className={classes.elGlobalTripIfos}>
              <div className={classes.globalInfosPrimitiveContainer}>
                <AiTwotoneProject className={classes.icoGlobalTripsIfos1} />
              </div>
              Will take about
              <strong style={{ width: 40, textAlign: "center" }}>
                7min
              </strong>{" "}
              to be delivered.
            </div>
            <div className={classes.elGlobalTripIfos}>
              <div className={classes.globalInfosPrimitiveContainer}>
                <FiMapPin className={classes.icoGlobalTripsIfos2} />
              </div>
              The receivers can track their deliveries.
            </div>
          </div>
          <div className={classes.requestBtnContainer}>
            <input
              type="submit"
              value="Request now"
              className={classes.formBasicSubmitBttnClassics}
              style={{ marginRight: 25 }}
            />
            <input
              type="submit"
              value="Schedule for later"
              className={classes.formBasicSubmitBttnClassics}
              style={{
                backgroundColor: "#d0d0d0",
                color: "black",
                borderColor: "#d0d0d0",
              }}
            />
          </div>
        </div>
        <div className={classes.mapContainer}>
          <ReactMapGL
            width={"100%"}
            height={"100%"}
            latitude={-22.575694}
            longitude={17.083251}
            zoom={13}
            mapStyle={"mapbox://styles/mapbox/streets-v11"}
            mapboxApiAccessToken={
              "pk.eyJ1IjoiZG9taW5pcXVla3R0IiwiYSI6ImNrYXg0M3gyNDAybDgyem81cjZuMXp4dzcifQ.PpW6VnORUHYSYqNCD9n6Yg"
            }
          />
        </div>
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
