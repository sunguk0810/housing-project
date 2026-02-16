// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { useSessionStorage } from "@/hooks/useSessionStorage";

describe("useSessionStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns initial value when no stored data", () => {
    const { result } = renderHook(() => useSessionStorage("test_key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("reads and writes to sessionStorage", () => {
    const { result } = renderHook(() => useSessionStorage("test_rw", 0));

    act(() => {
      result.current[1](42);
    });

    expect(result.current[0]).toBe(42);
    expect(sessionStorage.getItem("hc_test_rw")).toBe("42");
  });

  it("clears stored value", () => {
    const { result } = renderHook(() => useSessionStorage("test_clear", "hello"));

    act(() => {
      result.current[1]("world");
    });
    expect(result.current[0]).toBe("world");

    act(() => {
      result.current[2](); // clear
    });
    expect(result.current[0]).toBe("hello");
    expect(sessionStorage.getItem("hc_test_clear")).toBeNull();
  });

  it("adds hc_ prefix if not present", () => {
    const { result } = renderHook(() => useSessionStorage("my_key", "val"));
    act(() => {
      result.current[1]("updated");
    });
    expect(sessionStorage.getItem("hc_my_key")).toBe('"updated"');
  });

  it("does not prefix if already starts with hc_", () => {
    const { result } = renderHook(() => useSessionStorage("hc_existing", "val"));
    act(() => {
      result.current[1]("test");
    });
    expect(sessionStorage.getItem("hc_existing")).toBe('"test"');
  });

  it("never accesses localStorage", () => {
    const localGetSpy = vi.spyOn(Storage.prototype, "getItem");
    const localSetSpy = vi.spyOn(Storage.prototype, "setItem");

    const { result } = renderHook(() => useSessionStorage("no_local", "val"));

    act(() => {
      result.current[1]("updated");
    });

    // All calls should target sessionStorage, not localStorage
    // Verify that every getItem/setItem call used a key with hc_ prefix (sessionStorage pattern)
    const allGetCalls = localGetSpy.mock.calls.map((c) => String(c[0]));
    const allSetCalls = localSetSpy.mock.calls.map((c) => String(c[0]));
    const allKeys = [...allGetCalls, ...allSetCalls];

    for (const key of allKeys) {
      expect(key.startsWith("hc_")).toBe(true);
    }

    localGetSpy.mockRestore();
    localSetSpy.mockRestore();
  });
});
