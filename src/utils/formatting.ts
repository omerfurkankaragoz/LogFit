// Shared utility functions for formatting and data processing

const SUPABASE_PROJECT_URL = 'https://ekrhekungvoisfughwuz.supabase.co';
const BUCKET_NAME = 'images';

/**
 * Get the URL for an exercise image from Supabase storage
 * @param gifPath - Path to the GIF file
 * @returns Full URL to the image
 */
export const getImageUrl = (gifPath: string | undefined): string => {
  if (!gifPath) {
    return 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
  }
  const imagePath = gifPath.replace('0.jpg', '1.jpg');
  return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/exercises/${imagePath}`;
};

/**
 * Format a body part name with proper capitalization
 * @param bodyPart - Raw body part name
 * @returns Formatted body part name
 */
export const formatBodyPartName = (bodyPart: string): string => {
  if (!bodyPart) return 'Other';
  if (bodyPart === 'all') return 'Tümü';
  if (bodyPart === 'favorites') return 'Favoriler';
  return bodyPart.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

/**
 * Format duration in seconds to a human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted duration string in Turkish (e.g., "1sa 30dk" means "1 hour 30 minutes", or "45dk" means "45 minutes")
 */
export const formatDuration = (seconds?: number): string => {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  
  if (h > 0) {
    return `${h}sa ${m}dk`; // "sa" = saat (hours), "dk" = dakika (minutes) in Turkish
  }
  return `${m}dk`;
};
