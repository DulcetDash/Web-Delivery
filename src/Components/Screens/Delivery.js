import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { UpdateCurrentLocationMetadat } from "../../Redux/HomeActionsCreators";
import classes from "../../styles/Delivery.module.css";
import SOCKET_CORE from "../../Helper/managerNode";
import DeliveryNode from "../DeliveryNode/DeliveryNode";
import { geolocated } from "react-geolocated";
import { AiTwotoneEnvironment, AiTwotoneSetting } from "react-icons/ai";

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

    this.intervalPersister = setInterval(function () {
      navigator.geolocation.getCurrentPosition(
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

            globalObject.SOCKET_CORE.emit("geocode-this-point", {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              user_fingerprint:
                globalObject.props.App.userData.loginData.company_fp,
            });
          }
        },
        () => {},
        {
          enableHighAccuracy: true,
          maximumAge: 2000,
        }
      );
    }, 1000);
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
              <div>Getting the current location</div>
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
