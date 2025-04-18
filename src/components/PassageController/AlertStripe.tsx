import { TriangleAlert } from "lucide-react";
import { Fragment } from "react";

const AlertStripe = () => (
  <div className="bg-[repeating-linear-gradient(135deg,_#ffe501,_#ffe501_40px,_black_40px,_black_80px)] w-full h-24 relative">
    <div className="flex bg-black absolute inset-0 border-y-2 border-[#ffe501] m-auto h-16">
      <div className="relative flex items-center text-[#ffe501]">
        {["animate-marquee", "animate-marquee2"].map((animation, idx) => (
          <div
            key={idx}
            className={`${animation} absolute whitespace-nowrap flex items-center`}
          >
            {[...Array(2)].map((_, i) => (
              <Fragment key={i}>
                <TriangleAlert className="text-2xl mx-8" />
                <span className="text-xl font-bold">
                  FOR EMERGENCY: PLEASE EVACUATE HERE & FOLLOW SAFETY PROTOCOLS!
                </span>
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AlertStripe;
