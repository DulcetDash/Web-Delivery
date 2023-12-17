import React, { useState } from "react";
import { Image, Skeleton } from "antd";
import { BASIC_RADIUS } from "./Colors";

const LoadableImage = ({ src, width, ...rest }) => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && (
        <Skeleton.Image
          active
          style={{ width, height: width, borderRadius: BASIC_RADIUS }}
        />
      )}
      <Image
        {...rest}
        src={src}
        width={width}
        height={width}
        onLoad={() => setLoading(false)}
        style={loading ? { display: "none" } : { borderRadius: BASIC_RADIUS }}
      />
    </>
  );
};

export default LoadableImage;
