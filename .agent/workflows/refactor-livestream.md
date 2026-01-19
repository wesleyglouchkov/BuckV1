---
description: Refactor the livestream components for better/less code length
---

Refactor the following TypeScript code for AgoraLiveStream (and its parent page) and AgoraViewer (and its parent page). Focus on reducing overall code length by extracting reusable helpers without breaking logic, sequence, or functionality.

Key requirements:
For AgoraLiveStream: Extract helpers for track toggling (e.g., toggleCamera, toggleMic), participant list computation (e.g., computeParticipants), and RTM setup/cleanup (e.g., initRTM, cleanupRTM as standalone functions or hooks).
Apply similar extractions to AgoraViewer for symmetry (e.g., viewer-specific track handling, participant computation, RTM init/cleanup).
Do not alter event sequences, dependencies, or core logic (e.g., preserve order in useEffect hooks and RTM login/subscribe).
Reduce length ONLY via these extractions—keep all features intact.
Add short comments (1-2 lines) for extracted helpers and key sections for maintainability.
Preserve console logs, types, and error handling.
Output the full refactored code for all mentioned components.
Example to put the component like PreviewMode in a separate file.