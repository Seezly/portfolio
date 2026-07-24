import { defineMiddleware } from "astro:middleware";
import { getUser } from "./db/Auth";
import { supabaseServer } from "./db/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
	const supabase = supabaseServer(context);

	context.locals.supabase = supabase;

	const isAdminRoute = context.url.pathname.startsWith("/admin");
	const isLoginRoute = context.url.pathname.startsWith("/this-is-me-seth");
	const isAPIRoute = context.url.pathname.startsWith("/api");

	if (isAdminRoute || isLoginRoute || isAPIRoute) {
		const { success } = await getUser(supabase);

		if (isAdminRoute && !success) {
			return context.redirect("/");
		}

		if (isLoginRoute && success) {
			return context.redirect("/admin");
		}

		if (
			isAPIRoute &&
			!success &&
			!context.url.pathname.includes("sign-in")
		) {
			return new Response(
				JSON.stringify({
					error: "Unauthorized: Invalid or expired session.",
				}),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	}

	return next();
});
