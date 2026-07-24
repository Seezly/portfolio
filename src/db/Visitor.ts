import { supabase } from "./supabase.js";

interface Visit {
	ip_address: string;
	user_agent: string;
	country: string;
	city: string;
	region: string;
	os: string;
	browser: string;
	language: string;
	device: string;
	screen_resolution: string;
	referrer: string;
	utm_source: string;
	utm_medium: string;
	utm_campaign: string;
	loading_time: number;
}

export const getVisits = async (
	limit?: number,
	contains?: { [key: string]: string },
	where?: { [key: string]: string },
) => {
	let query = supabase.from("visitors").select();

	if (contains) {
		query = query?.eq(contains?.table, contains?.value);
	}

	if (where) {
		query = query?.eq(where?.table, where?.value);
	}

	if (limit) {
		query = query?.limit(limit);
	}

	const visitors = await query;

	return visitors ?? "Visitors are yet to be found...";
};

export const createVisit = async (values: Visit) => {
	const { data, error } = await supabase
		.from("visitors")
		.insert(values)
		.select()
		.single();

	if (error) {
		return {
			success: false,
			message: `Houston, we have a problem: ${error.message}. What should we do now?`,
		};
	}

	return { success: true, data };
};
