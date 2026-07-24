import { type APIRoute } from "astro";
import { getPostById, updatePost, deletePost } from "../../../db/Post.ts";
import { deleteFile } from "../../../db/Storage.ts";
import { getPostHogServer } from "../../../lib/posthog-server";
import { supabaseServer } from "../../../db/supabase.js";

export const GET: APIRoute = async (context) => {
	const supabase = supabaseServer(context);
	const id = context.params["id"] ? parseInt(context.params["id"], 10) : null;

	if (!id) {
		return new Response(JSON.stringify({ error: "Invalid ID" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	try {
		const post = await getPostById(supabase, id);
		return new Response(JSON.stringify(post), {
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
	const id = context.params["id"] ? parseInt(context.params["id"], 10) : null;
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

		const title = formData.get("title")?.toString() || "";
		const description = formData.get("description")?.toString() || "";
		const image = formData.get("image")?.toString() || "";
		const bodyText = formData.get("body")?.toString() || "";

		const tags = formData.getAll("tags[]").map((t) => t.toString());

		const url = title
			.toLowerCase()
			.trim()
			.replaceAll(/[\s\W\_]/gim, "-")
			.replaceAll(/[-]+/gim, "-");

		const values = {
			title,
			description,
			image,
			body: bodyText,
			tags,
			url,
		};

		const post = await getPostById(supabase, id);

		const updatedPost = await updatePost(supabase, id, values);

		if (!updatedPost.success) {
			throw new Error(updatedPost.message);
		}

		if (image !== post.image) {
			const imageFile = await deleteFile(
				supabase,
				"portfolio_bucket",
				post.image,
			);

			if (!imageFile.success) {
				throw new Error(imageFile.message);
			}
		}

		const posthog = getPostHogServer();
		posthog.capture({
			distinctId,
			event: "post_updated",
			properties: {
				$session_id: sessionId || undefined,
				post_id: id,
				post_title: title,
			},
		});

		return new Response(JSON.stringify(updatedPost), {
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
	const id = context.params["id"] ? parseInt(context.params["id"], 10) : null;
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
		const data = await deletePost(supabase, id);

		if (!data.success) {
			throw new Error(data.message);
		}

		const image = await deleteFile(
			supabase,
			"portfolio_bucket",
			data.data.image,
		);

		if (!image.success) {
			throw new Error(image.message);
		}

		const posthog = getPostHogServer();
		posthog.capture({
			distinctId,
			event: "post_deleted",
			properties: {
				$session_id: sessionId || undefined,
				post_id: id,
			},
		});

		return new Response(JSON.stringify(data), {
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
