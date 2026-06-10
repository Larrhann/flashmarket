import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isSignupRoute = path === "/onboarding" || path === "/onboarding/otp";
  const isLocationRoute = path === "/onboarding/location";
  const isPublicAsset =
    path.startsWith("/_next") ||
    path.startsWith("/manifest") ||
    path.startsWith("/icons") ||
    path.startsWith("/favicon");

  if (isPublicAsset) return response;

  if (!user) {
    if (!isSignupRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Utilisateur connecté : vérifie si le Hub Local (ville/quartier) est défini
  const { data: profile } = await supabase
    .from("profiles")
    .select("quartier_id")
    .eq("id", user.id)
    .maybeSingle();

  const hasLocation = !!profile?.quartier_id;

  if (isSignupRoute) {
    const url = request.nextUrl.clone();
    url.pathname = hasLocation ? "/" : "/onboarding/location";
    return NextResponse.redirect(url);
  }

  if (!hasLocation && !isLocationRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding/location";
    return NextResponse.redirect(url);
  }

  if (hasLocation && isLocationRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}
