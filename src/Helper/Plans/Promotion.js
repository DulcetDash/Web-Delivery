import { MdOutlineArrowForward } from "react-icons/md";
import { BASIC_RADIUS, CORAL_RED, GENERIC_GRAY } from "../Colors";
import classes from "./Promotion.module.css";

const Promotion = ({
  content,
  actuator,
  marginTop = "2em",
  marginBottom = "2em",
}) => {
  return (
    <div
      onClick={() => (window.location.href = "/plans")}
      className={classes.promotionContainer}
      style={{
        fontWeight: 500,
        fontSize: "1.1em",
        marginBottom,
        marginTop,
        border: `1px solid ${GENERIC_GRAY}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 50,
        // margin: "auto",
        borderRadius: BASIC_RADIUS * 7,
        zIndex: 1000,
      }}>
      {content}
    </div>
  );
};

export default Promotion;
