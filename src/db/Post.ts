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

export const getPosts = async (
	supabase: SupabaseClient,
	limit?: number,
	contains?: QueryFilter | null,
	where?: QueryFilter | null,
) => {
	let query = supabase.from("posts").select();

	if (contains) {
		query = query?.ilike(contains?.column, contains?.value);
	}

	if (where) {
		query = query?.eq(where?.column, where?.value);
	}

	if (limit) {
		query = query?.limit(limit);
	}

	const posts = await query;

	return posts.data ?? "History is yet to be written...";
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
