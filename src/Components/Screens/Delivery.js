import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
// import { UpdateLoggingData } from "../Redux/HomeActionsCreators";
import classes from "../../styles/Delivery.module.css";
import DeliveryNode from "../DeliveryNode/DeliveryNode";

class Delivery extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log(this.props.App);
  }

  render() {
    return (
      <div className={classes.mainContainer}>
        <div className={classes.mainScreenTitle}>Make your delivery</div>
        <div className={classes.contentContainer}>
          <DeliveryNode />
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

export default connect(mapStateToProps, mapDispatchToProps)(Delivery);
