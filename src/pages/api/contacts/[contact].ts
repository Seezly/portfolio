import { type APIRoute } from "astro";
import {
	getContactById,
	updateContact,
	deleteContact,
} from "../../../db/Contact";
import { getPostHogServer } from "../../../lib/posthog-server";
import { supabaseServer } from "../../../db/supabase";

export const GET: APIRoute = async (context) => {
	const supabase = supabaseServer(context);

	const id = context.params["contact"]
		? parseInt(context.params["contact"], 10)
		: null;

	if (!id) {
		return new Response(JSON.stringify({ error: "Invalid ID" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	try {
		const contact = await getContactById(supabase, id);
		return new Response(JSON.stringify(contact), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		return new Response(
			JSON.stringify({ error: "Internal Server Error: " + error }),
			{
				status: 500,
			},
		);
	}
};

export const PUT: APIRoute = async (context) => {
	const supabase = supabaseServer(context);

	const id = context.params["contact"]
		? parseInt(context.params["contact"], 10)
		: null;
	const distinctId =
		context.request.headers.get("X-PostHog-Distinct-Id") || "unknown";
	const sessionId = context.request.headers.get("X-PostHog-Session-Id");

	if (!id) {
		return new Response(JSON.stringify({ error: "Invalid ID" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	try {
		const formData = await context.request.formData();

		const plainObject = Object.fromEntries(formData.entries());

		const body = JSON.parse(JSON.stringify(plainObject));
		const { name, email, referrer, message } = body;

		const updatedContact = await updateContact(supabase, id, {
			name,
			email,
			referrer,
		});

		const posthog = getPostHogServer();
		posthog.capture({
			distinctId,
			event: "contact_updated",
			properties: {
				$session_id: sessionId || undefined,
				contact_id: id,
				contact_email: email,
			},
		});

		return new Response(JSON.stringify(updatedContact), {
			status: 200,
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

export const DELETE: APIRoute = async (context) => {
	const supabase = supabaseServer(context);

	const id = context.params["contact"]
		? parseInt(context.params["contact"], 10)
		: null;
	const distinctId =
		context.request.headers.get("X-PostHog-Distinct-Id") || "unknown";
	const sessionId = context.request.headers.get("X-PostHog-Session-Id");

	if (!id) {
		return new Response(JSON.stringify({ error: "Invalid ID" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	try {
		await deleteContact(supabase, id);

		const posthog = getPostHogServer();
		posthog.capture({
			distinctId,
			event: "contact_deleted",
			properties: {
				$session_id: sessionId || undefined,
				contact_id: id,
			},
		});

		return new Response(
			JSON.stringify({ message: "Contact deleted successfully" }),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
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
