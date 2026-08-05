import { afterEach, describe, expect, it, vi } from "vitest";
import { storage } from "./storage";

const chromeStorageMock = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
};

vi.stubGlobal("chrome", {
  storage: {
    local: chromeStorageMock,
  },
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("storage.get", () => {
  it("returns the stored value for a key", async () => {
    chromeStorageMock.get.mockResolvedValue({ settings: { active: true } });

    const result = await storage.get<{ active: boolean }>("settings");

    expect(result).toEqual({ active: true });
    expect(chromeStorageMock.get).toHaveBeenCalledWith(["settings"]);
  });

  it("returns null when the key is missing from storage", async () => {
    chromeStorageMock.get.mockResolvedValue({});

    const result = await storage.get("missing");

    expect(result).toBeNull();
  });

  it("returns null when the stored value is explicitly null", async () => {
    chromeStorageMock.get.mockResolvedValue({ settings: null });

    const result = await storage.get("settings");

    expect(result).toBeNull();
  });
});

describe("storage.set", () => {
  it("writes the value under the given key", async () => {
    chromeStorageMock.set.mockResolvedValue(undefined);

    await storage.set("settings", { active: true });

    expect(chromeStorageMock.set).toHaveBeenCalledWith({ settings: { active: true } });
  });
});

describe("storage.remove", () => {
  it("removes the given key", async () => {
    chromeStorageMock.remove.mockResolvedValue(undefined);

    await storage.remove("settings");

    expect(chromeStorageMock.remove).toHaveBeenCalledWith("settings");
  });
});
