/**
 * WorkflowTissue — Coverage & Edge Case Tests
 * Tissue ID: TIS-WORKFLOW-v0.1.0
 */

import { WorkflowTissue } from '../src/entity';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('WorkflowTissue Edge Cases', () => {
  let tissue: WorkflowTissue;

  beforeEach(() => {
    tissue = new WorkflowTissue();
  });

  it('should handle empty target cells', async () => {
    const request = {
      requestId: 'edge-empty-001',
      sourceCell: 'test-cell',
      targetCells: [],
      payload: {},
      timeout: NIGERIA_FIRST_CONFIG.DEFAULT_TIMEOUT_MS,
      locale: 'en-NG',
      offlineCapable: true,
    };
    const result = await tissue.coordinate(request);
    expect(result).toBeDefined();
  });

  it('should handle queue overflow gracefully', async () => {
    // Queue more than capacity
    for (let i = 0; i < NIGERIA_FIRST_CONFIG.OFFLINE_QUEUE_CAPACITY + 10; i++) {
      await tissue.coordinateOffline({
        requestId: `overflow-${i}`,
        sourceCell: 'test',
        targetCells: ['test'],
        payload: { i },
        timeout: 30000,
        locale: 'en-NG',
        offlineCapable: true,
      });
    }
    const health = await tissue.getHealth();
    expect(health.queueDepth).toBeLessThanOrEqual(NIGERIA_FIRST_CONFIG.OFFLINE_QUEUE_CAPACITY);
  });

  it('should enforce offline-first queue ordering', async () => {
    const r1 = await tissue.coordinateOffline({
      requestId: 'order-001',
      sourceCell: 'test',
      targetCells: ['test'],
      payload: { order: 1 },
      timeout: 30000,
      locale: 'en-NG',
      offlineCapable: true,
    });
    const r2 = await tissue.coordinateOffline({
      requestId: 'order-002',
      sourceCell: 'test',
      targetCells: ['test'],
      payload: { order: 2 },
      timeout: 30000,
      locale: 'en-NG',
      offlineCapable: true,
    });
    expect(r1.timestamp).toBeLessThanOrEqual(r2.timestamp);
  });
});
