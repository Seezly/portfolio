import { supabase } from "./supabase.js";

type EventType =
	| "form:submit_contact"
	| "link:click_project"
	| "link:click_source_code"
	| "link:click_social"
	| "file:download_cv"
	| "page:view"
	| `section:${string}`;

interface Event {
	visit_id: number;
	event_type: EventType;
	target_url: string;
	path: string;
}

export const createEvent = async (values: Event) => {
	const { data, error } = await supabase
		.from("events_visit")
		.insert(values)
		.select();

	if (error) {
		return {
			success: false,
			message: `Houston, we have a problem: ${error.message}. What should we do now?`,
		};
	}

	return { success: true, data };
};
