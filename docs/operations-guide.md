# WorkflowTissue — Operations Guide
## Tissue ID: TIS-WORKFLOW-v0.1.0

### Deployment
- Deploy as part of the WebWaka tissue layer
- Requires IndexedDB for offline queue persistence
- Service worker registration for PWA-first operation

### Monitoring
- Queue depth alerts at 80% capacity (8,000 items)
- Cell health checks every 30 seconds
- Network transition logging for Nigeria-first awareness

### Troubleshooting
| Symptom | Cause | Resolution |
|---------|-------|------------|
| Queue growing | Network offline | Wait for connectivity or manual sync |
| Partial results | Cell failure | Check individual cell health |
| Sync conflicts | Concurrent edits | Review vector clock resolution |
| Timeout errors | 2G/3G network | Timeout auto-adapts; check thresholds |

### Nigeria-First Considerations
- Default timeout: 30s (not 5s like Western defaults)
- Payload compression enabled for >1KB
- Retry backoff starts at 5s (not 1s)
- Queue capacity: 10,000 (supports extended offline periods)
