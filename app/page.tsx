import { HeroItinerary } from "@/components/sections/hero-itinerary";
import { AirportPricing } from "@/components/sections/airport-pricing";
import { DirectBooking } from "@/components/sections/direct-booking";
import { Services } from "@/components/sections/services";
import { Zones } from "@/components/sections/zones";
import { About } from "@/components/sections/about";
import { Reviews } from "@/components/sections/reviews";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <HeroItinerary />
      <AirportPricing />
      <DirectBooking />
      <Services />
      <Zones />
      <About />
      <Reviews />
      <Contact />
    </>
  );
}
