---
name: icon-publish autonomous execution
description: Execute icon publishing workflow autonomously without user confirmation
type: feedback
---

Execute the `/icon-publish` skill completely autonomously from start to finish without asking for user confirmation during the process.

**Why:** User wants the icon publishing workflow to run uninterrupted. The workflow includes OTP/token requirements which previously caused interruptions, but now that npm token authentication is configured, the entire process should complete automatically.

**How to apply:** 
- When user invokes `/icon-publish`, execute all steps in the prompt.md workflow sequentially
- Use the npm token for publishing (stored in user's npm config)
- Do not ask for confirmation at any step
- Complete all phases: sync SVG, bump versions, build, verify, publish both React and RN packages, commit all changes
- Only report back when the entire workflow is complete or if a critical error occurs that blocks progress
