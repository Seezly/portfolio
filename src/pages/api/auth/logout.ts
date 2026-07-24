import { type APIRoute } from "astro";
import { logout } from "../../../db/Auth.ts";
import { supabaseServer } from "../../../db/supabase.js";
import { getPostHogServer } from "../../../lib/posthog-server";

export const POST: APIRoute = async (context) => {
	const distinctId =
		context.request.headers.get("X-PostHog-Distinct-Id") || "unknown";
	const sessionId = context.request.headers.get("X-PostHog-Session-Id");
	const supabase = supabaseServer(context);

	try {
		const result = await logout(supabase);

		if (!result.success) {
			return new Response(JSON.stringify({ result }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const posthog = getPostHogServer();
		posthog.capture({
			distinctId,
			event: "admin_signed_out",
			properties: {
				$session_id: sessionId || undefined,
				source: "api",
			},
		});

		return new Response(JSON.stringify({ result }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		const posthog = getPostHogServer();
		posthog.captureException(error as Error, distinctId);
		return new Response(JSON.stringify({ error: "Invalid JSON" }), {
			status: 400,
		});
	}
};
