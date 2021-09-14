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

class DeliveryNode extends React.Component {
  constructor(props) {
    super(props);

    //! DEBUG
    this.props.App.userData.loginData.plans.subscribed_plan = "starter";
    this.props.App.userData.loginData.plans["delivery_limit"] = 2;
    //! ----------

    this.state = {
      //Will contain all the drop off destination data as they also increase
      dropOff_destination: [
        {
          id: 1,
          data: null,
        },
      ],
    };
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
            }
          : this.state.dropOff_destination[index].data;

      //? Get important data
      let localData = this.state.dropOff_destination[index];
      //1. Receiver's infos
      let receiverName = localData.data.receiverInfos.receiver_name;
      let receiverPhone = localData.data.receiverInfos.receiver_phone;
      //? -----
      return (
        <div className={classes.higherOrderPrimitiveContainer}>
          <div className={classes.dropOffPrimitiveContainer}>
            <input
              key={index.toString()}
              type="text"
              placeholder={`Enter drop off location${
                this.state.dropOff_destination.length > 1 ? ` ${index + 1}` : ""
              }`}
              className={classes.formBasicInput}
            />
            {index > 0 ? (
              <FiTrash2
                onClick={() => this.removeGivenDropOffLocation(index)}
                className={classes.removeDropOffIco}
                title="Remove"
              />
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

  render() {
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
                <input
                  type="text"
                  placeholder="Enter pickup location"
                  className={classes.formBasicInput}
                />
                <br />
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
                <AiFillEnvironment className={classes.icoGlobalTripsIfos2} />
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
