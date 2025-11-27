import { log } from '@/utils/logger';
import { YouCamAuth } from './auth';
import { 
  SkinConcern, 
  SkinAnalysisRequest, 
  SkinAnalysisResponse,
  TaskResponse,
  TaskStatusResponse 
} from './types';
import sharp from 'sharp';

export class YouCamSkinAnalysis {
  private auth: YouCamAuth;
  private readonly baseUrl = 'https://yce-api-01.perfectcorp.com';
  
  private readonly SD_CONCERNS: SkinConcern[] = [
    'Wrinkle', 'Droopy_upper_eyelid', 'Firmness', 'Acne',
    'Moisture', 'Eye_bag', 'Dark_circle', 'Spots',
    'Radiance', 'Redness', 'Oiliness', 'Pore', 'Texture'
  ];

  private readonly HD_CONCERNS: SkinConcern[] = [
    'HD_Wrinkle', 'HD_Droopy_upper_eyelid', 'HD_Firmness', 'HD_Acne',
    'HD_Moisture', 'HD_Eye_bag', 'HD_Dark_circle', 'HD_Spots',
    'HD_Radiance', 'HD_Redness', 'HD_Oiliness', 'HD_Pore', 'HD_Texture'
  ];

  constructor() {
    this.auth = YouCamAuth.getInstance();
  }

  private validateConcerns(concerns: SkinConcern[]): void {
    const validCounts = [4, 7, 14];
    if (!validCounts.includes(concerns.length)) {
      throw new Error('Must select exactly 4, 7, or 14 skin concerns');
    }

    const isSD = concerns.every(c => this.SD_CONCERNS.includes(c));
    const isHD = concerns.every(c => this.HD_CONCERNS.includes(c));

    if (!isSD && !isHD) {
      throw new Error('Cannot mix SD and HD concerns');
    }
  }

  private async validateAndResizeImage(imageFile: File | Buffer, mode: 'SD' | 'HD' = 'SD'): Promise<{buffer: Buffer, contentType: string}> {
    let inputBuffer: Buffer;
    
    if (imageFile instanceof File) {
      inputBuffer = Buffer.from(await imageFile.arrayBuffer());
    } else {
      inputBuffer = imageFile;
    }

    const meta = await sharp(inputBuffer).metadata();
    log.debug('Original image dimensions:', meta.width, 'x', meta.height);
    
    const longSide = Math.max(meta.width ?? 0, meta.height ?? 0);
    const shortSide = Math.min(meta.width ?? 0, meta.height ?? 0);
    
    // Set limits based on mode
    const maxLongSide = mode === 'HD' ? 2560 : 1920;
    const minShortSide = mode === 'HD' ? 1080 : 480;
    
    log.debug(`Mode: ${mode}, Max long side: ${maxLongSide}, Min short side: ${minShortSide}`);
    log.debug(`Current: Long side: ${longSide}, Short side: ${shortSide}`);
    
    // Check if resizing is needed
    let needsResize = false;
    if (longSide > maxLongSide) {
      needsResize = true;
      log.debug(`Image too large: ${longSide} > ${maxLongSide}`);
    }
    
    if (shortSide < minShortSide) {
      throw new Error(`Image resolution too low: short side ${shortSide} < ${minShortSide}px. Please use a higher resolution image.`);
    }
    
    let processedBuffer = inputBuffer;
    
    if (needsResize) {
      log.debug('Resizing image...');
      
      // Calculate new dimensions while maintaining aspect ratio
      const aspectRatio = (meta.width ?? 0) / (meta.height ?? 0);
      let newWidth: number, newHeight: number;
      
      if ((meta.width ?? 0) >= (meta.height ?? 0)) {
        // Landscape or square
        newWidth = maxLongSide;
        newHeight = Math.round(maxLongSide / aspectRatio);
      } else {
        // Portrait
        newHeight = maxLongSide;
        newWidth = Math.round(maxLongSide * aspectRatio);
      }
      
      log.debug(`Resizing to: ${newWidth} x ${newHeight}`);
      
      processedBuffer = await sharp(inputBuffer)
        .resize(newWidth, newHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 85, 
          mozjpeg: true 
        })
        .toBuffer();
        
      log.debug('Resizing completed');
    }

    return {
      buffer: processedBuffer,
      contentType: 'image/jpeg'
    };
  }

  public async uploadImage(imageFile: File | Buffer, mode: 'SD' | 'HD' = 'SD'): Promise<string> {
    log.debug('\n=== Starting image upload ===');
    
    let fileName = imageFile instanceof File ? imageFile.name : 'image.jpg';
    fileName = fileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    if (!fileName.includes('.')) {
      fileName = `image.jpg`;
    }
    
    const originalFileSize = imageFile instanceof File ? imageFile.size : (imageFile as Buffer).length;
    log.debug('Original file info - Name:', fileName, 'Size:', originalFileSize);
    
    // Check file size limit (10MB)
    if (originalFileSize >= 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }
    
    // Validate and resize image
    const {buffer: processedBuffer, contentType} = await this.validateAndResizeImage(imageFile, mode);
    const fileSize = processedBuffer.length;
    
    log.debug('Processed file info - Size:', fileSize, 'Type:', contentType);

    const endpoint = `${this.baseUrl}/s2s/v1.1/file/skin-analysis`;
    log.debug('Using endpoint:', endpoint);
    
    // Use the working format
    const requestBody = {
      files: [{
        file_name: fileName,
        content_type: contentType,
        file_size: fileSize
      }]
    };
    
    log.debug('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await this.auth.makeAuthenticatedRequest(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    log.debug('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      log.debug('Success response:', JSON.stringify(data, null, 2));
      
      const fileData = data.result?.files?.[0];
      if (!fileData?.file_id) {
        throw new Error('No file_id in response');
      }
      
      // Upload to presigned URL if available
      if (fileData.requests?.[0]?.url) {
        log.debug('Uploading to presigned URL...');
        const uploadUrl = fileData.requests[0].url;
        const requiredHeaders = fileData.requests[0].headers || {};
        
        // Use processed buffer for upload
        const imageData = processedBuffer;

        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: imageData,
          headers: {
            'Content-Type': requiredHeaders['Content-Type'] || contentType,
            'Content-Length': requiredHeaders['Content-Length'] || imageData.byteLength.toString(),
          },
        });

        log.debug('Upload status:', uploadResponse.status);

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          log.debug('Upload error:', errorText);
          throw new Error(`Failed to upload file: ${uploadResponse.status}`);
        }
        
        log.debug('File uploaded successfully to presigned URL');
      }
      
      return fileData.file_id;
    } else {
      const errorText = await response.text();
      log.debug('Upload failed:', errorText);
      throw new Error(`File upload failed: ${response.status}`);
    }
  }

  public async analyzeSkin(request: SkinAnalysisRequest): Promise<string> {
    this.validateConcerns(request.concerns);

    log.debug('\n=== Starting skin analysis task ===');
    
    const endpoint = `${this.baseUrl}/s2s/v1.0/task/skin-analysis`;
    log.debug('Task endpoint:', endpoint);
    
    // Convert concerns to lowercase with underscores for dst_actions
    const dstActions = request.concerns.map(concern => 
      concern.toLowerCase().replace(/_/g, '_')
    );
    
    // Use exact format from documentation
    const payloadFormats = [
      {
        name: 'exact documentation format',
        body: {
          request_id: 0,
          payload: {
            file_sets: {
              src_ids: [request.fileId]
            },
            actions: [
              {
                id: 0,
                params: {},
                dst_actions: dstActions
              }
            ]
          }
        }
      },
      {
        name: 'without request_id',
        body: {
          payload: {
            file_sets: {
              src_ids: [request.fileId]
            },
            actions: [
              {
                id: 0,
                params: {},
                dst_actions: dstActions
              }
            ]
          }
        }
      }
    ];
    
    const errors: string[] = [];
    
    for (const format of payloadFormats) {
      log.debug(`
Trying payload format: ${format.name}`);
      log.debug('Request body:', JSON.stringify(format.body, null, 2));
    
      const response = await this.auth.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(format.body),
      });

      log.debug('Task response status:', response.status);

      if (response.ok) {
        const taskData: TaskResponse = await response.json();
        log.debug('Task created successfully:', taskData);
        return taskData.result.task_id;
      } else {
        const errorText = await response.text();
        log.debug(`Failed with ${format.name}: ${response.status} - ${errorText}`);
        
        try {
          const errorData = JSON.parse(errorText);
          // Extract meaningful error message from server response
          const serverError = errorData.error || errorData.message || errorText;
          const errorCode = errorData.error_code || '';
          const detailedError = errorCode ? `${serverError} (Code: ${errorCode})` : serverError;
          errors.push(`${format.name}: ${detailedError}`);
        } catch {
          // If not valid JSON, use raw error text
          errors.push(`${format.name}: HTTP ${response.status} - ${errorText}`);
        }
      }
    }
    
    // Create comprehensive error message with all server errors
    const errorMessage = `Error: ${errors.join(' | ')}`;
    throw new Error(errorMessage);
  }

  public async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    const encodedTaskId = encodeURIComponent(taskId);
    const endpoint = `${this.baseUrl}/s2s/v1.0/task/skin-analysis?task_id=${encodedTaskId}`;
    
    log.debug('Getting task status from:', endpoint);
    log.debug('Original task ID:', taskId);
    log.debug('Encoded task ID:', encodedTaskId);
    
    const response = await this.auth.makeAuthenticatedRequest(endpoint, {
      method: 'GET',
    });

    log.debug('Task status response:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      log.debug('Task status data:', JSON.stringify(data, null, 2));
      return data;
    } else {
      const errorText = await response.text();
      log.debug(`Task status error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to get task status: ${response.status} - ${errorText}`);
    }
  }

  public async waitForCompletion(
    taskId: string, 
    maxRetries: number = 30
  ): Promise<SkinAnalysisResponse> {
    log.debug('\n=== Waiting for task completion ===');
    
    for (let i = 0; i < maxRetries; i++) {
      log.debug(`Polling attempt ${i + 1}/${maxRetries}`);
      const status = await this.getTaskStatus(taskId);
      
      const taskStatus = status.result.status;
      log.debug('Task status:', taskStatus);
      
      if (taskStatus === 'success') {
        log.debug('Task completed successfully, downloading results...');
        const downloadUrl = status.result.results?.[0]?.data?.[0]?.url;
        if (!downloadUrl) {
          throw new Error('No download URL found in success response');
        }
        return this.downloadResults(downloadUrl);
      }
      
      if (taskStatus === 'error') {
        const errorMsg = status.result.error || status.result.error_message || 'Task failed with error status';
        
        // Provide more helpful error messages for common issues
        let userFriendlyMsg = errorMsg;
        if (errorMsg.includes('error_exceed_max_image_size')) {
          userFriendlyMsg = 'Image resolution is too high. The image has been automatically resized, but please try with a smaller resolution image.';
        } else if (errorMsg.includes('error_below_min_image_size')) {
          userFriendlyMsg = 'Image resolution is too low. Please use an image with at least 480px on the short side';
        } else if (errorMsg.includes('error_lighting_dark')) {
          userFriendlyMsg = 'Image is too dark. Please use a brighter, well-lit photo for better skin analysis results.';
        } else if (errorMsg.includes('error_lighting_bright')) {
          userFriendlyMsg = 'Image is too bright or overexposed. Please use a photo with better lighting conditions.';
        } else if (errorMsg.includes('error_no_face')) {
          userFriendlyMsg = 'No face detected in the image. Please ensure the face is clearly visible and centered.';
        } else if (errorMsg.includes('error_multiple_faces')) {
          userFriendlyMsg = 'Multiple faces detected. Please use an image with only one person.';
        } else if (errorMsg.includes('error_face_too_small')) {
          userFriendlyMsg = 'Face is too small in the image. Please use a closer photo where the face takes up more of the image (at least 60% width).';
        }
        
        throw new Error(`Analysis failed: ${userFriendlyMsg}`);
      }
      
      // Poll much more frequently to avoid timeout
      // Use a very short interval to ensure we don't miss the polling window
      const maxPollingInterval = status.result.polling_interval || 300;
      const actualPollingInterval = Math.min(10, maxPollingInterval / 10) * 1000; // Poll every 10 seconds or 1/10 of max interval
      log.debug(`Task still running, max polling interval: ${maxPollingInterval}s, using: ${actualPollingInterval/1000}s`);
      
      await new Promise(resolve => setTimeout(resolve, actualPollingInterval));
    }
    
    throw new Error('Analysis timeout: Task did not complete within expected time');
  }

  private async downloadResults(downloadUrl: string | undefined): Promise<SkinAnalysisResponse> {
    if (!downloadUrl) {
      throw new Error('Download URL is undefined');
    }
    
    log.debug('Downloading results from:', downloadUrl);
    
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download results: ${response.status}`);
    }

    const zipBuffer = await response.arrayBuffer();
    
    return {
      status: 'completed',
      downloadUrl,
      zipData: Buffer.from(zipBuffer),
    };
  }

  public async performFullAnalysis(
    imageFile: File | Buffer,
    concerns: SkinConcern[],
    mode: 'SD' | 'HD' = 'SD'
  ): Promise<SkinAnalysisResponse> {
    const fileId = await this.uploadImage(imageFile, mode);
    
    const taskId = await this.analyzeSkin({
      fileId,
      concerns,
    });
    
    return this.waitForCompletion(taskId);
  }
}
