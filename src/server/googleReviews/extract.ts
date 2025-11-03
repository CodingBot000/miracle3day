/**
 * Extract textQuery from searchKey for Google Places search
 * searchKey format: "clinic name|additional info"
 * We only use the part before '|'
 */
export function extractSearchQuery(searchKey: string | null | undefined): string {
  if (!searchKey || typeof searchKey !== 'string') {
    return '';
  }

  const parts = searchKey.split('|');
  return parts[0].trim();
}

/**
 * Validate if searchKey is usable
 */
export function isValidSearchKey(searchKey: string | null | undefined): boolean {
  const query = extractSearchQuery(searchKey);
  return query.length > 0;
}
