/**
 * Internal auth singleton — updated exclusively by AuthContext.
 * Allows api.js to read the current user without touching sessionStorage.
 *
 * Do NOT import this module in UI components — use useAuth() instead.
 */

let _user = null;

export const setCurrentUser = (user) => { _user = user; };
export const getCurrentUser = ()     => _user;
