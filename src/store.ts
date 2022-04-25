import { browser } from "$app/env";
import type ScopeSetup from "$lib/scope-box/ScopeSetup";
import { writable } from "svelte/store";

const storedScopeSetup = JSON.parse(browser && localStorage.getItem("scope-setup") || "{}");

const currentScopeSetup = storedScopeSetup as ScopeSetup | null;

export const scopeSetup = writable<ScopeSetup | null>(currentScopeSetup);

scopeSetup.subscribe(value => {
    if (browser) { localStorage.setItem("scope-setup", JSON.stringify(value)); }
});