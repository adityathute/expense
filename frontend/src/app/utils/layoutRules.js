export const PUBLIC_PAGES = ["/", "/login"];

export function shouldHideLayout(path, isLoggedIn) {
  // Waiting state
  if (isLoggedIn === null) return false;

  // User NOT logged in
  if (!isLoggedIn) {
    // Hide layout on ALL protected pages
    if (!PUBLIC_PAGES.includes(path)) return true;

    // Also hide layout for public pages like "/" and "/login"
    return true;
  }

  // User IS logged in
  // Hide only for pages that should never show layout (ex: login)
  if (path === "/login") return true;

  // Show layout everywhere else
  return false;
}
