// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { useStepForm } from '@/hooks/useStepForm';

describe('useStepForm', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('starts at step 1', () => {
    const { result } = renderHook(() => useStepForm());
    expect(result.current.currentStep).toBe(1);
    expect(result.current.isFirstStep).toBe(true);
  });

  it('provides default form values', () => {
    const { result } = renderHook(() => useStepForm());
    const values = result.current.form.getValues();
    expect(values.tradeType).toBeUndefined();
    expect(values.marriagePlannedAt).toBeUndefined();
    expect(values.childPlan).toBeUndefined();
    expect(values.job1).toBe('');
    expect(values.cash).toBe(0);
    expect(values.priorityWeights.commute).toBe(25);
    expect(values.livingAreas).toEqual([]);
  });

  it('navigates forward and backward', () => {
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

  it('does not go below step 1', () => {
    const { result } = renderHook(() => useStepForm());

    act(() => {
      result.current.goPrev();
    });
    expect(result.current.currentStep).toBe(1);
  });

  it('does not go above step 5', () => {
    const { result } = renderHook(() => useStepForm());

    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.goNext();
      });
    }
    expect(result.current.currentStep).toBe(5);
    expect(result.current.isAnalysisStep).toBe(true);
  });

  it('detects step 4 as last input step', () => {
    const { result } = renderHook(() => useStepForm());

    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.goNext();
      });
    }
    expect(result.current.currentStep).toBe(4);
    expect(result.current.isLastInputStep).toBe(true);
  });

  it('saves form data to sessionStorage', () => {
    const { result } = renderHook(() => useStepForm());

    act(() => {
      result.current.form.setValue('cash', 5000);
    });

    // Auto-save should have written to sessionStorage
    const stored = sessionStorage.getItem('hc_form_data');
    expect(stored).toBeTruthy();
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.schemaVersion).toBe(2);
      expect(parsed.data.cash).toBe(5000);
    }
  });

  it('restores from legacy sessionStorage and migrates data', () => {
    sessionStorage.setItem(
      'hc_form_data',
      JSON.stringify({
        tradeType: 'sale',
        childPlan: 'yes',
        job1: '서울역',
        job2: '',
        cash: 10000,
        income: 500,
        loans: 100,
        monthlyBudget: 200,
        priorities: ['budget'],
      }),
    );

    const { result } = renderHook(() => useStepForm());
    const values = result.current.form.getValues();
    expect(values.tradeType).toBe('sale');
    expect(values.cash).toBe(10000);
    expect(values.childPlan).toBe('yes');
    expect(values.marriagePlannedAt).toBeUndefined();
    expect(values.priorityWeights.budget).toBe(60);
    expect(values.priorityWeights.commute).toBe(20);
  });

  it('restores from v2 session payload', () => {
    sessionStorage.setItem(
      'hc_form_data',
      JSON.stringify({
        schemaVersion: 2,
        data: {
          tradeType: 'monthly',
          marriagePlannedAt: 'within_6m',
          childPlan: 'maybe',
          job1: '서울역',
          job2: '',
          job1Remote: false,
          job2Remote: false,
          cash: 15000,
          income: 700,
          loans: 200,
          monthlyBudget: 250,
          priorityWeights: {
            commute: 40,
            childcare: 20,
            safety: 20,
            budget: 20,
          },
          livingAreas: ['gangnam'],
        },
      }),
    );

    const { result } = renderHook(() => useStepForm());
    const values = result.current.form.getValues();
    expect(values.tradeType).toBe('monthly');
    expect(values.marriagePlannedAt).toBe('within_6m');
    expect(values.livingAreas).toEqual(['gangnam']);
    expect(values.priorityWeights.commute).toBe(40);
  });
});
