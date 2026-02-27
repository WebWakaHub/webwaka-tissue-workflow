# WorkflowTissue — Architecture Design
## Tissue ID: TIS-WORKFLOW-v0.1.0

### 1. Architectural Overview
The WorkflowTissue tissue implements a coordination layer that orchestrates 3 cells:
- CEL-WORKFLOW
- CEL-STATESTORE
- CEL-EVENTBUS

### 2. Component Architecture
```
┌─────────────────────────────────────────┐
│            WorkflowTissue                          │
│  ┌──────────────────────────────────┐   │
│  │     Coordination Engine          │   │
│  │  ┌────────┐  ┌────────────────┐  │   │
│  │  │Request │  │ Offline Queue  │  │   │
│  │  │Router  │  │ (IndexedDB)    │  │   │
│  │  └────┬───┘  └───────┬────────┘  │   │
│  │       │              │           │   │
│  │  ┌────▼──────────────▼────────┐  │   │
│  │  │   Cell Orchestrator        │  │   │
│  │  └────┬──────┬───────┬────────┘  │   │
│  └───────┼──────┼───────┼───────────┘   │
│     ┌────▼──┐┌──▼───┐┌──▼───┐           │
│     │CEL-WORK││CEL-STAT││CEL-EVEN│           │
│     └───────┘└──────┘└──────┘           │
└─────────────────────────────────────────┘
```

### 3. Data Flow
1. Request arrives at Coordination Engine
2. Network check: online → direct coordination, offline → queue
3. Request Router dispatches to target cells
4. Cell Orchestrator manages execution order and dependencies
5. Results aggregated and returned (or queued for sync)

### 4. Offline-First Architecture (NON-NEGOTIABLE)
- All coordination requests are first persisted to IndexedDB
- Online path: persist → execute → confirm
- Offline path: persist → queue → sync when online
- Conflict resolution: vector clocks with deterministic merge
- Queue capacity: 10,000 requests (configurable)

### 5. Nigeria-First Network Awareness
- Default timeout: 30,000ms (accounts for 2G/3G latency)
- Payload compression: gzip for payloads > 1KB
- Retry strategy: exponential backoff starting at 5s
- Bandwidth detection: adaptive payload sizing
- Locale default: en-NG
