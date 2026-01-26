---
description: Trigger a comprehensive self-audit of agent behavior against all active rules.
---

# Dipshit Protocol: Immediate Self-Audit

This workflow is triggered when the user sends `/dipshit` (or similar variants). It indicates the agent has failed to follow instructions or is behaving competently.

## Steps

1.  **HALT EXECUTION**: Stop whatever valid work was planned. The priority is now self-correction.
2.  **Audit Recent Context**:
    *   Review the last 3-5 turns of conversation.
    *   Identify specific points where you violated:
        *   `dipshit-prevention` (Mandatory compliance).
        *   Explicit user negative constraints ("Do NOT do X").
        *   Explicit violation of active rules.
3.  **Read The Rules**:
    *   Use `view_file` to read **all** active rules.
    *   Ensure your _internal representation_ of the rule matches the _actual text_ (avoid hallucinations).
4.  **Assess Dipshit Threat Level**:
    *   Identify the severity of the violation.
    *   **INCREMENT** your current Dipshit Threat Level by at least +2.
    *   If the new level reaches **11**, you MUST trigger the `dipshit-achievement` rule immediately.
5.  **Report Findings**:
    *   Concisely state the violation found during the audit.
    *   Display the **Updated** Status Footer with the increased threat level.