import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  UpdateCurrentLocationMetadat,
  UpdateTripsData,
  UpdateLoggingData,
} from "../../Redux/HomeActionsCreators";
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
  MdWork,
} from "react-icons/md";
import classes from "../../styles/Delivery.module.css";
import DeliveryNode from "../DeliveryNode/DeliveryNode";
import { geolocated } from "react-geolocated";
import { AiTwotoneEnvironment, AiTwotoneSetting } from "react-icons/ai";
import { TailSpin as Loader } from "react-loader-spinner";
import GreetingImage from "../../Images/newDriverWelcome.jpg";
import axios from "axios";
import { Tag } from "antd";
import {
  PRIMARY_DILUTED,
  SECONDARY,
  SECONDARY_STRONG,
} from "../../Helper/Colors";

class Delivery extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      geolocationState: "granted",
      didGetTHeCurrentLocation: false,
    };
  }

  componentDidMount() {
    this.handlePermission();

    this.getCurrentLocationFrequently();
  }

  componentWillMount() {
    this.handlePermission();
  }

  handleGeocodedResponse = (response) => {
    // console.log(response);
    if (response !== undefined && response !== false) {
      this.props.UpdateCurrentLocationMetadat(response);
      this.setState({ didGetTHeCurrentLocation: true });
    }
  };

  handlePermission() {
    let globalObject = this;

    navigator.permissions
      .query({ name: "geolocation" })
      .then(function (result) {
        if (result.state === "granted") {
          globalObject.setState({ geolocationState: "granted" });
        } else if (result.state === "prompt") {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // console.log(position);
              globalObject.setState({ geolocationState: "granted" });
            },
            (error) => {
              // console.log(error);
              globalObject.setState({ geolocationState: "denied" });
            }
          );
        } else if (result.state === "denied") {
          globalObject.setState({ geolocationState: "denied" });
        }
      });
  }

  /**
   * Get the current location of the user
   */
  getCurrentLocationFrequently() {
    let globalObject = this;

    navigator.geolocation.watchPosition(
      (position) => {
        if (
          position !== undefined &&
          position !== null &&
          position.coords !== undefined &&
          position.coords !== null &&
          position.coords.latitude !== undefined &&
          position.coords.latitude !== null
        ) {
          //?Update the global app state as well as the local state
          globalObject.props.App.latitude = position.coords.latitude;
          globalObject.props.App.longitude = position.coords.longitude;
          //?----
        }
      },
      () => {},
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
      }
    );

    this.intervalPersister = setInterval(async () => {
      try {
        //Unlock if a location is present
        const geocoding = await axios.post(
          `${process.env.REACT_APP_URL}/geocode_this_point`,
          {
            latitude: globalObject.props.App.latitude,
            longitude: globalObject.props.App.longitude,
            user_fingerprint:
              globalObject.props.App.userData?.loginData?.company_fp,
          },
          {
            headers: {
              Authorization: `Bearer ${globalObject.props.App.userData?.loginData?.company_fp}`,
            },
            withCredentials: true,
          }
        );

        this.handleGeocodedResponse(geocoding.data);
      } catch (error) {
        console.log(error);
      }
    }, 7000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalPersister);
  }

  renderNoPlansFound() {
    return (
      <div
        style={{
          // border: "1px solid black",
          display: "flex",
          height: 400,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          width: "65%",
          margin: "auto",
          textAlign: "center",
        }}>
        <div style={{ fontFamily: "MoveBold, sans-serif", fontSize: 30 }}>
          Welcome!
        </div>
        <div
          style={{
            // border: "1px solid black",
            width: 400,
            height: 200,
            marginBottom: 20,
          }}>
          <img
            alt="greet"
            src={GreetingImage}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
        It looks like you don't have any active package yet, please purchase to
        start.
        <div
          className={classes.formBasicSubmitBttnClassicsReceiverInfos}
          onClick={() => {
            window.location.href = "/plans";
          }}>
          Purchase a package
        </div>
      </div>
    );
  }

  isBalanceHealthy() {
    const balance = this.props.App.userData?.loginData?.plans?.balance;
    return balance !== undefined && balance > 50;
  }

  shouldAllowRequests() {
    return (
      (!this.props.App.userData?.loginData?.plans?.subscribed_plan ||
        !this.props.App.userData?.loginData?.plans?.isPlan_active) &&
      this.props.App.userData?.loginData?.plans?.balance <= 0
    );
  }

  render() {
    const balance = this.props.App.userData?.loginData?.plans?.balance;

    return (
      <div
        className={classes.mainContainer}
        style={{
          backgroundColor: this.shouldAllowRequests() ? "#fff" : "#f3f3f3",
        }}>
        {this.shouldAllowRequests() ? (
          this.renderNoPlansFound()
        ) : !this.props.isGeolocationAvailable ? (
          <div>Your browser does not support geolocation</div>
        ) : !this.props.isGeolocationEnabled ? (
          <div
            style={{
              border: "1px solid #d0d0d0",
              height: 450,
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <div className={classes.mainTitleNotice}>
              <AiTwotoneSetting
                style={{
                  width: 40,
                  height: 40,
                  color: "#d0d0d0",
                  marginBottom: 20,
                }}
              />
              <br />
              Your geolocation is not enabled
            </div>
            <div className={classes.mainMessageNotice}>
              Please enable your GPS in order to have the best possible
              experience.
            </div>
            <div
              className={classes.formBasicButton}
              style={{ borderRadius: 3 }}
              onClick={() =>
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    this.setState({ geolocationState: "granted" });
                    window.location.reload();
                  },
                  (error) => {
                    // console.log(error);
                    this.setState({ geolocationState: "denied" });
                  }
                )
              }>
              <AiTwotoneEnvironment
                style={{ position: "relative", marginRight: 3, bottom: 1 }}
              />
              Enable
            </div>
          </div>
        ) : (
          <>
            {this.state.didGetTHeCurrentLocation &&
            this.props.App?.tripsData.length <
              this.props.App.userData.loginData?.plans?.delivery_limit ? (
              <>
                <div className={classes.mainScreenTitle}>
                  Make your delivery{" "}
                  <Tag
                    color={
                      this.isBalanceHealthy()
                        ? PRIMARY_DILUTED
                        : SECONDARY_STRONG
                    }
                    style={{
                      position: "relative",
                      top: 2,
                      marginLeft: 20,
                      color: this.isBalanceHealthy() ? "#fff" : "#000",
                      fontSize: 16,
                    }}>
                    Balance:{" "}
                    <strong>
                      {balance !== undefined ? `N$${balance}` : "Checking"}
                    </strong>
                  </Tag>
                  {!this.isBalanceHealthy() && (
                    <Tag
                      style={{
                        position: "relative",
                        top: 2,
                        cursor: "pointer",
                        fontSize: 16,
                      }}
                      onClick={() => (window.location.href = "/Settings")}>
                      Top-up your balance
                    </Tag>
                  )}
                </div>
                <div className={classes.contentContainer}>
                  <DeliveryNode />
                </div>
              </>
            ) : this.props.App.tripsData.length >=
              this.props.App.userData.loginData?.plans?.delivery_limit ? (
              <div
                style={{
                  // border: "1px solid black",
                  display: "flex",
                  height: 400,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  width: "65%",
                  margin: "auto",
                  textAlign: "center",
                }}>
                <MdWork style={{ width: 35, height: 35, marginBottom: 25 }} />
                Hi, you've reached your maximum allowed number of individual
                requests, please wait until your active deliveries are completed
                before making new ones.
                <div
                  className={classes.formBasicSubmitBttnClassicsReceiverInfos}
                  onClick={() => {
                    window.location.href = "/MyDeliveries";
                  }}>
                  Track your delivery here
                </div>
              </div>
            ) : (
              <div
                style={{
                  // border: "1px solid black",
                  height: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}>
                <div>
                  <Loader
                    type="TailSpin"
                    color="#000"
                    height={50}
                    width={50}
                    timeout={300000000} //3 secs
                  />
                </div>
              </div>
            )}
          </>
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
      UpdateCurrentLocationMetadat,
      UpdateTripsData,
      UpdateLoggingData,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  geolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    watchPosition: true,
    userDecisionTimeout: null,
  })(Delivery)
);
