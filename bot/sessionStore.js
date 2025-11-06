const sessions = new Map();

export function getSession(sessionId) {
  return sessions.get(sessionId) || { slots: {}, last_intent: null, pending_flow: null };
}

export function saveSession(sessionId, sessionData) {
  sessions.set(sessionId, sessionData);
}

export function clearSession(sessionId) {
  sessions.delete(sessionId);
}
