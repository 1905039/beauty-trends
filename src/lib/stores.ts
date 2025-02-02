import { writable, type Writable } from 'svelte/store';
import type { CartProductObj, CategoryObj, OrderProductObj, ProductObj } from './containers';
import type { Dropdown, Toast } from 'bootstrap';

export const product_image_bucket: string = "https://ocplvcryfchlqsqfuciu.supabase.co/storage/v1/object/public/products-image/";
export const logged_in: Writable<boolean> = writable(false);
export const categories_store: Writable<Map<number, CategoryObj> | null> = writable(null);
export const category_dropdown_root_store: Writable<Dropdown | null> = writable(null);
export const user_id_store: Writable<number> = writable(0);
export const cart_items_store: Writable<CartProductObj[]> = writable([]);
export const order_confirm_toast_store: Writable<Toast | null> = writable(null);
export const phone_exist_toast_store: Writable<Toast | null> = writable(null);
export const password_updated_toast_store: Writable<Toast | null> = writable(null);
export const old_password_unmatch_toast_store: Writable<Toast | null> = writable(null);
export const stock_unavailable_toast_store: Writable<Toast | null> = writable(null);
export const product_unavailable_toast_store: Writable<Toast | null> = writable(null);
export const unauthorized_toast_store: Writable<Toast | null> = writable(null);
export const unknown_error_toast_store: Writable<Toast | null> = writable(null);
export const review_posted_toast_store: Writable<Toast | null> = writable(null);
export const copy_clipboard_toast_store: Writable<Toast | null> = writable(null);
export const dashboard_active_tab_store: Writable<string[]> = writable(["active", "", "", ""]);
export const pending_order_list_store: Writable<number[]> = writable([]);
export const complete_order_list_store: Writable<number[]> = writable([]);
export const order_products_store: Writable<OrderProductObj[]> = writable([]);
export const now_time: Writable<number> = writable(Date.now());