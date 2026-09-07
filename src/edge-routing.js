const CANONICAL_HOST = "game4git.com";
const FILE_EXTENSION_RE = /\/[^/?#]+\.[a-z0-9]{1,12}$/i;
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function getHeader(headers, name) {
  if (!headers?.get) {
    return "";
  }

  return headers.get(name) || "";
}

function normalizeHeaderHost(host) {
  const value = String(host || "").trim().toLowerCase();

  if (!value) {
    return "";
  }

  if (value.startsWith("[")) {
    return value.slice(1, value.indexOf("]"));
  }

  return value.split(":")[0];
}

export function isHtmlRoutePath(pathname) {
  if (!pathname || pathname === "/") {
    return true;
  }

  if (pathname.startsWith("/.well-known/")) {
    return false;
  }

  return !FILE_EXTENSION_RE.test(pathname);
}

export function getCanonicalRedirectUrl(rawUrl, headers) {
  const url = new URL(rawUrl);
  const headerHost = normalizeHeaderHost(getHeader(headers, "host"));

  if (LOCAL_HOSTS.has(url.hostname) && headerHost && !LOCAL_HOSTS.has(headerHost)) {
    url.hostname = headerHost;
    url.port = "";
  }

  let changed = false;

  if (LOCAL_HOSTS.has(url.hostname)) {
    return null;
  }

  if (url.protocol !== "https:") {
    url.protocol = "https:";
    changed = true;
  }

  if (url.hostname !== CANONICAL_HOST) {
    url.hostname = CANONICAL_HOST;
    url.port = "";
    changed = true;
  }

  if (isHtmlRoutePath(url.pathname) && !url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
    changed = true;
  }

  return changed ? url.toString() : null;
}
