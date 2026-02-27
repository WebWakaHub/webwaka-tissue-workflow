# WorkflowTissue — Interface Contract
## Tissue ID: TIS-WORKFLOW-v0.1.0

### 1. Public Interface
```typescript
interface IWorkflowTissue {
  readonly tissueId: string;
  readonly classification: 'Lifecycle';
  readonly composedCells: ReadonlyArray<string>;
  
  coordinate(request: CoordinationRequest): Promise<CoordinationResult>;
  coordinateOffline(request: CoordinationRequest): Promise<OfflineCoordinationResult>;
  sync(upstream: SyncContext): Promise<SyncResult>;
  getHealth(): Promise<TissueHealthStatus>;
}

interface CoordinationRequest {
  readonly requestId: string;
  readonly sourceCell: string;
  readonly targetCells: ReadonlyArray<string>;
  readonly payload: unknown;
  readonly timeout: number; // Default: 30000ms (Nigeria-first)
  readonly locale: string; // Default: 'en-NG'
}

interface CoordinationResult {
  readonly requestId: string;
  readonly status: 'completed' | 'partial' | 'queued';
  readonly cellResults: ReadonlyMap<string, CellResult>;
  readonly offlineQueued: boolean;
  readonly timestamp: number;
}

interface OfflineCoordinationResult {
  readonly requestId: string;
  readonly queuePosition: number;
  readonly estimatedSync: number;
  readonly localState: unknown;
}
```

### 2. Cell Interaction Protocol
- Each composed cell is invoked through its standard Cell interface
- Cross-cell coordination uses event-driven messaging
- Offline coordination queues requests in IndexedDB
- Sync reconciliation uses last-write-wins with vector clocks

### 3. Error Handling Contract
- Network timeout: Queue for offline retry (30s default)
- Cell failure: Partial result with degraded flag
- Offline mode: Full local operation with sync promise
- Conflict: Vector clock resolution with Nigeria-first bias
