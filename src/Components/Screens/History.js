import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  UpdateCurrentLocationMetadat,
  UpdateTripsData,
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
import classes from "../../styles/History.module.css";
import SOCKET_CORE from "../../Helper/managerNode";
import { AiOutlineRight, AiTwotoneCalculator } from "react-icons/ai";
import { TailSpin as Loader } from "react-loader-spinner";
import GreetingImage from "../../Images/newDriverWelcome.jpg";
import axios from "axios";
import { formatDateGeneric } from "../../Helper/Utils";
import { Tag } from "antd";
import { CORAL_RED, PRIMARY } from "../../Helper/Colors";

class History extends React.PureComponent {
  constructor(props) {
    super(props);

    this.SOCKET_CORE = SOCKET_CORE;

    this.state = {
      isLoading: true, //If something is loading or not
      historyData: [], //The ride history data
    };
  }

  componentDidMount() {
    let globalObject = this;

    this.getHistoryFreshData();

    //Handle socket io events
    this.SOCKET_CORE.on(
      "getRides_historyRiders_batchOrNot-response",
      function (response) {
        if (
          response !== undefined &&
          response.response !== undefined &&
          response.data !== undefined &&
          /success/i.test(response.response)
        ) {
          globalObject.setState({
            isLoading: false,
            historyData: response.data,
          });
        } //No data got
        else {
          globalObject.setState({
            isLoading: false,
            historyData: [],
          });
        }
      }
    );
  }

  componentWillMount() {}

  getHistoryFreshData = async () => {
    try {
      let bundleRequest = {
        user_identifier: this.props.App.userData.loginData.company_fp,
        ride_type: "past",
      };
      //...
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/getRequestListRiders`,
        bundleRequest,
        {
          headers: {
            Authorization: `Bearer ${this.props.App.userData?.loginData?.company_fp}`,
          },
        }
      );

      console.log(response?.data);
      if (response?.data?.response) {
        this.setState({
          isLoading: false,
          historyData: response.data?.response,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    return (
      <div className={classes.mainContainer}>
        <div className={classes.mainScreenTitle}>
          History
          <div
            className={classes.historyEntryTitle}
            onClick={() => (window.location.href = "/MyDeliveries")}>
            Active deliveries
          </div>
        </div>

        {this.state.isLoading ? (
          <div
            style={{
              // border: "1px solid black",
              marginTop: "25%",
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
        ) : this.state.historyData.length > 0 ? (
          <div className={classes.historyContainer}>
            {this.state.historyData.map((trip, index) => {
              return (
                <div
                  className={classes.historyLine}
                  style={{
                    borderBottomColor:
                      index + 1 === this.state.historyData.length
                        ? "#fff"
                        : "#d0d0d0",
                  }}>
                  <AiTwotoneCalculator
                    style={{
                      width: 7,
                      height: 7,
                      position: "relative",
                      top: 5,
                      marginRight: 10,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div className={classes.destinationLine}>
                      {`${trip?.locations?.dropoff.length} package${
                        trip?.locations?.dropoff.length === 1 ? "" : "s"
                      }`}
                    </div>
                    <div className={classes.dateRequestedLine}>
                      {formatDateGeneric(trip.createdAt)}
                    </div>
                    <div className={classes.carBrandLine}>
                      <Tag color={!trip?.cancelled ? PRIMARY : CORAL_RED}>
                        {!trip?.cancelled ? "Delivered" : "Cancelled"}
                      </Tag>
                    </div>
                  </div>

                  <div>{trip?.totals ? `N$${trip?.totals?.total}` : ""}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            Your history is empty
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
      UpdateCurrentLocationMetadat,
      UpdateTripsData,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(History);
