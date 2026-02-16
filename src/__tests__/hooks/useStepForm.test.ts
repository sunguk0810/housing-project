// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { useStepForm } from "@/hooks/useStepForm";

describe("useStepForm", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("starts at step 1", () => {
    const { result } = renderHook(() => useStepForm());
    expect(result.current.currentStep).toBe(1);
    expect(result.current.isFirstStep).toBe(true);
  });

  it("provides default form values", () => {
    const { result } = renderHook(() => useStepForm());
    const values = result.current.form.getValues();
    expect(values.tradeType).toBe("jeonse");
    expect(values.childPlan).toBe("maybe");
    expect(values.job1).toBe("");
    expect(values.cash).toBe(0);
    expect(values.weightProfile).toBe("balanced");
  });

  it("navigates forward and backward", () => {
    const { result } = renderHook(() => useStepForm());

    act(() => {
      result.current.goNext();
    });
    expect(result.current.currentStep).toBe(2);
    expect(result.current.isFirstStep).toBe(false);

    act(() => {
      result.current.goPrev();
    });
    expect(result.current.currentStep).toBe(1);
  });

  it("does not go below step 1", () => {
    const { result } = renderHook(() => useStepForm());

    act(() => {
      result.current.goPrev();
    });
    expect(result.current.currentStep).toBe(1);
  });

  it("does not go above step 5", () => {
    const { result } = renderHook(() => useStepForm());

    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.goNext();
      });
    }
    expect(result.current.currentStep).toBe(5);
    expect(result.current.isAnalysisStep).toBe(true);
  });

  it("detects step 4 as last input step", () => {
    const { result } = renderHook(() => useStepForm());

    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.goNext();
      });
    }
    expect(result.current.currentStep).toBe(4);
    expect(result.current.isLastInputStep).toBe(true);
  });

  it("saves form data to sessionStorage", () => {
    const { result } = renderHook(() => useStepForm());

    act(() => {
      result.current.form.setValue("cash", 5000);
    });

    // Auto-save should have written to sessionStorage
    const stored = sessionStorage.getItem("hc_form_data");
    expect(stored).toBeTruthy();
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.cash).toBe(5000);
    }
  });

  it("restores from sessionStorage", () => {
    sessionStorage.setItem(
      "hc_form_data",
      JSON.stringify({
        tradeType: "sale",
        childPlan: "yes",
        job1: "서울역",
        job2: "",
        cash: 10000,
        income: 500,
        loans: 100,
        monthlyBudget: 200,
        weightProfile: "budget_focused",
      }),
    );

    const { result } = renderHook(() => useStepForm());
    const values = result.current.form.getValues();
    expect(values.tradeType).toBe("sale");
    expect(values.cash).toBe(10000);
    expect(values.childPlan).toBe("yes");
  });
});
