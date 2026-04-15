import api from "./apiClient";

/**
 * Ask the chatbot a question.
 * @param {string} prompt
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ assistant: string, link: { label: string, path: string } | null }>}
 */
export async function askBot(prompt, signal) {
  const response = await api.post(
    "/api/chatbot/ask",
    { prompt },
    signal ? { signal } : {}
  );
  return response.data;
}

/**
 * Fetch the user's persistent chat history.
 * @returns {Promise<Array<{ sender: string, text: string, createdAt: string }>>}
 */
export async function fetchHistory() {
  const response = await api.get("/api/chatbot/history");
  return response.data?.messages || [];
}

/**
 * Clear the user's chat history on the backend.
 * @returns {Promise<void>}
 */
export async function clearHistory() {
  await api.delete("/api/chatbot/history");
}
