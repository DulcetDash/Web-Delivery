import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { UpdateTripsData } from "../../Redux/HomeActionsCreators";
import classes from "./Header.module.css";
import logodd from "../../Assets/logo_white.png";
import { AiOutlineUser, AiOutlineCaretDown } from "react-icons/ai";
import Modal from "react-modal";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    //marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    zIndex: 10000,
    backgroundColor: "red",
  },
};

class HeaderStd extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    let subtitle;

    return (
      <div className={classes.mainContainer}>
        <div className={classes.logoContainer}>
          <img alt="logo" src={logodd} className={classes.trueLogo} />
        </div>
        <div></div>
        {/* <div className={classes.rightContainer}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <div
              style={{
                border: "1px solid #fff",
                width: 30,
                height: 30,
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
              }}
            >
              <AiOutlineUser
                style={{ width: 20, height: 20, color: "#0e8491" }}
              />
            </div>
            <AiOutlineCaretDown
              style={{ color: "#fff", width: 10, height: 10, marginLeft: 10 }}
            />
          </div>
        </div> */}
        {/* Modal */}
        <Modal
          isOpen={false}
          onAfterOpen={() => {}}
          onRequestClose={() => {}}
          style={customStyles}
          contentLabel="Example Modal">
          <h2>Starter package</h2>
          <div></div>
          <form>
            <input />
            <button>tab navigation</button>
            <button>stays</button>
            <button>inside</button>
            <button>the modal</button>
          </form>
        </Modal>
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
      UpdateTripsData,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(HeaderStd);
