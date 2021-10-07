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
import classes from "../../styles/Statistics.module.css";
import SOCKET_CORE from "../../Helper/managerNode";
import { AiOutlineRight, AiTwotoneCalculator } from "react-icons/ai";
import Loader from "react-loader-spinner";
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
  LineSeries,
  LabelSeries,
  makeWidthFlexible,
  DiscreteColorLegend,
  Crosshair,
} from "react-vis";
import "react-vis/dist/style.css";
import NodeTableExplainer from "../../Helper/NodeTableExplainer";

const FlexibleXYPlot = makeWidthFlexible(XYPlot);

class Statistics extends React.Component {
  constructor(props) {
    super(props);

    this.SOCKET_CORE = SOCKET_CORE;

    this.intervalPersister = null;

    this.state = {
      isLoading: true, //If something is loading or not
      statisticalData: {}, //The ride history data
      crosshairValues: [],
    };
  }

  /**
   * Event handler for onMouseLeave.
   * @private
   */
  _onMouseLeave = () => {
    this.setState({ crosshairValues: [] });
  };

  /**
   * Event handler for onNearestX.
   * @param {Object} value Selected value.
   * @param {index} index Index of the value in the data array.
   * @private
   */
  _onNearestX = (value, { index }) => {
    let DATA = [
      this.state.statisticalData !== null &&
      this.state.statisticalData !== undefined &&
      this.state.statisticalData.response !== undefined &&
      this.state.statisticalData.response.daily_view !== undefined
        ? this.state.statisticalData.response.daily_view.total_trips
        : [],
      this.state.statisticalData !== null &&
      this.state.statisticalData !== undefined &&
      this.state.statisticalData.response !== undefined &&
      this.state.statisticalData.response.daily_view !== undefined
        ? this.state.statisticalData.response.daily_view.total_successful_trips
        : [],
    ];
    //....
    this.setState({ crosshairValues: DATA.map((d) => d[index]) });
  };

  componentDidMount() {
    let globalObject = this;

    this.getStatisticsFreshData();

    //Handle socket io events
    this.SOCKET_CORE.on(
      "getTripsObservabilityStatsDeliveryWeb_io-response",
      function (response) {
        if (
          response !== undefined &&
          response.stateHash !== undefined &&
          response.response !== undefined &&
          response.response.daily_view !== undefined &&
          /(error|no_data)/i.test(response.response) === false
        ) {
          //?Optimized
          if (
            response.stateHash !== globalObject.state.statisticalData.stateHash
          ) {
            globalObject.setState({
              statisticalData: response,
              isLoading: false,
            });
          }
        } //Clear data
        else {
          globalObject.setState({ statisticalData: {}, isLoading: false });
        }
      }
    );
  }

  componentWillMount() {}

  getStatisticsFreshData() {
    let globalObject = this;

    this.intervalPersister = setInterval(function () {
      let bundleRequest = {
        user_fp: globalObject.props.App.userData.loginData.company_fp,
        isolation_factor: "generic_view|daily_view",
        make_graphReady: true,
      };
      //...
      globalObject.SOCKET_CORE.emit(
        "getTripsObservabilityStatsDeliveryWeb_io",
        bundleRequest
      );
    }, 2000);
  }

  /**
   * Responsible for returning a valid value or zero if the value does not exist
   * For the generic data
   */
  returnValidValueOrZero(value) {
    try {
      return this.state.statisticalData.response.genericGlobalStats[value];
    } catch (error) {
      return 0;
    }
  }

  render() {
    return (
      <div className={classes.mainContainer}>
        <div className={classes.mainScreenTitle}>
          Statistics
          {/* <div className={classes.historyEntryTitle}>Everything</div> */}
        </div>

        <div className={classes.graphContainer}>
          {Object.keys(this.state.statisticalData).length > 0 &&
          this.state.isLoading === false ? (
            <FlexibleXYPlot xType="ordinal" height={400} stackBy="y">
              <VerticalGridLines />
              <HorizontalGridLines />
              <XAxis title="Days" />
              <YAxis tickFormat={(v) => (/\./i.test(String(v)) ? null : v)} />
              <DiscreteColorLegend
                style={{ position: "relative", left: "20px", bottom: "0px" }}
                orientation="horizontal"
                items={[
                  {
                    title: "Successful trips",
                    color: "#3EA37C",
                  },
                  {
                    title: "Cancelled trips",
                    color: "#a13d63",
                  },
                ]}
              />

              <VerticalBarSeries
                data={
                  this.state.statisticalData !== null &&
                  this.state.statisticalData !== undefined &&
                  this.state.statisticalData.response !== undefined &&
                  this.state.statisticalData.response.daily_view !== undefined
                    ? this.state.statisticalData.response.daily_view
                        .total_successful_trips
                    : []
                }
                curve={"curveMonotoneX"}
                style={{
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                }}
                color={"#3EA37C"}
                onNearestX={this._onNearestX}
                onValueMouseOut={this._onMouseLeave}
              />

              {/* Show cancelled total trips */}
              <VerticalBarSeries
                data={
                  this.state.statisticalData !== null &&
                  this.state.statisticalData !== undefined &&
                  this.state.statisticalData.response !== undefined &&
                  this.state.statisticalData.response.daily_view !== undefined
                    ? this.state.statisticalData.response.daily_view
                        .total_cancelled_trips
                    : []
                }
                curve={"curveMonotoneX"}
                style={{
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                }}
                color={"#a13d63"}
                onNearestX={this._onNearestX}
                onValueMouseOut={this._onMouseLeave}
              />

              {/* Crosshair */}
              <Crosshair
                values={this.state.crosshairValues}
                className={"test-class-name"}
                titleFormat={(d) => ({
                  title: "Trips",
                  value: d[0].y + d[1].y,
                })}
                itemsFormat={(d) => [
                  { title: "Successful", value: d[1].y },
                  { title: "Cancelled", value: d[0].y },
                ]}
              />
            </FlexibleXYPlot>
          ) : this.state.isLoading ? (
            <div
              style={{
                margin: "auto",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader
                type="TailSpin"
                color="#000"
                height={45}
                width={45}
                timeout={300000000} //3 secs
              />
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              No data to show
            </div>
          )}
        </div>

        <div className={classes.globalNumbersContainer}>
          <div className={classes.headerGBNumbers}>Overview</div>

          <NodeTableExplainer
            title="Trips related"
            left={[
              {
                title: "Total deliveries",
                value:
                  this.returnValidValueOrZero("tripInsight").total_deliveries,
              },
              {
                title: "Total successful deliveries",
                value:
                  this.returnValidValueOrZero("tripInsight")
                    .total_successful_deliveries,
              },
              {
                title: "Total cancelled deliveries",
                value:
                  this.returnValidValueOrZero("tripInsight")
                    .total_cancelled_deliveries,
              },
              {
                title: "Total customers served",
                value:
                  this.returnValidValueOrZero("tripInsight")
                    .total_served_receivers,
              },
            ]}
            right={[
              {
                title: "Total spent",
                value: `N$${
                  this.returnValidValueOrZero("financialInsights")
                    .total_spent_successful_del !== undefined
                    ? this.returnValidValueOrZero("financialInsights")
                        .total_spent_successful_del
                    : 0
                }`,
              },
            ]}
          />
        </div>
        <div style={{ height: 50 }}></div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Statistics);
