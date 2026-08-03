import {
  GiSunrise,
  GiCookingPot,
  GiNoodles,
  GiHotSpices,
  GiFriedFish,
  GiBowlOfRice,
  GiBreadSlice,
  GiHotSurface,
  GiCalendar,
  GiStarFormation,
  GiCoffeeCup,
  GiIceCreamCone,
  GiIceCreamScoop,
} from "react-icons/gi";
import { LuUtensilsCrossed } from "react-icons/lu";
import { PiBowlSteamFill } from "react-icons/pi";

const ICONS = {
  sunrise: GiSunrise,
  dosa: GiCookingPot,
  soup: PiBowlSteamFill,
  starter: LuUtensilsCrossed,
  chinese: GiNoodles,
  curry: GiHotSpices,
  bread: GiBreadSlice,
  biryani: GiBowlOfRice,
  roast: GiHotSurface,
  calendar: GiCalendar,
  star: GiStarFormation,
  cup: GiCoffeeCup,
  icecream: GiIceCreamCone,
  stick: GiIceCreamCone,
  scoop: GiIceCreamScoop,
  seafood: GiFriedFish,
};

export function CategoryIcon({ icon, className, ...rest }) {
  const Cmp = ICONS[icon] || LuUtensilsCrossed;
  return <Cmp className={className} {...rest} />;
}
