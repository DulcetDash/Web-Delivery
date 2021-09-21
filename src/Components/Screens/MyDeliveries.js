import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { UpdateTripsData } from "../../Redux/HomeActionsCreators";
import classes from "../../styles/MyDeliveries.module.css";
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
  FiBox,
} from "react-icons/fi";
import {
  MdAccessTime,
  MdDeleteSweep,
  MdNearMe,
  MdPhone,
  MdBrightness1,
  MdCheckCircle,
  MdBlock,
  MdAutorenew,
} from "react-icons/md";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import "react-phone-number-input/style.css";
import SOCKET_CORE from "../../Helper/managerNode";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import "rc-steps/assets/index.css";
import Steps from "rc-steps";

class MyDeliveries extends React.Component {
  constructor(props) {
    super(props);

    this.SOCKET_CORE = SOCKET_CORE;

    this.state = {
      isLoadingCancellation: false, //Whether or not the cancellation is loading or not
    };
  }

  componentDidMount() {
    let globalObject = this;

    this.getCurrentLocationFrequently();

    /**
     * @socket trackdriverroute-response
     * Get route tracker response
     * Responsible for redirecting updates to map graphics data based on if the status of the request is: pending, in route to pickup, in route to drop off or completed
     */
    this.SOCKET_CORE.on("trackdriverroute-response", function (response) {
      //   console.log(response);
      globalObject.props.UpdateTripsData(response);

      try {
        if (
          response !== null &&
          response !== undefined &&
          /no_rides/i.test(response.request_status) === false
        ) {
          //1. Trip in progress: in route to pickup or in route to drop off
          if (
            response.response === undefined &&
            response.routePoints !== undefined &&
            /(inRouteToPickup|inRouteToDestination)/i.test(
              response.request_status
            )
          ) {
            //Update route to destination var - request status: inRouteToPickup, inRouteToDestination
            if (/inRouteToPickup/i.test(response.request_status)) {
              console.log("In route to pickup");
            } else if (response.request_status === "inRouteToDestination") {
              console.log("In route to destination");
            }
            //...
          } else if (/pending/i.test(response.request_status)) {
            console.log("Pending");
          } else if (
            response.request_status !== undefined &&
            response.request_status !== null &&
            /riderDropoffConfirmation_left/i.test(response.request_status)
          ) {
            console.log("Confirm dropoff left");
          } else if (response.request_status === "no_rides") {
            console.log("No rides");
          }
        } //No rides
        else {
          console.log("No rides");
        }
      } catch (error) {
        console.error(error);
      }
    });

    //2 Handle cancel request response
    this.SOCKET_CORE.on(
      "cancelRiders_request_io-response",
      function (response) {
        //Stop the loader and restore
        globalObject.setState({ isLoadingCancellation: false });
      }
    );
  }

  /**
   * @func cancelRequest_rider
   * Responsible for cancelling any current request as selected by the user
   * @param reason: the reason of cancelling the request.
   */
  cancelRequest_rider(reason = false) {
    console.log("Cancellation");
    if (
      this.props.App.tripsData !== undefined &&
      this.props.App.tripsData !== null &&
      this.props.App.tripsData !== false &&
      Object.keys(this.props.App.tripsData).length > 0
    ) {
      console.log("Inside");
      this.setState({ isLoadingCancellation: true }); //Activate the loader
      //Bundle the cancel input
      let bundleData = {
        request_fp:
          this.props.App.tripsData !== undefined &&
          this.props.App.tripsData.basicTripDetails !== undefined &&
          this.props.App.tripsData.basicTripDetails.request_fp !== undefined
            ? this.props.App.tripsData.basicTripDetails.request_fp
            : this.props.App.tripsData.request_fp,
        user_fingerprint: this.props.App.userData.loginData.company_fp,
        reason: reason,
      };
      ///...
      this.SOCKET_CORE.emit("cancelRiders_request_io", bundleData);
    } //Invalid request fp - close the modal
    else {
      //   this.props.UpdateErrorModalLog(false, false, "any"); //Close modal
    }
  }

  /**
   * Get the current location of the user
   */
  getCurrentLocationFrequently() {
    let globalObject = this;

    this.intervalPersister = setInterval(function () {
      //! -----Get the requests data if any
      let bundle = {
        latitude: globalObject.props.App.latitude,
        longitude: globalObject.props.App.longitude,
        user_fingerprint: globalObject.props.App.userData.loginData.company_fp,
        user_nature: "rider",
        pushnotif_token: false,
      };
      globalObject.SOCKET_CORE.emit("update-passenger-location", bundle);
    }, 2000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalPersister);
  }

  render() {
    let deliveryData = this.props.App.tripsData;

    return (
      <div className={classes.mainContainer}>
        <div className={classes.mainScreenTitle}>
          Active deliveries
          <div className={classes.historyEntryTitle}>History</div>
        </div>
        <div className={classes.contentContainer}>
          {Object.keys(this.props.App.tripsData).length > 0 &&
          deliveryData.birdview_infos !== undefined ? (
            <div className={classes.containterTracking}>
              {/* Header */}
              <div className={classes.headerTracking}>
                {/pending/i.test(deliveryData.request_status) ? (
                  <div>Hi, give us a moment</div>
                ) : (
                  <>
                    {/* driver side if any */}
                    <div className={classes.headerPart1}>
                      <div className={classes.driverPicHeader}>Image</div>
                      <div className={classes.namePlateNoHeader}>
                        <div className={classes.nameDriverHeader}>Name</div>
                        Plate number
                      </div>
                    </div>
                    {/* Phone number side if any (driver) */}
                    <div className={classes.headerPart2}>
                      <MdPhone
                        style={{ width: 20, height: 20, color: "#096ED4" }}
                      />{" "}
                      +264856997167
                    </div>
                  </>
                )}
              </div>
              {/* Progress */}
              <div className={classes.progressContainer}>
                <div className={classes.stepsProgress}>
                  <Steps current={1} icons={{ finish: <MdCheckCircle /> }}>
                    <Steps.Step
                      title=""
                      status={
                        /pending/i.test(deliveryData.request_status)
                          ? "process"
                          : "finish"
                      }
                      icon={<MdBrightness1 />}
                    />
                    <Steps.Step
                      title=""
                      status={"wait"}
                      icon={<MdBrightness1 />}
                    />
                    <Steps.Step
                      title=""
                      status={"wait"}
                      icon={<MdBrightness1 />}
                    />
                    <Steps.Step
                      title=""
                      status={"wait"}
                      icon={<MdCheckCircle />}
                    />
                  </Steps>
                </div>
                <div className={classes.statusReportTxt}>
                  <span>
                    {/pending/i.test(deliveryData.request_status)
                      ? "Finding you a driver"
                      : "some other status..."}
                  </span>
                  <div style={{ marginLeft: 10 }}>
                    <Loader
                      type="TailSpin"
                      color="#000"
                      height={15}
                      width={15}
                      timeout={300000000} //3 secs
                    />
                  </div>
                </div>
                <div className={classes.etaReport}>
                  {/pending/i.test(deliveryData.request_status)
                    ? ""
                    : "5min away"}
                </div>
              </div>
              {/* Trip global data */}
              <div className={classes.globalTripDataContainer}>
                <div className={classes.globalTElDefault}>
                  <FiBox style={{ marginRight: 3 }} />{" "}
                  {parseInt(deliveryData.birdview_infos.number_of_packages) >
                    1 ||
                  parseInt(deliveryData.birdview_infos.number_of_packages) === 0
                    ? `${deliveryData.birdview_infos.number_of_packages} packages`
                    : `${deliveryData.birdview_infos.number_of_packages} package`}
                </div>
                <div
                  className={classes.globalTElDefault}
                  style={{
                    color: "#09864A",
                    fontFamily: "MoveTextBold, sans-serif",
                    fontSize: 20,
                  }}
                >
                  N${deliveryData.birdview_infos.fare}
                </div>
                <div
                  className={classes.globalTElDefault}
                  style={{
                    fontSize: 14,
                    fontFamily: "MoveTextRegular, sans-serif",
                  }}
                >
                  {`${new Date(deliveryData.birdview_infos.date_requested)
                    .toLocaleDateString()
                    .replace(/\//g, "-")} at ${new Date(
                    deliveryData.birdview_infos.date_requested
                  ).toLocaleTimeString()}`}
                </div>
              </div>
              {/* Pickup and drop off location details */}
              <div className={classes.pickupAndDestinationContainer}>
                <div className={classes.lineSideDeco}>
                  <AiTwotoneCheckCircle className={classes.decoShapes} />
                  <div className={classes.lineAssocDeco}></div>
                  <AiTwotoneCalculator
                    className={classes.decoShapes}
                    style={{ color: "#096ED4" }}
                  />
                </div>
                <div
                  style={{
                    //   border: "1px solid black",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    justifyContent: "space-around",
                  }}
                >
                  <div
                    className={classes.pickupSide}
                    style={{ marginBottom: 20 }}
                  >
                    <div className={classes.labelDestination}>Pickup at</div>
                    <div>
                      {/* Pickup */}
                      <div>
                        <div className={classes.suburbName}>
                          {deliveryData.birdview_infos.pickup_details.suburb}
                        </div>
                        <div className={classes.detailsLocationText}>
                          {`${
                            deliveryData.birdview_infos.pickup_details
                              .location_name !== undefined &&
                            deliveryData.birdview_infos.pickup_details
                              .location_name !== false &&
                            deliveryData.birdview_infos.pickup_details
                              .location_name !== null &&
                            deliveryData.birdview_infos.pickup_details
                              .location_name !==
                              deliveryData.birdview_infos.pickup_details
                                .street_name &&
                            deliveryData.birdview_infos.pickup_details
                              .location_name !==
                              deliveryData.birdview_infos.pickup_details.suburb
                              ? `${deliveryData.birdview_infos.pickup_details.location_name}, `
                              : ""
                          }${
                            deliveryData.birdview_infos.pickup_details
                              .street_name !== undefined &&
                            deliveryData.birdview_infos.pickup_details
                              .street_name !== false &&
                            deliveryData.birdview_infos.pickup_details
                              .street_name !== null
                              ? `${
                                  deliveryData.birdview_infos.pickup_details
                                    .street_name.length > 20
                                    ? `${deliveryData.birdview_infos.pickup_details.street_name.substring(
                                        0,
                                        20
                                      )}.`
                                    : deliveryData.birdview_infos.pickup_details
                                        .street_name
                                }, `
                              : ""
                          }${deliveryData.birdview_infos.pickup_details.city}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={classes.pickupSide}
                    style={{ position: "relative", top: 24 }}
                  >
                    <div className={classes.labelDestination}>Drop off at</div>
                    <div>
                      {/* Single el */}
                      {deliveryData.birdview_infos.dropoff_details.map(
                        (location) => {
                          return (
                            <div style={{ marginBottom: 20 }}>
                              <div className={classes.suburbName}>
                                {location.suburb}
                              </div>
                              <div className={classes.detailsLocationText}>
                                {`${
                                  location.location_name !== undefined &&
                                  location.location_name !== false &&
                                  location.location_name !== "false" &&
                                  location.location_name !== null &&
                                  location.location_name !==
                                    location.street_name &&
                                  location.location_name !== location.suburb
                                    ? `${location.location_name}, `
                                    : ""
                                }${
                                  location.street_name !== undefined &&
                                  location.street_name !== false &&
                                  location.street_name !== "false" &&
                                  location.street_name !== null
                                    ? `${
                                        location.street_name.length > 20
                                          ? `${location.street_name.substring(
                                              0,
                                              20
                                            )}.`
                                          : location.street_name
                                      }, `
                                    : ""
                                }${location.city}`}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancellation side */}
              <div className={classes.cancelRegionContainer}>
                <div
                  style={{
                    // border: "1px solid black",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    cursor: "pointer",
                    fontFamily: "MoveTextMedium, sans-serif",
                  }}
                  onClick={() => this.cancelRequest_rider()}
                >
                  <MdBlock
                    style={{ marginRight: 3, top: 1, position: "relative" }}
                  />
                  <div>
                    Cancel your delivery
                    <div className={classes.smallExplanation}>
                      You can only cancel before your package(s) pick up.
                    </div>
                  </div>
                </div>
                {this.state.isLoadingCancellation ? (
                  <Loader
                    type="TailSpin"
                    color="#b22222"
                    height={20}
                    width={20}
                    timeout={300000000} //3 secs
                  />
                ) : (
                  <></>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                // border: "1px solid black",
                display: "flex",
                height: 400,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <MdAutorenew
                style={{ width: 35, height: 35, marginBottom: 25 }}
              />
              No active deliveries, but feel free to make a new request.
              <div
                className={classes.formBasicSubmitBttnClassicsReceiverInfos}
                onClick={() => {
                  window.location.href = "/Delivery";
                }}
              >
                Make a delivery
              </div>
            </div>
          )}
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
      UpdateTripsData,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MyDeliveries);
