
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Check, AlertCircle } from 'lucide-react';
import { uploadPorscheVideo, getPorscheVideoUrl } from '@/utils/videoUpload';

export const VideoUploadManager: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [publicUrl, setPublicUrl] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('mp4')) {
      setUploadStatus('error');
      console.error('Please select an MP4 file');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      const url = await uploadPorscheVideo(file);
      if (url) {
        setPublicUrl(url);
        setUploadStatus('success');
        console.log('Video uploaded successfully. Public URL:', url);
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const getExistingUrl = () => {
    const url = getPorscheVideoUrl();
    setPublicUrl(url);
    console.log('Public URL for existing video:', url);
  };

  return (
    <div className="p-6 bg-black/90 border border-cyan-500/30 rounded-lg">
      <h2 className="text-xl font-orbitron text-cyan-400 mb-4">
        M1SSION™ Video Upload Manager
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="video-upload" className="block text-sm text-white/70 mb-2">
            Upload Porsche Rotation Video (MP4)
          </label>
          <input
            id="video-upload"
            type="file"
            accept="video/mp4"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-black hover:file:bg-cyan-400"
          />
        </div>

        <Button 
          onClick={getExistingUrl}
          variant="outline"
          className="border-cyan-500/50 text-cyan-400"
        >
          Get Existing Video URL
        </Button>

        {isUploading && (
          <div className="flex items-center space-x-2 text-cyan-400">
            <Upload className="w-4 h-4 animate-spin" />
            <span>Uploading video...</span>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="flex items-center space-x-2 text-green-400">
            <Check className="w-4 h-4" />
            <span>Upload successful!</span>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>Upload failed. Please try again.</span>
          </div>
        )}

        {publicUrl && (
          <div className="mt-4 p-4 bg-black/50 rounded border border-cyan-500/20">
            <h3 className="text-sm font-semibold text-cyan-400 mb-2">Public URL:</h3>
            <code className="text-xs text-white/80 break-all bg-black/50 p-2 rounded block">
              {publicUrl}
            </code>
            <p className="text-xs text-white/60 mt-2">
              This URL can be used in the M1SSION™ PRIZE box for video background.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
