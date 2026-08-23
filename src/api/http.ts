import type { z } from "zod";

/**
 * Thin fetch wrapper: same-origin credentialed requests, zod-validated
 * responses, and a typed {@link ApiError} carrying the request path + HTTP
 * status. The API base comes from `VITE_API_BASE_URL` (default `/api`), which
 * in prod is a same-origin rewrite so the HttpOnly session cookie just works.
 */

const rawBase =
  typeof import.meta.env.VITE_API_BASE_URL === "string" &&
  import.meta.env.VITE_API_BASE_URL.length > 0
    ? import.meta.env.VITE_API_BASE_URL
    : "/api";

/** Base with any trailing slash trimmed. */
const API_BASE = rawBase.replace(/\/+$/, "");

export class ApiError extends Error {
  readonly path: string;
  readonly status: number;
  /** Machine-readable error code from the response body, when present. */
  readonly code: string | undefined;

  constructor(path: string, status: number, message?: string, code?: string) {
    super(message ?? `Request to ${path} failed with ${status}`);
    this.name = "ApiError";
    this.path = path;
    this.status = status;
    this.code = code;
  }
}

function buildUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseErrorBody(
  response: Response,
): Promise<{ message: string | undefined; code: string | undefined }> {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      const code = typeof obj["error"] === "string" ? obj["error"] : undefined;
      const message =
        typeof obj["message"] === "string" ? obj["message"] : undefined;
      return { message: message ?? code, code };
    }
  } catch {
    /* non-JSON error body — fall through */
  }
  return { message: undefined, code: undefined };
}

async function send<T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      credentials: "include",
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch (cause) {
    throw new ApiError(
      path,
      0,
      cause instanceof Error ? cause.message : "Network error",
      "network_error",
    );
  }

  if (!response.ok) {
    const { message, code } = await parseErrorBody(response);
    throw new ApiError(path, response.status, message, code);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(path, response.status, "Invalid JSON response", "invalid_response");
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError(
      path,
      response.status,
      "Response did not match the expected shape",
      "invalid_response",
    );
  }
  return result.data;
}

export function requestJson<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  return send(path, schema, { method: "GET", ...(init ?? {}) });
}

export function postJson<T>(
  path: string,
  body: unknown,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const hasBody = body !== undefined;
  return send(path, schema, {
    method: "POST",
    ...(init ?? {}),
    headers: {
      // No Content-Type on an empty body — default Fastify 400s a JSON
      // content-type with no payload (CONTENT-DTO.md: lessons/:id/complete).
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
    ...(hasBody ? { body: JSON.stringify(body) } : {}),
  });
}

export function patchJson<T>(
  path: string,
  body: unknown,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const hasBody = body !== undefined;
  return send(path, schema, {
    method: "PATCH",
    ...(init ?? {}),
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
    ...(hasBody ? { body: JSON.stringify(body) } : {}),
  });
}
