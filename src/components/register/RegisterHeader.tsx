
import React from "react";
import M1ssionText from "../logo/M1ssionText";

const RegisterHeader = () => {
  return (
    <div className="text-center mb-8 relative">
      <div className="flex justify-center mb-4">
        <M1ssionText />
      </div>
      <p className="text-white/70 mb-2">Crea il tuo account</p>
      <div className="line-glow"></div>
      <div className="mission-motto mt-2">IT IS POSSIBLE</div>
    </div>
  );
};

export default RegisterHeader;
