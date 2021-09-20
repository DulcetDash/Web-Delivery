import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  UpdateCurrentLocationMetadat,
  UpdateTripsData,
} from "../../Redux/HomeActionsCreators";
import classes from "../../styles/Delivery.module.css";
import SOCKET_CORE from "../../Helper/managerNode";
import DeliveryNode from "../DeliveryNode/DeliveryNode";
import { geolocated } from "react-geolocated";
import { AiTwotoneEnvironment, AiTwotoneSetting } from "react-icons/ai";
import Loader from "react-loader-spinner";

class Delivery extends React.PureComponent {
  constructor(props) {
    super(props);

    this.SOCKET_CORE = SOCKET_CORE;

    this.state = {
      geolocationState: "granted",
      didGetTHeCurrentLocation: false,
    };
  }

  componentDidMount() {
    let globalObject = this;

    this.handlePermission();

    this.getCurrentLocationFrequently();

    //HANDLE SOCKET EVENTS
    /**
     * GET GEOCODED USER LOCATION
     * @event: geocode-this-point
     * Get the location of the user, parameter of interest: street name
     */
    this.SOCKET_CORE.on("geocode-this-point-response", function (response) {
      // console.log(response);
      if (response !== undefined && response !== false) {
        globalObject.props.UpdateCurrentLocationMetadat(response);
        globalObject.setState({ didGetTHeCurrentLocation: true });
      }
    });

    /**
     * @socket trackdriverroute-response
     * Get route tracker response
     * Responsible for redirecting updates to map graphics data based on if the status of the request is: pending, in route to pickup, in route to drop off or completed
     */
    this.SOCKET_CORE.on("trackdriverroute-response", function (response) {
      console.log(response);
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
  }

  componentWillMount() {
    this.handlePermission();
  }

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
              console.log(position);
              globalObject.setState({ geolocationState: "granted" });
            },
            (error) => {
              console.log(error);
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

    this.intervalPersister = setInterval(function () {
      //Unlock if a location is present

      globalObject.SOCKET_CORE.emit("geocode-this-point", {
        latitude: globalObject.props.App.latitude,
        longitude: globalObject.props.App.longitude,
        user_fingerprint: globalObject.props.App.userData.loginData.company_fp,
      });

      //! -----Get the requests data if any
      let bundle = {
        latitude: globalObject.props.App.latitude,
        longitude: globalObject.props.App.longitude,
        user_fingerprint: globalObject.props.App.userData.loginData.company_fp,
        user_nature: "rider",
        pushnotif_token: false,
      };
      console.log(bundle);
      globalObject.SOCKET_CORE.emit("update-passenger-location", bundle);
    }, 2000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalPersister);
  }

  render() {
    return (
      <div className={classes.mainContainer}>
        {!this.props.isGeolocationAvailable ? (
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
            }}
          >
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
                navigator.geolocation.getCurrentPosition((position) => {
                  console.log(position);
                })
              }
            >
              <AiTwotoneEnvironment
                style={{ position: "relative", marginRight: 3, bottom: 1 }}
              />
              Enable
            </div>
          </div>
        ) : (
          <>
            {this.state.didGetTHeCurrentLocation ? (
              <>
                <div className={classes.mainScreenTitle}>
                  Make your delivery
                </div>
                <div className={classes.contentContainer}>
                  <DeliveryNode />
                </div>
              </>
            ) : (
              <div
                style={{
                  // border: "1px solid black",
                  height: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
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
