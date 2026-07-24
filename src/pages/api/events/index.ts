import { type APIRoute } from "astro";
import { createEvent } from "../../../db/Event";
import { getPostHogServer } from "../../../lib/posthog-server";

export const POST: APIRoute = async ({ request }) => {
	const body = await request.json();
	const distinctId =
		request.headers.get("X-PostHog-Distinct-Id") || "unknown";
	const sessionId = request.headers.get("X-PostHog-Session-Id");

	try {
		const event = await createEvent(body);

		const posthog = getPostHogServer();
		posthog.capture({
			distinctId,
			event: "event_created",
			properties: {
				$session_id: sessionId || undefined,
				event_type: body.event_type,
			},
		});

		return new Response(JSON.stringify(event), {
			status: 201,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		const posthog = getPostHogServer();
		posthog.captureException(error as Error, distinctId);
		return new Response(
			JSON.stringify({ error: "Internal Server Error" }),
			{
				status: 500,
			},
		);
	}
};
