import { NextResponse } from "next/server";
import { getDirections } from "@/lib/ors";
import { routeRequestSchema, routeResponseSchema } from "@/schemas/itinerary";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Coordonnées invalides." }, { status: 400 });
  }

  const parse = routeRequestSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Coordonnées invalides." }, { status: 400 });
  }

  try {
    const result = await getDirections(parse.data.from, parse.data.to);
    return NextResponse.json(routeResponseSchema.parse(result));
  } catch {
    return NextResponse.json(
      { error: "Calcul d'itinéraire indisponible." },
      { status: 502 },
    );
  }
}
