import { describe, expect, it } from 'vitest';
import { projectStatusChangeSteps } from './projectStatusFlow';

describe('projectStatusChangeSteps', () => {
  it('walks from upcoming to delivery through legal backend transitions', () => {
    expect(projectStatusChangeSteps('UPCOMING', 'ready_to_deliver')).toEqual([
      'CONFIRMED',
      'SHOOTING',
      'EDITING',
      'DELIVERY',
    ]);
  });

  it('walks from upcoming to completed through delivery first', () => {
    expect(projectStatusChangeSteps('UPCOMING', 'completed')).toEqual([
      'CONFIRMED',
      'SHOOTING',
      'EDITING',
      'DELIVERY',
      'COMPLETED',
    ]);
  });

  it('keeps active backend statuses stable for the running UI state', () => {
    expect(projectStatusChangeSteps('EDITING', 'running')).toEqual([]);
    expect(projectStatusChangeSteps('UPCOMING', 'running')).toEqual(['CONFIRMED']);
  });

  it('allows completed projects to move back to delivery', () => {
    expect(projectStatusChangeSteps('COMPLETED', 'ready_to_deliver')).toEqual(['DELIVERY']);
  });
});
