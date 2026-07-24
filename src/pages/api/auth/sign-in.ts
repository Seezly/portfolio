import { type APIRoute } from "astro";
import { signIn } from "../../../db/Auth.ts";
import { supabaseServer } from "../../../db/supabase.js";
import { getPostHogServer } from "../../../lib/posthog-server";

export const POST: APIRoute = async (context) => {
	const { email, password } = await context.request.json();
	const sessionId = context.request.headers.get("X-PostHog-Session-Id");
	const supabase = supabaseServer(context);

	try {
		const { success, data } = await signIn(supabase, email, password);

		if (!success) {
			return new Response(JSON.stringify({ data }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const posthog = getPostHogServer();
		posthog.capture({
			distinctId: email,
			event: "admin_signed_in",
			properties: {
				$session_id: sessionId || undefined,
				source: "api",
			},
		});
		posthog.identify({
			distinctId: email,
			properties: { email },
		});

		return new Response(JSON.stringify({ data }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		const posthog = getPostHogServer();
		posthog.captureException(error as Error, email || "unknown");
		return new Response(JSON.stringify({ error: "Invalid JSON" + error }), {
			status: 400,
		});
	}
};
