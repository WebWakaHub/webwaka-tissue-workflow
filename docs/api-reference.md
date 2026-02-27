# WorkflowTissue — API Reference
## Tissue ID: TIS-WORKFLOW-v0.1.0

### Methods

#### `coordinate(request: CoordinationRequest): Promise<CoordinationResult>`
Primary coordination method. Offline-first: queues before executing.

**Parameters:**
- `requestId`: Unique request identifier
- `sourceCell`: Originating cell ID
- `targetCells`: Array of target cell IDs
- `payload`: Request payload (any serializable data)
- `timeout`: Timeout in ms (default: 30000 — Nigeria-first)
- `locale`: Locale string (default: 'en-NG')

**Returns:** CoordinationResult with status, cell results, and queue info.

#### `coordinateOffline(request: CoordinationRequest): Promise<CoordinationResult>`
Explicit offline coordination. Always queues, never attempts network.

#### `sync(context: SyncContext): Promise<SyncResult>`
Syncs offline queue with upstream. Nigeria-first network awareness.

#### `getHealth(): Promise<TissueHealthStatus>`
Returns tissue and cell health statuses with queue depth.

### Types
See `src/types.ts` for complete type definitions.
