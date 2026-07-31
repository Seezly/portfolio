import { type APIRoute } from "astro";
import { getContacts, createContact, saveMessage } from "../../../db/Contact";
import { getPostHogServer } from "../../../lib/posthog-server";
import { supabaseServer } from "../../../db/supabase";

export const GET: APIRoute = async (context) => {
	const supabase = supabaseServer(context);
	const url = new URL(context.request.url);

	const pageParam = url.searchParams.get("page");
	const page = pageParam ? parseInt(pageParam, 10) : 1;

	const limitParam = url.searchParams.get("limit");
	const limit = limitParam ? parseInt(limitParam, 10) : 10;

	const containsCol = url.searchParams.get("contains_col");
	const containsVal = url.searchParams.get("contains_val");
	const contains =
		containsCol && containsVal
			? { column: containsCol, value: containsVal }
			: null;

	const whereCol = url.searchParams.get("where_col");
	const whereVal = url.searchParams.get("where_val");

	const where =
		whereCol && whereVal ? { column: whereCol, value: whereVal } : null;

	if (
		!whereCol?.includes("created_at") ||
		!whereCol?.includes("updated_at") ||
		!containsCol?.includes("title") ||
		!containsCol?.includes("description") ||
		!containsCol?.includes("tags")
	) {
		return new Response(
			JSON.stringify({ error: "What are you trying to do?" }),
			{
				status: 403,
			},
		);
	}

	try {
		const contacts = await getContacts(
			supabase,
			page,
			limit,
			contains,
			where,
		);

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
