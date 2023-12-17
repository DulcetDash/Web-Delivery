import { TailSpin } from "react-loader-spinner";
import { PRIMARY } from "../Colors";

const Loader = ({ size = 60, color = PRIMARY, strokeWidth = 2 }) => {
  return (
    <TailSpin
      height={size}
      width={size}
      color={color}
      strokeWidth={strokeWidth}
      radius="1"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
    />
  );
};

export default Loader;
