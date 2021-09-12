import classes from "../../styles/Header.module.css";
import logo from "../../Images/logo.png";
import Grid from "@material-ui/core/Grid";

const Header = () => {
  return (
    <div className={classes.headerBar}>
      <Grid container direction="row" alignItems="center">
        <Grid item>
          <div className={classes.logo}>
            <img alt="logo" src={logo} className={classes.logoImg} />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default Header;
