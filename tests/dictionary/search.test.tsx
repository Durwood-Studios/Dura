import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchBar } from "@/components/dictionary/SearchBar";

afterEach((): void => {
  cleanup();
  vi.useRealTimers();
});

describe("dictionary search debounce", (): void => {
  it("emits only the latest query and cancels pending work on unmount", (): void => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const view = render(<SearchBar value="" onChange={onChange} />);
    const input = screen.getByRole("searchbox", { name: "Search dictionary terms" });
    fireEvent.change(input, { target: { value: "b" } });
    act((): void => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.change(input, { target: { value: "binary" } });
    act((): void => {
      vi.advanceTimersByTime(300);
    });
    expect(onChange).toHaveBeenCalledExactlyOnceWith("binary");
    fireEvent.change(input, { target: { value: "bytes" } });
    view.unmount();
    act((): void => {
      vi.runAllTimers();
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
