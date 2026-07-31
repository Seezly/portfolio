import { type SupabaseClient } from "@supabase/supabase-js";

interface Post {
	image: string;
	title: string;
	description: string;
	body: string;
	tags?: string[];
	references?: string[];
}

interface QueryFilter {
	column: string;
	value: string;
}

const PAGE_SIZE: number = 10;

export const getPosts = async (
	supabase: SupabaseClient,
	page: number = 1,
	limit?: number | null,
	contains?: string | null,
	where?: QueryFilter | null,
) => {
	let query = supabase.from("posts").select("*", { count: "exact" });

	if (contains) {
		query = query?.or(
			`title.ilike.%${contains}%,tags.contains.%${contains}%`,
		);
	}

	if (where) {
		query = query?.eq(where?.column, where?.value);
	}

	const posts = await query.order("created_at", { ascending: false });

	if (limit) {
		query = query?.limit(limit);
	} else if (page) {
		const from = (page - 1) * PAGE_SIZE;
		const to = from + PAGE_SIZE - 1;

		query = query?.range(from, to);
	}

	if (posts.error) {
		return { success: false, message: posts.error.message };
	}

	const totalPages: number = Math.ceil(posts?.count) / PAGE_SIZE || 0;

	// return posts ?? "History is yet to be written...";
	return {
		success: true,
		data: posts.data ?? [],
		count: posts.count ?? 0,
		totalPages,
	};
};

export const getPostById = async (supabase: SupabaseClient, id: number) => {
	const { data: post } = await supabase
		.from("posts")
		.select()
		.eq("id", id)
		.single();

	return post ?? "Hmm, I think you picked the wrong one.";
};

export const createPost = async (supabase: SupabaseClient, values: Post) => {
	const { data, error } = await supabase
		.from("posts")
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

export const updatePost = async (
	supabase: SupabaseClient,
	id: number,
	values: Post,
) => {
	const { data, error } = await supabase
		.from("posts")
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

export const deletePost = async (supabase: SupabaseClient, id: number) => {
	const { data, error } = await supabase
		.from("posts")
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
