import { type APIRoute } from "astro";
import {
	getProjectById,
	updateProject,
	deleteProject,
} from "../../../db/Project.ts";
import { deleteFile } from "../../../db/Storage.ts";
import { getPostHogServer } from "../../../lib/posthog-server";
import { supabaseServer } from "../../../db/supabase.js";

type Status = "In Progress" | "Completed";

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
		const project = await getProjectById(supabase, id);
		return new Response(JSON.stringify(project), {
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
		const client = formData.get("client")?.toString() || "";
		const location = formData.get("location")?.toString() || "";
		const _status = formData.get("status")?.toString();
		const status: Status =
			_status === "Completed" ? "Completed" : "In Progress";
		const purpose = formData.get("purpose")?.toString() || "";
		const live_url = formData.get("live_url")?.toString() || "";
		const github_repo = formData.get("github_repo")?.toString() || "";

		const technologies = formData
			.getAll("technologies[]")
			.map((t) => t.toString());

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
			technologies,
			url,
			client,
			location,
			status,
			purpose,
			live_url,
			github_repo,
		};

		const project = await getProjectById(supabase, id);

		const updatedProject = await updateProject(supabase, id, values);

		if (!updatedProject.success) {
			throw new Error(updatedProject.message);
		}

		if (image !== project.image) {
			const imageFile = await deleteFile(
				supabase,
				"portfolio_bucket",
				project.image,
			);

			if (!imageFile.success) {
				throw new Error(imageFile.message);
			}
		}

		const posthog = getPostHogServer();
		posthog.capture({
			distinctId,
			event: "project_updated",
			properties: {
				$session_id: sessionId || undefined,
				project_id: id,
				project_title: title,
			},
		});

		return new Response(JSON.stringify(updatedProject), {
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
		const data = await deleteProject(supabase, id);

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
			event: "project_deleted",
			properties: {
				$session_id: sessionId || undefined,
				project_id: id,
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
