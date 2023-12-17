import { MdOutlineArrowForward } from "react-icons/md";
import { BASIC_RADIUS, CORAL_RED, GENERIC_GRAY } from "../Colors";
import classes from "./Promotion.module.css";

const Promotion = () => {
  return (
    <div
      onClick={() => (window.location.href = "/signup")}
      className={classes.promotionContainer}
      style={{
        fontWeight: 500,
        fontSize: "1.1em",
        marginBottom: "2em",
        border: `1px solid ${GENERIC_GRAY}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 400,
        height: 50,
        margin: "auto",
        borderRadius: BASIC_RADIUS * 7,
        zIndex: 1000,
      }}>
      Get{" "}
      <strong style={{ marginLeft: 5, marginRight: 5 }}>
        <span style={{ color: CORAL_RED, marginRight: 5 }}>1500</span>
        credits
      </strong>{" "}
      for just signing up <MdOutlineArrowForward style={{ marginLeft: 15 }} />
    </div>
  );
};

export default Promotion;
