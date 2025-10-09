export function getImagePath(sectionId: string, imageName: string): string {
  return `/images/k-beauty/section${sectionId.replace(/[^0-9]/g, '')}-${sectionId}/${imageName}`;
}

export function formatSectionKey(key: string): string {
  return `section${key.match(/\d+/) ? key.match(/\d+/)![0] : ''}`;
}

// Parse content array and detect markdown-like formatting
export function parseContent(content: string[]): string[] {
  return content.map(text =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  );
}
