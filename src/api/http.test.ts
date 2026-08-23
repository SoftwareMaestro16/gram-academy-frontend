import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError, requestJson } from "./http";

const schema = z.object({ ok: z.boolean() });

function mockFetch(response: Partial<Response> & { json: () => Promise<unknown> }) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("requestJson", () => {
  it("returns validated data on success", async () => {
    mockFetch({ ok: true, status: 200, json: async () => ({ ok: true }) });
    await expect(requestJson("/v1/test", schema)).resolves.toEqual({ ok: true });
  });

  it("throws ApiError carrying path, status and error code on non-2xx", async () => {
    mockFetch({
      ok: false,
      status: 409,
      json: async () => ({ error: "already_minted" }),
    });
    const err = await requestJson("/v1/test", schema).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    const apiError = err as ApiError;
    expect(apiError.status).toBe(409);
    expect(apiError.path).toBe("/v1/test");
    expect(apiError.code).toBe("already_minted");
  });

  it("throws ApiError(invalid_response) when the body fails schema validation", async () => {
    mockFetch({ ok: true, status: 200, json: async () => ({ ok: "nope" }) });
    const err = await requestJson("/v1/test", schema).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).code).toBe("invalid_response");
  });

  it("wraps network failures as ApiError(network_error)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const err = await requestJson("/v1/test", schema).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).code).toBe("network_error");
    expect((err as ApiError).status).toBe(0);
  });
});
