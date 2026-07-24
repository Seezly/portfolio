import { createClient } from "@supabase/supabase-js";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseServer = (Astro) =>
	createServerClient(supabaseUrl, supabaseKey, {
		cookies: {
			getAll() {
				const cookieHeader = Astro.request.headers.get("Cookie") ?? "";
				return parseCookieHeader(cookieHeader);
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) =>
					Astro.cookies.set(name, value, {
						path: "/",
						...options,
					}),
				);
			},
		},
	});
