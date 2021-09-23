import classes from "../../styles/Plans.module.css";
import { AiFillCheckCircle } from "react-icons/ai";

const PlanNode = ({
  planName = "Plan name",
  description = "Description",
  price = "Price",
  paymentPeriod = "per what?",
  icon = "image",
  buttonTitle = "Get started now",
  priceSmallBreakdown = "breakdown of the price",
  featuresList = [
    { title: "Feature 1" },
    { title: "Feature 2" },
    { title: "Feature 3" },
  ],
  marginRight = 0,
  isRecommended = false,
  isActive = false,
}) => {
  return (
    <div style={{ marginRight: marginRight }}>
      {/* Is recommended badge */}
      {isRecommended ? (
        <div className={classes.recommendedBadge}>Recommended</div>
      ) : (
        <div className={classes.recommendedBadgeEMPTY}></div>
      )}
      <div
        className={classes.planNode}
        style={{
          borderTopLeftRadius: isRecommended ? "0px" : "7px",
          borderTopRightRadius: isRecommended ? "0px" : "7px",
        }}
      >
        <div className={classes.planName}>{planName}</div>
        <div className={classes.subExplanation}>{description}</div>
        <div className={classes.feeContainer}>
          {/custom/i.test(price) ? (
            <span className={classes.feeTrue}>{price}</span>
          ) : (
            <>
              from <span className={classes.feeTrue}>{price}</span>
              <span className={classes.perPeriodPayment}>{paymentPeriod}</span>
            </>
          )}
        </div>
        <div className={classes.subExplanationPrice}>{priceSmallBreakdown}</div>
        <div className={classes.planICON}>
          <img alt="planIco" src={icon} className={classes.planIcoTrue} />
        </div>
        <div
          className={
            isActive
              ? classes.getStartedButton
              : classes.getStartedButtonInactive
          }
        >
          {buttonTitle}
        </div>
        <div className={classes.featuresList}>
          <div className={classes.titleFeaturesList}>Free access to</div>
          <div className={classes.featuresTrueMother}>
            {featuresList.map((feature) => {
              return (
                <div className={classes.featureNode}>
                  <AiFillCheckCircle className={classes.icoFeatureLeft} />
                  <div className={classes.featureName}>{feature.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanNode;
