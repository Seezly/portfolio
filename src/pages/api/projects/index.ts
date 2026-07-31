import { type APIRoute } from "astro";
import { getProjects, createProject } from "../../../db/Project.ts";
import { getPostHogServer } from "../../../lib/posthog-server";
import { supabaseServer } from "../../../db/supabase.js";

type Status = "In Progress" | "Completed";

export const GET: APIRoute = async (context) => {
	const supabase = supabaseServer(context);
	const url = new URL(context.request.url);

	const pageParam = url.searchParams.get("page");
	const page = pageParam ? parseInt(pageParam, 10) : 1;

	const limitParam = url.searchParams.get("limit");
	const limit = limitParam ? parseInt(limitParam, 10) : 10;

	const contains = url.searchParams.get("contains");

	const whereCol = url.searchParams.get("where_col");
	const whereVal = url.searchParams.get("where_val");
	const where =
		whereCol && whereVal ? { column: whereCol, value: whereVal } : null;

	if (
		!whereCol?.includes("created_at") ||
		!whereCol?.includes("updated_at")
	) {
		return new Response(
			JSON.stringify({ error: "What are you trying to do?" }),
			{
				status: 403,
			},
		);
	}

	try {
		const projects = await getProjects(
			supabase,
			page,
			limit,
			contains,
			where,
		);

		if (projects) {
			return new Response(JSON.stringify(projects), {
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

	try {
		const project = await createProject(supabase, values);

		const posthog = getPostHogServer();
		posthog.capture({
			distinctId,
			event: "project_created",
			properties: {
				$session_id: sessionId || undefined,
				project_title: title,
			},
		});

		return new Response(JSON.stringify(project), {
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
