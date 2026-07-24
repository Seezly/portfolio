import { type APIRoute } from "astro";
import { uploadFile } from "../../../db/Storage";
import { supabaseServer } from "../../../db/supabase";

export const POST: APIRoute = async (context) => {
	const supabase = supabaseServer(context);
	const formData = await context.request.formData();

	const dir = formData.get("dir") as string;
	const file = formData.get("file") as File;

	try {
		const data = await uploadFile(supabase, "portfolio_bucket", dir, file);

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
