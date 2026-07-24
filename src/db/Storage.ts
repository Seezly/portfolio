import { type SupabaseClient } from "@supabase/supabase-js";

export const getFile = (
	supabase: SupabaseClient,
	bucket: string,
	path: string,
) => {
	const { data } = supabase.storage.from(bucket).getPublicUrl(path);

	return data.publicUrl ?? "Oops, I think I've misplaced the file...";
};

export const uploadFile = async (
	supabase: SupabaseClient,
	bucket: string,
	dir: string,
	file: File,
) => {
	const { data, error } = await supabase.storage
		.from(bucket)
		.upload(dir, file);

	if (error) {
		return {
			success: false,
			message: `Houston, we have a problem: ${error.message}. What should we do now?`,
		};
	}

	return { success: true, data };
};

export const downloadFile = async (
	supabase: SupabaseClient,
	bucket: string,
	path: string,
) => {
	const { data, error } = await supabase.storage.from(bucket).download(path);

	if (error) {
		return {
			success: false,
			message: `Houston, we have a problem: ${error.message}. What should we do now?`,
		};
	}

	return { success: true, data };
};

export const deleteFile = async (
	supabase: SupabaseClient,
	bucket: string,
	path: string,
) => {
	const { data, error } = await supabase.storage.from(bucket).remove([path]);

	if (error) {
		return {
			success: false,
			message: `Houston, we have a problem: ${error.message}. What should we do now?`,
		};
	}

	return { success: true, data };
};
