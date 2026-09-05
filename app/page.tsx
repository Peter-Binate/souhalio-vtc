import type { Metadata } from "next";
import { HeroItinerary } from "@/components/sections/hero-itinerary";
import { AirportPricing } from "@/components/sections/airport-pricing";
import { DirectBooking } from "@/components/sections/direct-booking";
import { Services } from "@/components/sections/services";
import { Zones } from "@/components/sections/zones";
import { About } from "@/components/sections/about";
import { Reviews } from "@/components/sections/reviews";
import { Contact } from "@/components/sections/contact";

// Seule page du site qui n'avait pas de canonical (toutes les pages /vtc/** en déclarent
// une). Posée ici et non dans le layout : une canonical au niveau layout serait héritée par
// la page 404, qui pointerait alors vers l'accueil.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

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
