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

  it('provides default form values with weightProfile balanced', () => {
    const { result } = renderHook(() => useStepForm());
    const values = result.current.form.getValues();
    expect(values.tradeType).toBeUndefined();
    expect(values.marriagePlannedAt).toBeUndefined();
    expect(values.childPlan).toBeUndefined();
    expect(values.job1).toBe('');
    expect(values.cash).toBe(0);
    expect(values.weightProfile).toBe('balanced');
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

  it('saves form data to sessionStorage with schemaVersion 4', () => {
    const { result } = renderHook(() => useStepForm());

    act(() => {
      result.current.form.setValue('cash', 5000);
    });

    // Auto-save should have written to sessionStorage
    const stored = sessionStorage.getItem('hc_form_data');
    expect(stored).toBeTruthy();
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.schemaVersion).toBe(4);
      expect(parsed.data.cash).toBe(5000);
      expect(parsed.data.weightProfile).toBe('balanced');
      expect(parsed.data.budgetProfile).toBe('noProperty');
      expect(parsed.data.loanProgram).toBe('bankMortgage');
    }
  });

  it('restores from legacy v1 sessionStorage and migrates to weightProfile', () => {
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
    expect(values.weightProfile).toBe('budget_focused');
  });

  it('restores from v2 session payload and migrates priorityWeights to weightProfile', () => {
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
    expect(values.weightProfile).toBe('commute_focused');
  });

  it('restores from v2 balanced weights to balanced profile', () => {
    sessionStorage.setItem(
      'hc_form_data',
      JSON.stringify({
        schemaVersion: 2,
        data: {
          tradeType: 'jeonse',
          marriagePlannedAt: undefined,
          childPlan: 'no',
          job1: '강남역',
          job2: '',
          job1Remote: false,
          job2Remote: false,
          cash: 20000,
          income: 800,
          loans: 0,
          monthlyBudget: 300,
          priorityWeights: {
            commute: 25,
            childcare: 25,
            safety: 25,
            budget: 25,
          },
          livingAreas: [],
        },
      }),
    );

    const { result } = renderHook(() => useStepForm());
    const values = result.current.form.getValues();
    expect(values.weightProfile).toBe('balanced');
  });

  it('restores from v3 session payload and migrates to v4 with defaults', () => {
    sessionStorage.setItem(
      'hc_form_data',
      JSON.stringify({
        schemaVersion: 3,
        data: {
          tradeType: 'sale',
          marriagePlannedAt: 'within_1y',
          childPlan: 'yes',
          job1: '판교역',
          job2: '',
          job1Remote: false,
          job2Remote: false,
          cash: 30000,
          income: 1000,
          loans: 500,
          monthlyBudget: 400,
          weightProfile: 'commute_focused',
          livingAreas: ['pangyo'],
        },
      }),
    );

    const { result } = renderHook(() => useStepForm());
    const values = result.current.form.getValues();
    expect(values.tradeType).toBe('sale');
    expect(values.weightProfile).toBe('commute_focused');
    expect(values.livingAreas).toEqual(['pangyo']);
    // v3→v4 migration adds default budgetProfile and loanProgram
    expect(values.budgetProfile).toBe('noProperty');
    expect(values.loanProgram).toBe('bankMortgage');
  });
});
