import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { UpdateLoggingData } from "../../Redux/HomeActionsCreators";
import Header from "../Screens/Header";
import classes from "../../styles/Plans.module.css";
import PlanNode from "./PlanNode";

class PresentPlans extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={classes.mainContainer}>
        <Header
          customButton={{
            show: true,
            title: "Skip for now",
            action: null,
          }}
        />
        <div className={classes.mainTitle}>Business friendly pricing</div>
        <div className={classes.subMainTitle}>
          Let’s find a plan that’s right for you.
        </div>
        <div className={classes.plansContainer}>
          <PlanNode
            planName={"Starter"}
            description={"Powerful logistic with easy setup"}
            priceSmallBreakdown={"2 deliveries for about N$50 per delivery."}
            price={"N$100"}
            paymentPeriod={"month"}
            marginRight={20}
            isActive
          />
          <PlanNode
            planName={"Intermediate"}
            description={"Grow your business with minimal setup"}
            price={"N$2500"}
            priceSmallBreakdown={"50 deliveries for about N$50 per delivery."}
            paymentPeriod={"month"}
            marginRight={20}
            isRecommended
            isActive
          />
          <PlanNode
            planName={"Pro"}
            description={"Scale your business seamlessly"}
            price={"N$15000"}
            priceSmallBreakdown={"300 deliveries for about N$50 per delivery."}
            paymentPeriod={"month"}
            marginRight={20}
          />
          <PlanNode
            planName={"Personalized"}
            description={"Ultimate control and support for your team"}
            price={"Custom"}
            priceSmallBreakdown={
              "Custom deliveries above 300 and analytics tool."
            }
            buttonTitle={"Contact sales"}
          />
        </div>
        {/* Footer */}
        <div className={classes.footer}>
          <div className={classes.copyrightText}>
            TaxiConnect 2020. All rights reserved.
          </div>
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
      UpdateLoggingData,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PresentPlans);
