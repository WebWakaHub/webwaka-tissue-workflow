/**
 * Workflow — Tissue Layer
 * Composes cells per BIOLOGICAL_GOVERNANCE_CONSTITUTION §4.1
 * Layer: tissue → depends on → cell
 */

import { CmdProcessComposition } from "@webwaka/cell-cmd-process";
import { EventDispatchComposition } from "@webwaka/cell-event-dispatch";
import { ValidateExecComposition } from "@webwaka/cell-validate-exec";

export { CmdProcessComposition } from '@webwaka/cell-cmd-process';
export { EventDispatchComposition } from '@webwaka/cell-event-dispatch';
export { ValidateExecComposition } from '@webwaka/cell-validate-exec';

/**
 * Workflow Composition
 * Assembles cell-layer components into a cohesive tissue-layer capability.
 */
export class WorkflowComposition {
  private cmdProcessComposition: CmdProcessComposition;
  private eventDispatchComposition: EventDispatchComposition;
  private validateExecComposition: ValidateExecComposition;

  constructor() {
    this.cmdProcessComposition = new CmdProcessComposition();
    this.eventDispatchComposition = new EventDispatchComposition();
    this.validateExecComposition = new ValidateExecComposition();
  }
}

export * from "./types";
