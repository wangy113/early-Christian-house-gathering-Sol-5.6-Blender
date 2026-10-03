// Browser-side asset paths. Content records hold site-relative paths; the
// Vite base (./ for project-subpath hosting) is prefixed here only.

export const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`
