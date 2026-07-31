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

const PAGE_SIZE: number = 10;

export const getProjects = async (
	supabase: SupabaseClient,
	page: number = 1,
	limit?: number | null,
	contains?: string | null,
	where?: QueryFilter | null,
) => {
	let query = supabase.from("projects").select("*", { count: "exact" });

	if (contains) {
		query = query?.or(
			`title.ilike.%${contains}%,technologies.contains.%${contains}%`,
		);
	}

	if (where) {
		query = query?.eq(where?.column, where?.value);
	}

	if (limit) {
		query = query?.limit(limit);
	} else if (page) {
		const from = (page - 1) * PAGE_SIZE;
		const to = from + PAGE_SIZE - 1;

		query = query?.range(from, to);
	}

	const projects = await query.order("created_at", { ascending: false });

	if (projects.error) {
		return { success: false, message: projects.error.message };
	}

	const totalPages: number = Math.ceil(projects?.count / PAGE_SIZE) || 0;

	// return projects.data ?? "Software is yet to be coded...";
	return {
		success: true,
		data: projects.data ?? [],
		count: projects.count ?? 0,
		totalPages,
	};
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
