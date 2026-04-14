import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { supabase } from './supabase';
import Toast from 'react-native-simple-toast';

/**
 * Custom helper to convert base64 to Uint8Array/ArrayBuffer
 * This avoids relying on 'atob' which is not available in React Native (Hermes)
 * @param {string} base64 - Base64 string
 * @returns {Uint8Array}
 */
const decodeBase64 = (base64) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  let bufferLength = base64.length * 0.75;
  let len = base64.length;
  let i;
  let p = 0;
  let encoded1, encoded2, encoded3, encoded4;

  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') {
      bufferLength--;
    }
  }

  const arrayBuffer = new Uint8Array(bufferLength);

  for (i = 0; i < len; i += 4) {
    encoded1 = lookup[base64.charCodeAt(i)];
    encoded2 = lookup[base64.charCodeAt(i + 1)];
    encoded3 = lookup[base64.charCodeAt(i + 2)];
    encoded4 = lookup[base64.charCodeAt(i + 3)];

    arrayBuffer[p++] = (encoded1 << 2) | (encoded2 >> 4);
    arrayBuffer[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    arrayBuffer[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }

  return arrayBuffer;
};

/**
 * Utility to pick and upload an image to Supabase Storage
 * @param {string} source - 'library' or 'camera'
 * @param {string} bucket - The name of the bucket (e.g., 'assets')
 * @param {string} folder - The folder path within the bucket
 * @returns {Promise<string|null>} - The public URL of the uploaded image
 */
export const pickAndUploadImage = async (source = 'library', bucket = 'assets', folder = 'profile_pictures') => {
  try {
    const options = {
      mediaType: 'photo',
      quality: 0.7,
      saveToPhotos: source === 'camera',
      includeBase64: true,
    };

    const result = source === 'camera' 
      ? await launchCamera(options) 
      : await launchImageLibrary(options);

    if (result.didCancel) return null;
    if (result.errorCode) {
      Toast.show('Image Picker Error: ' + result.errorMessage);
      return null;
    }

    const file = result.assets[0];
    
    // Size check (5MB = 5 * 1024 * 1024 bytes)
    if (file.fileSize > 5 * 1024 * 1024) {
      Toast.show('Image size must be less than 5MB');
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Toast.show('User not authenticated');
      return null;
    }

    const fileName = `${user.id}_${Date.now()}.${file.uri.split('.').pop()}`;
    const filePath = `${folder}/${fileName}`;

    if (!file.base64) {
        Toast.show('Failed to get image data');
        return null;
    }

    // Convert base64 to Uint8Array for Supabase upload
    let binaryData;
    try {
        binaryData = decodeBase64(file.base64);
    } catch (e) {
        console.error('Base64 decoding error:', e);
        Toast.show('Image processing error');
        return null;
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, binaryData.buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('Supabase Store Error:', error);
      Toast.show('Upload failed: ' + error.message);
      return null;
    }

    // Get public URL (Supabase returns { data: { publicUrl } } or { publicURL })
    const urlResult = supabase.storage.from(bucket).getPublicUrl(filePath);
    const publicUrl =
      urlResult?.data?.publicUrl ?? urlResult?.data?.publicURL ?? urlResult?.publicURL;
    if (!publicUrl) {
      console.error('getPublicUrl returned no URL:', urlResult);
      Toast.show('Upload succeeded but could not get image URL');
      return null;
    }
    return publicUrl;
  } catch (error) {
    console.error('Image Upload Exception:', error);
    Toast.show('An unexpected error occurred during upload');
    return null;
  }
};
