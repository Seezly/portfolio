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

const PAGE_SIZE: number = 10;

export const getContacts = async (
	supabase: SupabaseClient,
	page: number = 1,
	limit?: number | null,
	contains?: string | null,
	where?: QueryFilter | null,
) => {
	let query = supabase.from("contacts").select("*", { count: "exact" });

	if (contains) {
		query = query?.or(`name.ilike.%${contains}%,email.ilike.%${contains}%`);
	}

	if (where) {
		query = query?.eq(where?.column, where?.value);
	}

	const contacts = await query.order("created_at", { ascending: false });

	if (limit) {
		query = query?.limit(limit);
	} else if (page) {
		const from = (page - 1) * PAGE_SIZE;
		const to = from + PAGE_SIZE - 1;

		query = query?.range(from, to);
	}

	if (contacts.error) {
		return { success: false, message: contacts.error.message };
	}

	const totalPages: number = Math.ceil(contacts?.count / PAGE_SIZE) || 0;

	// contacts.data ?? "Contacts not found... Time to make some new friends!"
	return {
		success: true,
		data: { contacts: contacts.data ?? [], count: contacts.count ?? 0 },
		totalPages,
	};
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
