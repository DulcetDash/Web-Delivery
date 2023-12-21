import { PRIMARY } from "../../Helper/Colors";
import Loader from "../../Helper/Loader/Loader";
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
  titleFeatures = "Free access to:",
  featuresList = [
    { title: "Feature 1" },
    { title: "Feature 2" },
    { title: "Feature 3" },
  ],
  marginRight = 0,
  isRecommended = false,
  isActive = false,
  actionGetStartedButton = null,
  isLoading = false,
  isSubscribed = false,
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
        }}>
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
          onClick={isActive && !isSubscribed ? actionGetStartedButton : null}
          className={
            isActive
              ? classes.getStartedButton
              : classes.getStartedButtonInactive
          }
          style={{
            cursor: isSubscribed ? "default" : "pointer",
            backgroundColor: isSubscribed ? PRIMARY : "#000",
            borderColor: isSubscribed ? PRIMARY : "#000",
          }}>
          {isSubscribed ? (
            "Subscribed"
          ) : isLoading ? (
            <Loader color="#fff" size={30} />
          ) : (
            buttonTitle
          )}
        </div>
        <div className={classes.featuresList}>
          <div className={classes.titleFeaturesList}>{titleFeatures}</div>
          <div className={classes.featuresTrueMother}>
            {featuresList.map((feature) => {
              return (
                <div
                  key={`${feature?.title}-${Date.now()}`}
                  className={classes.featureNode}>
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
