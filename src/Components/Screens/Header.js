import classes from "../../styles/Header.module.css";
import logo from "../../Images/logo.png";
import Grid from "@material-ui/core/Grid";
import { AiOutlineRight } from "react-icons/ai";

const Header = ({
  customButton = { show: false, title: "Title for the button", action: null },
}) => {
  return (
    <div className={classes.headerBar}>
      <Grid container direction="row" alignItems="center">
        <Grid item>
          <div className={classes.logo}>
            <img alt="logo" src={logo} className={classes.logoImg} />
          </div>
        </Grid>
        {customButton.show ? (
          <div class={classes.customButtonRightContainer}>
            <div
              className={classes.trueCustButtonHeader}
              onClick={() => customButton.action}
            >
              Skip for now <AiOutlineRight />
            </div>
          </div>
        ) : null}
      </Grid>
    </div>
  );
};

export default Header;
