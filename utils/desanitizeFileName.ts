export const desanitizeFileName = (sanitizedFilename: string): string => {
  if (!sanitizedFilename) return '';

  // Find the last dot to separate extension
  const lastDotIndex = sanitizedFilename.lastIndexOf('.');
  let nameWithoutExt = sanitizedFilename;
  let extension = '';
  
  if (lastDotIndex > 0) {
    nameWithoutExt = sanitizedFilename.substring(0, lastDotIndex);
    extension = sanitizedFilename.substring(lastDotIndex); // includes the dot
  }

  // Split by underscores
  const parts = nameWithoutExt.split('_');
  
  // If there are at least 3 parts (userId_content_timestamp), process normally
  if (parts.length >= 3) {
    // Remove the first part (userId) and the last part (timestamp if it's numeric)
    const lastPart = parts[parts.length - 1];
    
    // Check if the last part is a timestamp (all digits and reasonable length)
    const isTimestamp = /^\d{13}$/.test(lastPart); // 13-digit timestamp (milliseconds since epoch)
    
    if (isTimestamp) {
      // Remove userId (first) and timestamp (last), keep everything in between
      const originalNameParts = parts.slice(1, -1);
      const originalName = originalNameParts.join(' '); // Rejoin middle parts with spaces instead of underscores
      return originalName + extension;
    }
  }

  // If pattern doesn't match expected format, return as-is (fallback)
  return sanitizedFilename;
};

// Helper function to check if a filename appears to be sanitized
export const isSanitizedFileName = (filename: string): boolean => {
  if (!filename) return false;
  
  const lastDotIndex = filename.lastIndexOf('.');
  const nameWithoutExt = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  const parts = nameWithoutExt.split('_');
  
  // Check if it has at least 3 parts and the last part is a 13-digit timestamp
  if (parts.length >= 3) {
    const lastPart = parts[parts.length - 1];
    return /^\d{13}$/.test(lastPart);
  }
  
  return false;
};