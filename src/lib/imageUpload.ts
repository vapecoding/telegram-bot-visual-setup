import { supabase } from './supabase';

/**
 * Uploads an image to Supabase Storage
 * @param imageData - Image data (base64 string, blob URL, or http URL)
 * @param fileName - Original file name
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(
  imageData: string,
  fileName: string
): Promise<string> {
  try {
    let blob: Blob;

    // Определяем формат данных и конвертируем в blob
    if (imageData.startsWith('data:image')) {
      // Base64 data URL
      const base64WithoutPrefix = imageData.replace(/^data:image\/\w+;base64,/, '');
      const byteCharacters = atob(base64WithoutPrefix);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: 'image/jpeg' });
    } else if (imageData.startsWith('blob:') || imageData.startsWith('http')) {
      // Blob URL or HTTP URL - fetch and convert to blob
      const response = await fetch(imageData);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      blob = await response.blob();
    } else {
      throw new Error('Unsupported image format');
    }

    // Generate unique file name
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const uniqueFileName = `${timestamp}-${randomStr}-${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('bot-images')
      .upload(uniqueFileName, blob, {
        cacheControl: '604800', // 7 days cache
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('bot-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

/**
 * Uploads multiple images in parallel
 * @param images - Array of { base64Data, fileName } objects
 * @returns Array of public URLs
 */
export async function uploadImages(
  images: Array<{ base64Data: string; fileName: string }>
): Promise<string[]> {
  const uploadPromises = images.map(({ base64Data, fileName }) =>
    uploadImage(base64Data, fileName)
  );

  return Promise.all(uploadPromises);
}
