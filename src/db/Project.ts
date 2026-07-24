import { type SupabaseClient } from "@supabase/supabase-js";

type Status = "In Progress" | "Completed";

interface Project {
	image: string;
	title: string;
	description: string;
	body: string;
	client: string;
	location: string;
	status: Status;
	purpose: string;
	technologies: string[];
	url: string;
	live_url?: string;
	github_repo?: string;
}

interface QueryFilter {
	column: string;
	value: string;
}

export const getProjects = async (
	supabase: SupabaseClient,
	limit?: number,
	contains?: QueryFilter | null,
	where?: QueryFilter | null,
) => {
	let query = supabase.from("projects").select();

	if (contains) {
		query = query?.eq(contains?.column, contains?.value);
	}

	if (where) {
		query = query?.eq(where?.column, where?.value);
	}

	if (limit) {
		query = query?.limit(limit);
	}

	const projects = await query;

	return projects.data ?? "Software is yet to be coded...";
};

export const getProjectById = async (supabase: SupabaseClient, id: number) => {
	const { data: project } = await supabase
		.from("projects")
		.select()
		.eq("id", id)
		.single();

	return project ?? "Hmm, I think you picked the wrong one.";
};

export const createProject = async (
	supabase: SupabaseClient,
	values: Project,
) => {
	const { data, error } = await supabase
		.from("projects")
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

export const updateProject = async (
	supabase: SupabaseClient,
	id: number,
	values: Project,
) => {
	const { data, error } = await supabase
		.from("projects")
		.update(values)
		.eq("id", id)
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

export const deleteProject = async (supabase: SupabaseClient, id: number) => {
	const { data, error } = await supabase
		.from("projects")
		.delete()
		.eq("id", id)
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
