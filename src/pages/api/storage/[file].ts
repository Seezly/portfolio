import { type APIRoute } from "astro";
import { downloadFile, deleteFile } from "../../../db/Storage";
import { supabaseServer } from "../../../db/supabase";

export const POST: APIRoute = async (context) => {
	const { path } = await context.request.json();
	const supabase = supabaseServer(context);

	try {
		const data = await downloadFile(supabase, "portfolio_bucket", path);

		return new Response(JSON.stringify(data), {
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

export const DELETE: APIRoute = async (context) => {
	const { path } = await context.request.json();
	const supabase = supabaseServer(context);

	try {
		const data = await deleteFile(supabase, "portfolio_bucket", path);

		return new Response(JSON.stringify(data), {
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
