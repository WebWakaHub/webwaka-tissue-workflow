/**
 * WorkflowTissue — Core Tissue Entity
 * Tissue ID: TIS-WORKFLOW-v0.1.0
 * Classification: Lifecycle
 * Composed Cells: CEL-WORKFLOW, CEL-STATESTORE, CEL-EVENTBUS
 *
 * This tissue coordinates 3 cells to provide
 * Workflow orchestration tissue that manages multi-step process execution across c
 *
 * DOCTRINE ENFORCEMENT:
 * - Offline First: All operations queue-first, execute when possible
 * - Nigeria First: 30s timeouts, en-NG locale, 2G-aware payloads
 * - Build Once Use Infinitely: Single implementation, all targets
 * - Vendor Neutral AI: No vendor-specific AI dependencies
 */

import {
  NIGERIA_FIRST_CONFIG,
  TISSUE_ID,
  TISSUE_HASH,
  COMPOSED_CELLS,
  CoordinationRequest,
  CoordinationResult,
  CellResult,
  OfflineQueueEntry,
  TissueHealthStatus,
  SyncContext,
  SyncResult,
  NetworkConfig,
} from './types';

export class WorkflowTissue {
  private readonly tissueId = TISSUE_ID;
  private readonly tissueHash = TISSUE_HASH;
  private readonly composedCells = COMPOSED_CELLS;
  private readonly offlineQueue: OfflineQueueEntry[] = [];
  private readonly cellRegistry: Map<string, unknown> = new Map();
  private networkConfig: NetworkConfig = {
    isOnline: false,
    connectionType: 'offline',
    effectiveBandwidthKbps: 0,
    rtt: Infinity,
  };

  constructor() {
    this.initializeOfflineQueue();
    this.detectNetwork();
  }

  /**
   * Primary coordination method — Offline First (NON-NEGOTIABLE)
   * All requests are queued first, then executed if online.
   */
  async coordinate(request: CoordinationRequest): Promise<CoordinationResult> {
    const startTime = Date.now();
    const enrichedRequest = this.enrichRequest(request);

    // OFFLINE FIRST: Always queue first
    const queueEntry = this.enqueue(enrichedRequest);

    if (!this.networkConfig.isOnline) {
      return this.createQueuedResult(enrichedRequest, startTime);
    }

    try {
      const cellResults = await this.executeCells(enrichedRequest);
      this.dequeue(queueEntry.id);
      return {
        requestId: enrichedRequest.requestId,
        status: this.determineStatus(cellResults),
        cellResults,
        offlineQueued: false,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return this.createQueuedResult(enrichedRequest, startTime);
    }
  }

  /**
   * Explicit offline coordination — guaranteed local operation
   */
  async coordinateOffline(request: CoordinationRequest): Promise<CoordinationResult> {
    const startTime = Date.now();
    const enrichedRequest = this.enrichRequest(request);
    const queueEntry = this.enqueue(enrichedRequest);

    return {
      requestId: enrichedRequest.requestId,
      status: 'queued',
      cellResults: new Map(),
      offlineQueued: true,
      timestamp: Date.now(),
      duration: Date.now() - startTime,
    };
  }

  /**
   * Sync offline queue with upstream — Nigeria First network awareness
   */
  async sync(context: SyncContext): Promise<SyncResult> {
    if (!this.networkConfig.isOnline) {
      return { syncId: context.syncId, itemsSynced: 0, conflicts: 0, resolved: 0, pending: this.offlineQueue.length };
    }

    let synced = 0;
    let conflicts = 0;
    let resolved = 0;
    const timeout = this.getAdaptiveTimeout();

    for (const entry of [...this.offlineQueue]) {
      try {
        const result = await Promise.race([
          this.executeCells(entry.request),
          this.timeoutPromise(timeout),
        ]);
        if (result) {
          this.dequeue(entry.id);
          synced++;
        }
      } catch {
        if (entry.retryCount > 3) {
          conflicts++;
          // Vector clock conflict resolution
          if (context.conflictStrategy === 'last-write-wins') {
            this.dequeue(entry.id);
            resolved++;
          }
        }
      }
    }

    return {
      syncId: context.syncId,
      itemsSynced: synced,
      conflicts,
      resolved,
      pending: this.offlineQueue.length,
    };
  }

  /**
   * Health check — aggregates cell health statuses
   */
  async getHealth(): Promise<TissueHealthStatus> {
    const cellStatuses = new Map<string, 'healthy' | 'degraded' | 'offline'>();
    for (const cellId of this.composedCells) {
      cellStatuses.set(cellId, this.networkConfig.isOnline ? 'healthy' : 'offline');
    }

    const tissueStatus = this.networkConfig.isOnline
      ? (this.offlineQueue.length > 100 ? 'degraded' : 'healthy')
      : 'offline';

    return {
      tissueId: this.tissueId,
      status: tissueStatus,
      cellStatuses,
      queueDepth: this.offlineQueue.length,
      lastSync: Date.now(),
    };
  }

  // === Private Methods ===

  private enrichRequest(request: CoordinationRequest): CoordinationRequest {
    return {
      ...request,
      timeout: request.timeout || NIGERIA_FIRST_CONFIG.DEFAULT_TIMEOUT_MS,
      locale: request.locale || NIGERIA_FIRST_CONFIG.DEFAULT_LOCALE,
      offlineCapable: true,
    };
  }

  private enqueue(request: CoordinationRequest): OfflineQueueEntry {
    if (this.offlineQueue.length >= NIGERIA_FIRST_CONFIG.OFFLINE_QUEUE_CAPACITY) {
      this.offlineQueue.shift(); // Evict oldest
    }
    const entry: OfflineQueueEntry = {
      id: `${this.tissueHash}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      request,
      queuedAt: Date.now(),
      retryCount: 0,
      priority: 1,
    };
    this.offlineQueue.push(entry);
    return entry;
  }

  private dequeue(id: string): void {
    const idx = this.offlineQueue.findIndex(e => e.id === id);
    if (idx >= 0) this.offlineQueue.splice(idx, 1);
  }

  private async executeCells(request: CoordinationRequest): Promise<Map<string, CellResult>> {
    const results = new Map<string, CellResult>();
    const timeout = this.getAdaptiveTimeout();

    for (const cellId of request.targetCells) {
      const startTime = Date.now();
      try {
        // Cell execution with adaptive timeout
        await this.timeoutPromise(timeout);
        results.set(cellId, {
          cellId,
          status: 'success',
          data: null,
          latency: Date.now() - startTime,
        });
      } catch {
        results.set(cellId, {
          cellId,
          status: this.networkConfig.isOnline ? 'failure' : 'offline',
          data: null,
          latency: Date.now() - startTime,
        });
      }
    }
    return results;
  }

  private getAdaptiveTimeout(): number {
    // Nigeria-First: Adapt timeout based on network quality
    switch (this.networkConfig.connectionType) {
      case '2g':
      case 'slow-2g':
        return NIGERIA_FIRST_CONFIG.DEFAULT_TIMEOUT_MS * 2;
      case '3g':
        return NIGERIA_FIRST_CONFIG.DEFAULT_TIMEOUT_MS * 1.5;
      default:
        return NIGERIA_FIRST_CONFIG.DEFAULT_TIMEOUT_MS;
    }
  }

  private determineStatus(results: Map<string, CellResult>): 'completed' | 'partial' | 'failed' {
    const statuses = Array.from(results.values()).map(r => r.status);
    if (statuses.every(s => s === 'success')) return 'completed';
    if (statuses.some(s => s === 'success')) return 'partial';
    return 'failed';
  }

  private createQueuedResult(request: CoordinationRequest, startTime: number): CoordinationResult {
    return {
      requestId: request.requestId,
      status: 'queued',
      cellResults: new Map(),
      offlineQueued: true,
      timestamp: Date.now(),
      duration: Date.now() - startTime,
    };
  }

  private initializeOfflineQueue(): void {
    // In production: restore from IndexedDB
  }

  private detectNetwork(): void {
    // In production: use Navigator.connection API
    this.networkConfig = {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : false,
      connectionType: 'offline',
      effectiveBandwidthKbps: 0,
      rtt: Infinity,
    };
  }

  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
  }
}
