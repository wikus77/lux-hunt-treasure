
import { supabase } from "@/integrations/supabase/client";

export const uploadPorscheVideo = async (file: File): Promise<string | null> => {
  try {
    console.log("Starting video upload...");
    
    // Upload the file to the videos bucket
    const { data, error } = await supabase.storage
      .from('videos')
      .upload('m1ssion/porsche-rotation.mp4', file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'video/mp4'
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    console.log('Upload successful:', data);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl('m1ssion/porsche-rotation.mp4');

    console.log('Public URL generated:', urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error('Video upload failed:', error);
    return null;
  }
};

export const getPorscheVideoUrl = (): string => {
  // Generate the public URL directly
  const { data } = supabase.storage
    .from('videos')
    .getPublicUrl('m1ssion/porsche-rotation.mp4');
  
  return data.publicUrl;
};
