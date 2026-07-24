import { type SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface Contact {
	name: string;
	email: string;
	referrer: string;
}

interface UserMessage {
	id: number;
	message: string;
}

interface QueryFilter {
	column: string;
	value: string;
}

export const getContacts = async (
	supabase: SupabaseClient,
	limit?: number,
	contains?: QueryFilter | null,
	where?: QueryFilter | null,
) => {
	let query = supabase.from("contacts").select();

	if (contains) {
		query = query?.eq(contains?.column, contains?.value);
	}

	if (where) {
		query = query?.eq(where?.column, where?.value);
	}

	if (limit) {
		query = query?.limit(limit);
	}

	const contacts = await query;

	return (
		contacts.data ?? "Contacts not found... Time to make some new friends!"
	);
};

export const getContactById = async (supabase: SupabaseClient, id: number) => {
	const { data: contact } = await supabase
		.from("contacts")
		.select()
		.eq("id", id)
		.single();

	return (
		contact ?? "Contact not found... Are you sure they are friend material?"
	);
};

export const createContact = async (
	supabase: SupabaseClient,
	values: Contact,
) => {
	const { data, error } = await supabase
		.from("contacts")
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

export const updateContact = async (
	supabase: SupabaseClient,
	id: number,
	values: Contact,
) => {
	const { data, error } = await supabase
		.from("contacts")
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

export const deleteContact = async (supabase: SupabaseClient, id: number) => {
	const { data, error } = await supabase
		.from("contacts")
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

export const saveMessage = async (
	supabase: SupabaseClient,
	values: UserMessage,
) => {
	const { data, error } = await supabase
		.from("user_messages")
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
