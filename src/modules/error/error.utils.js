/** Regex pattern to extract HTTP status code from error messages */
const HTTP_STATUS_PATTERN = /\[(\d{3})/;
export function classifyError(error) {
  const message = error instanceof Error ? error.message : String(error);
  // Parse HTTP status from error message format: [HttpRequest][404 Not Found]: ...
  const statusMatch = message.match(HTTP_STATUS_PATTERN);
  const status = statusMatch ? Number.parseInt(statusMatch[1], 10) : null;
  if (!status) {
    return {
      type: "network",
      title: "Erreur réseau",
      message: "Impossible de contacter le serveur. Vérifie ta connexion.",
      retryable: true,
      originalError: error,
    };
  }
  if (status === 429) {
    return {
      type: "rate-limit",
      title: "Trop de requêtes",
      message:
        "Tu as effectué trop de recherches. Réessaie dans quelques minutes.",
      retryable: true,
      originalError: error,
    };
  }
  if (status === 404) {
    return {
      type: "not-found",
      title: "Non trouvé",
      message: "La ressource demandée n'existe pas.",
      retryable: false,
      originalError: error,
    };
  }
  if (status >= 500) {
    return {
      type: "server",
      title: "Erreur serveur",
      message: "Le serveur rencontre un problème. Réessaie plus tard.",
      retryable: true,
      originalError: error,
    };
  }
  return {
    type: "client",
    title: "Erreur",
    message: "Une erreur est survenue.",
    retryable: false,
    originalError: error,
  };
}
