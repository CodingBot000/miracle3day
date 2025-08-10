# YouCam AI Skin Analysis Integration

## Overview
This module integrates Perfect Corp's YouCam AI Skin Analysis API to provide advanced skin analysis capabilities.

## Features
- **Authentication**: Secure token-based authentication with RSA encryption
- **Image Upload**: Support for JPEG and PNG images up to 10MB
- **Skin Analysis**: Analyze 4, 7, or 14 skin concerns
- **Two Modes**: Standard (SD) and High Definition (HD) analysis
- **Comprehensive Results**: Overall skin score, estimated skin age, and detailed concern scores

## Available Skin Concerns

### Standard (SD) Mode
- Wrinkle
- Droopy_upper_eyelid
- Firmness
- Acne
- Moisture
- Eye_bag
- Dark_circle
- Spots
- Radiance
- Redness
- Oiliness
- Pore
- Texture

### High Definition (HD) Mode
All SD concerns with HD_ prefix for more detailed analysis

## API Endpoints

### POST /api/ai/youcam/skin-analysis
Analyzes skin from an uploaded image.

**Request:**
- `image`: Image file (JPEG/PNG, max 10MB)
- `concerns`: JSON array of skin concerns (exactly 4, 7, or 14)
- `mode`: 'SD' or 'HD' (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "overallScore": 75,
    "skinAge": 28,
    "concerns": [
      {
        "name": "Wrinkles",
        "score": 82,
        "severity": "low"
      }
    ]
  }
}
```

### GET /api/ai/youcam/test
Tests authentication with YouCam API.

## Testing

### Quick Test
1. Start the development server: `npm run dev`
2. Open browser: http://localhost:3000/test-youcam.html
3. Upload an image and select concerns
4. Click "Run Skin Analysis"

### Using the UI
Navigate to http://localhost:3000/ai to use the full interface.

## Implementation Files

- **lib/auth.ts** - Authentication module with RSA encryption
- **lib/skin-analysis.ts** - Main skin analysis service
- **lib/types.ts** - TypeScript type definitions
- **lib/result-parser.ts** - ZIP result parsing and formatting
- **skin-analysis/route.ts** - API endpoint for skin analysis

## Environment Variables

Required in `.env.local`:
```
YOU_CAM_API_KEY=your_api_key
YOU_CAM_SECRET_KEY=your_secret_key
```

## Image Requirements

- **Dimensions**:
  - SD: Long side ≤ 1920px, short side ≥ 480px
  - HD: Long side ≤ 2560px, short side ≥ 1080px
- **File Size**: < 10MB
- **Formats**: JPEG, PNG
- **Face Requirements**: Face width should be > 60% of image width

## Rate Limits
- 250 requests per 300 seconds
- Token validity: ~1 hour (auto-refresh implemented)

## Error Handling
The API includes comprehensive error handling for:
- Invalid image formats or sizes
- Invalid concern selections
- Authentication failures
- Network timeouts
- API rate limits