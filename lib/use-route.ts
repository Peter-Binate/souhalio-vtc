"use client";

import { useMutation } from "@tanstack/react-query";
import { internalApi } from "@/lib/ky";
import { routeResponseSchema, type RouteResponse, type Coord } from "@/schemas/itinerary";

export function useRoute() {
  return useMutation<RouteResponse, Error, { from: Coord; to: Coord }>({
    mutationFn: async (vars) => {
      const json = await internalApi.post("api/route", { json: vars }).json();
      return routeResponseSchema.parse(json);
    },
  });
}
