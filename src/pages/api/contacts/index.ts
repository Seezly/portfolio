import { type APIRoute } from "astro";
import { getContacts, createContact, saveMessage } from "../../../db/Contact";
import { getPostHogServer } from "../../../lib/posthog-server";
import { supabaseServer } from "../../../db/supabase";

export const GET: APIRoute = async (context) => {
	const supabase = supabaseServer(context);

	try {
		const contacts = await getContacts(supabase);

		if (contacts) {
			return new Response(JSON.stringify(contacts), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}
	} catch (error) {
		return new Response(
			JSON.stringify({ error: "Internal Server Error: " + error }),
			{
				status: 500,
			},
		);
	}
};

export const POST: APIRoute = async (context) => {
	const supabase = supabaseServer(context);

	const formData = await context.request.formData();
	const distinctId =
		context.request.headers.get("X-PostHog-Distinct-Id") || "unknown";
	const sessionId = context.request.headers.get("X-PostHog-Session-Id");

	const plainObject = Object.fromEntries(formData.entries());

	const body = JSON.parse(JSON.stringify(plainObject));

	const { name, email, referrer, message: messageText } = body;

	try {
		const contact = await createContact(supabase, {
			name,
			email,
			referrer,
		});

		const id = contact?.data?.id;

		const message = await saveMessage(supabase, {
			id,
			message: messageText,
		});

		const posthog = getPostHogServer();
		posthog.capture({
			distinctId,
			event: "contact_created",
			properties: {
				$session_id: sessionId || undefined,
				contact_email: email,
			},
		});

		return new Response(JSON.stringify({ contact, message }), {
			status: 201,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		const posthog = getPostHogServer();
		posthog.captureException(error as Error, distinctId);
		return new Response(
			JSON.stringify({ error: "Internal Server Error: " + error }),
			{
				status: 500,
			},
		);
	}
};
