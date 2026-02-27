/**
 * WorkflowTissue — Type Definitions
 * Tissue ID: TIS-WORKFLOW-v0.1.0
 * Classification: Lifecycle
 * 
 * Doctrines Enforced:
 * - Build Once Use Infinitely
 * - Mobile First
 * - PWA First  
 * - Offline First (NON-NEGOTIABLE)
 * - Nigeria First
 * - Africa First
 * - Vendor Neutral AI
 */

// Nigeria-First Configuration
export const NIGERIA_FIRST_CONFIG = {
  DEFAULT_TIMEOUT_MS: 30_000,
  DEFAULT_LOCALE: 'en-NG',
  DEFAULT_REGION: 'af-west-1',
  PRIMARY_DATACENTER: 'lagos',
  BANDWIDTH_THRESHOLD_KBPS: 50,
  PAYLOAD_COMPRESSION_THRESHOLD_BYTES: 1024,
  RETRY_BASE_MS: 5_000,
  RETRY_MAX_MS: 60_000,
  OFFLINE_QUEUE_CAPACITY: 10_000,
} as const;

// Tissue Identity
export const TISSUE_ID = 'TIS-WORKFLOW-v0.1.0' as const;
export const TISSUE_HASH = '25773e3c' as const;
export const CLASSIFICATION = 'Lifecycle' as const;
export const COMPOSED_CELLS = ['CEL-WORKFLOW', 'CEL-STATESTORE', 'CEL-EVENTBUS'] as const;

// Core Interfaces
export interface CoordinationRequest {
  readonly requestId: string;
  readonly sourceCell: string;
  readonly targetCells: ReadonlyArray<string>;
  readonly payload: unknown;
  readonly timeout: number;
  readonly locale: string;
  readonly offlineCapable: boolean;
}

export interface CoordinationResult {
  readonly requestId: string;
  readonly status: 'completed' | 'partial' | 'queued' | 'failed';
  readonly cellResults: Map<string, CellResult>;
  readonly offlineQueued: boolean;
  readonly timestamp: number;
  readonly duration: number;
}

export interface CellResult {
  readonly cellId: string;
  readonly status: 'success' | 'failure' | 'timeout' | 'offline';
  readonly data: unknown;
  readonly latency: number;
}

export interface OfflineQueueEntry {
  readonly id: string;
  readonly request: CoordinationRequest;
  readonly queuedAt: number;
  readonly retryCount: number;
  readonly priority: number;
}

export interface TissueHealthStatus {
  readonly tissueId: string;
  readonly status: 'healthy' | 'degraded' | 'offline';
  readonly cellStatuses: Map<string, 'healthy' | 'degraded' | 'offline'>;
  readonly queueDepth: number;
  readonly lastSync: number;
}

export interface SyncContext {
  readonly syncId: string;
  readonly lastSyncTimestamp: number;
  readonly vectorClock: Map<string, number>;
  readonly conflictStrategy: 'last-write-wins' | 'merge' | 'manual';
}

export interface SyncResult {
  readonly syncId: string;
  readonly itemsSynced: number;
  readonly conflicts: number;
  readonly resolved: number;
  readonly pending: number;
}

export interface NetworkConfig {
  readonly isOnline: boolean;
  readonly connectionType: '4g' | '3g' | '2g' | 'slow-2g' | 'offline';
  readonly effectiveBandwidthKbps: number;
  readonly rtt: number;
}
