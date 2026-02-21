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
    expect(values.job1).toBe('');
    expect(values.cash).toBe(0);
    expect(values.income).toBe(0);
    expect(values.weightProfile).toBe('balanced');
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

  it('provides default desiredAreas with all three selected', () => {
    const { result } = renderHook(() => useStepForm());
    const values = result.current.form.getValues();
    expect(values.desiredAreas).toEqual(['small', 'medium', 'large']);
  });

  it('saves form data to sessionStorage with schemaVersion 6', () => {
    const { result } = renderHook(() => useStepForm());

    act(() => {
      result.current.form.setValue('cash', 5000);
    });

    // Auto-save should have written to sessionStorage
    const stored = sessionStorage.getItem('hc_form_data');
    expect(stored).toBeTruthy();
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.schemaVersion).toBe(6);
      expect(parsed.data.cash).toBe(5000);
      expect(parsed.data.weightProfile).toBe('balanced');
      expect(parsed.data.budgetProfile).toBe('noProperty');
      expect(parsed.data.loanProgram).toBe('bankMortgage');
      expect(parsed.data.desiredAreas).toEqual(['small', 'medium', 'large']);
    }
  });

  it('restores from v5 session payload and adds desiredAreas default', () => {
    sessionStorage.setItem(
      'hc_form_data',
      JSON.stringify({
        schemaVersion: 5,
        data: {
          tradeType: 'sale',
          job1: '판교역',
          job2: '',
          job1Remote: false,
          job2Remote: false,
          cash: 30000,
          income: 96000,
          weightProfile: 'commute_focused',
          budgetProfile: 'firstTime',
          loanProgram: 'bogeumjari',
        },
      }),
    );

    const { result } = renderHook(() => useStepForm());
    const values = result.current.form.getValues();
    expect(values.tradeType).toBe('sale');
    expect(values.income).toBe(96000);
    expect(values.budgetProfile).toBe('firstTime');
    expect(values.desiredAreas).toEqual(['small', 'medium', 'large']);
  });

  it('restores from v4 session payload and migrates income to annual', () => {
    sessionStorage.setItem(
      'hc_form_data',
      JSON.stringify({
        schemaVersion: 4,
        data: {
          tradeType: 'sale',
          marriagePlannedAt: 'within_1y',
          childPlan: 'yes',
          job1: '판교역',
          job2: '',
          job1Remote: false,
          job2Remote: false,
          cash: 30000,
          income: 1000, // monthly
          loans: 500,
          monthlyBudget: 400,
          weightProfile: 'commute_focused',
          budgetProfile: 'firstTime',
          loanProgram: 'bogeumjari',
          livingAreas: ['pangyo'],
        },
      }),
    );

    const { result } = renderHook(() => useStepForm());
    const values = result.current.form.getValues();
    expect(values.tradeType).toBe('sale');
    expect(values.weightProfile).toBe('commute_focused');
    // v4->v5: income * 12 (monthly -> annual)
    expect(values.income).toBe(12000);
    // v4->v5: budgetProfile/loanProgram preserved
    expect(values.budgetProfile).toBe('firstTime');
    expect(values.loanProgram).toBe('bogeumjari');
    // v4->v6: desiredAreas defaults added
    expect(values.desiredAreas).toEqual(['small', 'medium', 'large']);
    // removed fields should not be in v6 schema
    expect('livingAreas' in values).toBe(false);
    expect('childPlan' in values).toBe(false);
    expect('marriagePlannedAt' in values).toBe(false);
    expect('loans' in values).toBe(false);
    expect('monthlyBudget' in values).toBe(false);
  });

  it('restores from legacy v1 sessionStorage and migrates to v5', () => {
    sessionStorage.setItem(
      'hc_form_data',
      JSON.stringify({
        tradeType: 'sale',
        childPlan: 'yes',
        job1: '서울역',
        job2: '',
        cash: 10000,
        income: 500, // monthly
        loans: 100,
        monthlyBudget: 200,
        priorities: ['budget'],
      }),
    );

    const { result } = renderHook(() => useStepForm());
    const values = result.current.form.getValues();
    expect(values.tradeType).toBe('sale');
    expect(values.cash).toBe(10000);
    expect(values.income).toBe(6000); // 500 * 12
    expect(values.weightProfile).toBe('budget_focused');
  });

  it('restores from v2 session payload and migrates to v5', () => {
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
          income: 700, // monthly
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
    expect(values.income).toBe(8400); // 700 * 12
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
          income: 800, // monthly
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
    expect(values.income).toBe(9600); // 800 * 12
  });

  it('restores from v3 session payload and migrates to v5', () => {
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
          income: 1000, // monthly
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
    expect(values.income).toBe(12000); // 1000 * 12
    // v3->v5 migration adds default budgetProfile and loanProgram
    expect(values.budgetProfile).toBe('noProperty');
    expect(values.loanProgram).toBe('bankMortgage');
  });
});
