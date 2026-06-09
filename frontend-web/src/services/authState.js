// Internal auth singleton — updated exclusively by AuthContext.
// Do NOT import in UI components — use useAuth() instead.

let _user = null;
let _onUnauthorized = null;

export const setCurrentUser      = (user) => { _user = user; };
export const getCurrentUser      = ()     => _user;

// Called by AuthContext on mount to register the logout callback.
// Called by api.js response interceptor when a 401 is received.
// Avoids circular dependency: api.js → authState ← AuthContext.
export const setOnUnauthorized   = (fn)   => { _onUnauthorized = fn; };
export const triggerUnauthorized = ()     => { _onUnauthorized?.(); };
