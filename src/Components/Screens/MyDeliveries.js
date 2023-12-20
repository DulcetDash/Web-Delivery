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
  MdArrowForward,
  MdPlayArrow,
  MdStar,
} from "react-icons/md";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import "react-phone-number-input/style.css";
// import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { TailSpin as Loader } from "react-loader-spinner";
import "rc-steps/assets/index.css";
import Steps from "rc-steps";
import { formatDateGeneric } from "../../Helper/Utils";
import axios from "axios";
import { CheckCircleFilled, InfoCircleFilled } from "@ant-design/icons";
import { GRAY_1, PRIMARY, SECONDARY_STRONG } from "../../Helper/Colors";

class MyDeliveries extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoadingCancellation: false, //Whether or not the cancellation is loading or not
    };
  }

  componentDidMount() {}

  /**
   * @func cancelRequest_rider
   * Responsible for cancelling any current request as selected by the user
   * @param reason: the reason of cancelling the request.
   */
  cancelRequest_rider = async (request_fp, reason = false) => {
    try {
      // console.log("Cancellation");
      if (
        this.props.App.tripsData &&
        this.props.App.tripsData !== false &&
        this.props.App.tripsData.length > 0
      ) {
        // console.log("Inside");
        this.setState({ isLoadingCancellation: true }); //Activate the loader
        //Bundle the cancel input
        let bundleData = {
          request_fp: request_fp,
          user_identifier: this.props.App.userData.loginData.company_fp,
          reason: reason,
        };
        ///...
        const response = await axios.post(
          `${process.env.REACT_APP_URL}/cancel_request_user`,
          bundleData,
          {
            headers: {
              Authorization: `Bearer ${this.props.App.userData.loginData.company_fp}`,
            },
          }
        );

        if (response.data[0]?.response === "success") {
          console.log(response.data);
        }
        this.setState({ isLoadingCancellation: false });
      } //Invalid request fp - close the modal
      else {
        //   this.props.UpdateErrorModalLog(false, false, "any"); //Close modal
      }
    } catch (error) {
      console.log(error);
      this.setState({ isLoadingCancellation: false });
    }
  };

  /**
   * @func confirmRiderDropoff
   * @param request_fp: the request fingerprint
   * Responsible for bundling the request data and requesting for a rider's drop off confirmation.
   */
  confirmRiderDropoff = async (request_fp) => {
    try {
      this.setState({ isLoadingCancellation: true }); //Activate the loader - and lock the rating, compliment, done button and additional note input
      let dropoff_bundle = {
        user_fingerprint: this.props.App.userData.loginData.company_fp,
        badges: [],
        note: "",
        rating: 4.9,
        request_fp,
      };
      //..
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/submitRiderOrClientRating`,
        dropoff_bundle,
        {
          headers: {
            Authorization: `Bearer ${this.props.App.userData.loginData.company_fp}`,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    return (
      <div className={classes.mainContainer}>
        <div className={classes.mainScreenTitle}>
          Active deliveries ({(this.props.App.tripsData ?? []).length})
          <div
            className={classes.historyEntryTitle}
            onClick={() => (window.location.href = "/History")}>
            History
          </div>
        </div>
        {this.props.App.tripsData.length > 0 ? (
          this.props.App.tripsData.map((deliveryData, index) => {
            return (
              <div
                key={deliveryData?.request_fp}
                style={{ marginTop: index === 0 ? 30 : 60 }}>
                <div style={{ fontSize: 13, color: "#7c6e6ebb" }}>
                  DELIVERY {index + 1}
                </div>
                <div className={classes.contentContainer}>
                  <div className={classes.containterTracking}>
                    {/* Header */}
                    <div className={classes.headerTracking}>
                      {/pending/i.test(deliveryData?.status) ? (
                        <div>Finding a courier...</div>
                      ) : (
                        <>
                          {/* driver side if any */}
                          <div className={classes.headerPart1}>
                            <div className={classes.driverPicHeader}>
                              <img
                                alt="drv"
                                src={
                                  deliveryData?.driver_details?.picture ??
                                  "/user.png"
                                }
                                className={classes.profilePicDriver_linked}
                              />
                            </div>
                            <div className={classes.namePlateNoHeader}>
                              <div className={classes.nameDriverHeader}>
                                {deliveryData?.driver_details?.name ??
                                  "Courier"}
                                <div className={classes.ratingContainer}>
                                  <MdStar
                                    style={{
                                      width: 15,
                                      height: 15,
                                      top: 2,
                                      position: "relative",
                                      color: "#FFC043",
                                    }}
                                  />{" "}
                                  {deliveryData?.driver_details?.rating ??
                                    "4.9"}
                                </div>
                              </div>
                              <div className={classes.plateNoText}>
                                {/completed/i.test(deliveryData.status)
                                  ? deliveryData.driver_details?.car_brand
                                  : deliveryData.carDetails?.car_brand}
                                <span style={{ marginLeft: 12 }}>
                                  {/completed/i.test(deliveryData.status)
                                    ? deliveryData.driver_details?.plate_number
                                    : deliveryData.carDetails?.plate_number}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Phone number side if any (driver) */}
                          <div className={classes.headerPart2}>
                            <MdPhone
                              style={{
                                width: 20,
                                height: 20,
                                color: "#096ED4",
                              }}
                            />{" "}
                            {deliveryData.driver_details?.phone ?? ""}
                          </div>
                        </>
                      )}
                    </div>
                    {/* Progress */}
                    <div className={classes.progressContainer}>
                      <div className={classes.stepsProgress}>
                        <Steps
                          current={1}
                          icons={{ finish: <MdCheckCircle /> }}>
                          <Steps.Step
                            title=""
                            status={
                              /pending/i.test(deliveryData?.status)
                                ? "process"
                                : "finish"
                            }
                            icon={<MdBrightness1 />}
                          />
                          <Steps.Step
                            title=""
                            status={
                              /started/i.test(deliveryData.status)
                                ? "process"
                                : /(shipping|completed)/i.test(
                                    deliveryData.status
                                  )
                                ? "finish"
                                : "wait"
                            }
                            icon={<MdBrightness1 />}
                          />
                          <Steps.Step
                            title=""
                            status={
                              /completed/i.test(deliveryData.status)
                                ? "finish"
                                : /(pending|started)/i.test(deliveryData.status)
                                ? "wait"
                                : "process"
                            }
                            icon={<MdBrightness1 />}
                          />
                          <Steps.Step
                            title=""
                            status={
                              /completed/i.test(deliveryData.status)
                                ? "finish"
                                : "wait"
                            }
                            icon={<MdCheckCircle />}
                          />
                        </Steps>
                      </div>
                      <div className={classes.statusReportTxt}>
                        <span>
                          {/pending/i.test(deliveryData.status)
                            ? "Finding you a courier"
                            : /started/i.test(deliveryData.status)
                            ? "In route to pickup your package"
                            : /shipping/i.test(deliveryData.status)
                            ? "In route to drop off your package"
                            : /completed/i.test(deliveryData.status)
                            ? `${
                                deliveryData?.trip_locations?.dropoff.length ===
                                1
                                  ? "Package"
                                  : "Packages"
                              } dropped off successfully`
                            : "..."}
                        </span>
                        {/completed/i.test(deliveryData.status) ? (
                          <></>
                        ) : (
                          <div style={{ marginLeft: 10 }}>
                            <Loader
                              type="TailSpin"
                              color="#000"
                              height={15}
                              width={15}
                              timeout={300000000} //3 secs
                            />
                          </div>
                        )}
                      </div>
                      <div className={classes.etaReport}>
                        {/pending/i.test(deliveryData.status)
                          ? deliveryData.eta
                          : /(started|shipping)/i.test(deliveryData.status)
                          ? deliveryData?.ETA_toDestination
                          : ""}
                      </div>
                    </div>
                    {/* Trip global data */}
                    <div className={classes.globalTripDataContainer}>
                      <div className={classes.globalTElDefault}>
                        <FiBox style={{ marginRight: 3 }} />{" "}
                        {`${
                          deliveryData?.trip_locations?.dropoff.length
                        } package${
                          deliveryData?.trip_locations?.dropoff.length > 1
                            ? "s"
                            : ""
                        }`}
                      </div>
                      <div
                        className={classes.globalTElDefault}
                        style={{
                          color: "#09864A",
                          fontFamily: "MoveTextBold, sans-serif",
                          fontSize: 20,
                        }}>
                        N${deliveryData.totals_request?.total}
                      </div>
                      <div
                        className={classes.globalTElDefault}
                        style={{
                          fontSize: 14,
                          fontFamily: "MoveTextRegular, sans-serif",
                        }}>
                        {formatDateGeneric(deliveryData?.date_requested)}
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
                        }}>
                        <div
                          className={classes.pickupSide}
                          style={{ marginBottom: 20 }}>
                          <div className={classes.labelDestination}>
                            Pickup at
                          </div>
                          <div>
                            {/* Pickup */}
                            <div>
                              <div className={classes.suburbName}>
                                {deliveryData?.trip_locations?.pickup?.street ??
                                  deliveryData?.trip_locations?.pickup
                                    ?.district}
                              </div>
                              <div className={classes.detailsLocationText}>
                                {`${deliveryData?.trip_locations?.pickup?.state}, ${deliveryData?.trip_locations?.pickup?.country}`}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className={classes.pickupSide}
                          style={{ position: "relative", top: 24 }}>
                          <div className={classes.labelDestination}>
                            Drop off at
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flex: 1,
                              flexDirection: "column",
                            }}>
                            {/* Single el */}
                            {deliveryData?.trip_locations?.dropoff.map(
                              (location, index) => {
                                return (
                                  <div
                                    style={{
                                      marginBottom: 20,
                                      borderBottom:
                                        index + 1 !==
                                        deliveryData?.trip_locations?.dropoff
                                          .length
                                          ? "1px solid #f3f3f3"
                                          : "none",
                                      display: "flex",
                                      flex: 1,
                                      paddingBottom: 15,
                                    }}>
                                    <div style={{ flex: 1 }}>
                                      <div className={classes.suburbName}>
                                        {location?.dropoff_location
                                          ?.location_name ??
                                          location?.dropoff_location?.district}
                                      </div>
                                      <div
                                        className={classes.detailsLocationText}>
                                        {`${location?.dropoff_location?.state}, ${location?.dropoff_location?.country}`}
                                      </div>

                                      {!/(cancelled|pending)/i.test(
                                        deliveryData?.status
                                      ) && (
                                        <div
                                          style={{
                                            fontSize: 14,
                                            color: location?.isCompleted
                                              ? PRIMARY
                                              : SECONDARY_STRONG,
                                            marginTop: 10,
                                          }}>
                                          <CheckCircleFilled
                                            style={{
                                              color: location?.isCompleted
                                                ? PRIMARY
                                                : SECONDARY_STRONG,
                                              marginRight: 5,
                                            }}
                                          />
                                          {location?.isCompleted
                                            ? "Package dropped off"
                                            : "Delivery in progress"}
                                        </div>
                                      )}
                                    </div>
                                    {/* Receiver's side */}
                                    <div
                                      style={{
                                        //   border: "1px solid black",
                                        width: 100,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}>
                                      <MdPlayArrow
                                        style={{
                                          width: 13,
                                          height: 13,
                                          color: "#646d74",
                                        }}
                                      />
                                    </div>
                                    <div
                                      className={
                                        classes.receiverBatchContainer
                                      }>
                                      {location?.name ? (
                                        <>
                                          <div
                                            className={
                                              classes.receiverBatchName
                                            }>
                                            {location?.name}
                                          </div>
                                          <div
                                            className={
                                              classes.receiverBatchPhone
                                            }>
                                            {location?.phone}
                                          </div>
                                        </>
                                      ) : (
                                        <div
                                          style={{
                                            fontSize: 14,
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                          }}>
                                          No receiver specified
                                        </div>
                                      )}
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
                      {/(started|pending)/i.test(deliveryData.status) ? (
                        <div
                          style={{
                            // border: "1px solid black",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                            cursor: "pointer",
                            fontFamily: "MoveTextMedium, sans-serif",
                          }}
                          onClick={async () => {
                            await this.cancelRequest_rider(
                              deliveryData?.request_fp
                            );
                          }}>
                          <MdBlock
                            style={{
                              marginRight: 3,
                              top: 1,
                              position: "relative",
                            }}
                          />
                          <div>
                            Cancel your delivery
                            <div className={classes.smallExplanation}>
                              You can only cancel before your package(s) pick
                              up.
                            </div>
                          </div>
                        </div>
                      ) : /completed/i.test(deliveryData?.status) ? (
                        <div
                          style={{
                            // border: "1px solid black",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                            cursor: "pointer",
                            fontFamily: "MoveTextBold, sans-serif",
                            color: "#09864A",
                          }}
                          onClick={() =>
                            this.confirmRiderDropoff(deliveryData?.request_fp)
                          }>
                          <MdCheckCircle
                            style={{
                              marginRight: 3,
                              top: 1,
                              position: "relative",
                            }}
                          />
                          <div>
                            Confirm drop off
                            <div className={classes.smallExplanation}>
                              Please click here to confirm that the receiver has
                              received your package.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                      {this.state.isLoadingCancellation ? (
                        <Loader
                          type="TailSpin"
                          color="#09864A"
                          height={20}
                          width={20}
                          timeout={300000000} //3 secs
                        />
                      ) : (
                        !/(completed|pending|started)/i.test(
                          deliveryData?.status
                        ) && (
                          <div style={{ color: GRAY_1, fontSize: 14 }}>
                            <InfoCircleFilled /> You can't cancel a delivery
                            once it's been picked up.
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              // border: "1px solid black",
              display: "flex",
              height: 400,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}>
            <MdAutorenew style={{ width: 35, height: 35, marginBottom: 25 }} />
            No active deliveries, but feel free to make a new request.
            <div
              className={classes.formBasicSubmitBttnClassicsReceiverInfos}
              onClick={() => {
                window.location.href = "/Delivery";
              }}>
              Make a delivery
            </div>
          </div>
        )}
        <div style={{ height: 100 }}></div>
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
