import { describe, it, expect } from 'vitest';
import { getPlanVsActualSummary } from '../components/charts/PlanVsActualChart';

describe('getPlanVsActualSummary', () => {
  it('should report no-data for an empty series', () => {
    expect(getPlanVsActualSummary([])).toMatchObject({ status: 'no-data', variance: 0 });
  });

  it('should flag behind plan with negative variance', () => {
    const summary = getPlanVsActualSummary([
      { month: 'Jan', planned: 10, actual: 8 },
      { month: 'Feb', planned: 20, actual: 16 },
    ]);
    expect(summary).toMatchObject({ actual: 16, planned: 20, variance: -4, status: 'behind' });
  });

  it('should flag ahead of plan with positive variance', () => {
    const summary = getPlanVsActualSummary([{ month: 'Jan', planned: 10, actual: 12 }]);
    expect(summary).toMatchObject({ variance: 2, status: 'ahead' });
  });

  it('should treat near-zero variance as on-track', () => {
    const summary = getPlanVsActualSummary([{ month: 'Jan', planned: 10, actual: 10.5 }]);
    expect(summary.status).toBe('on-track');
  });
});
