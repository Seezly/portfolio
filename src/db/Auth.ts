import type { SupabaseClient } from "@supabase/supabase-js";

export const signIn = async (
	supabase: SupabaseClient,
	email: string,
	password: string,
) => {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return {
			success: false,

			message: `Houston, we have a problem: ${error.message}. What should we do now?`,
		};
	}

	return { success: true, data };
};

export const getUser = async (supabase: SupabaseClient) => {
	const { data, error } = await supabase.auth.getUser();

	if (error) {
		return {
			success: false,

			message: `Houston, we have a problem: ${error.message}. What should we do now?`,
		};
	}

	return { success: true, data };
};

export const logout = async (supabase: SupabaseClient) => {
	const { error } = await supabase.auth.signOut();

	if (error) {
		return {
			success: false,

			message: `Houston, we have a problem: ${error.message}. What should we do now?`,
		};
	}

	return { success: true };
};
