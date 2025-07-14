# SoundCloud API Server

Express.js server for SoundCloud API integration with pagination support.

## Features

- ✅ SoundCloud track search with pagination
- ✅ CORS configuration for frontend integration
- ✅ Request logging and error handling
- ✅ Security middleware (Helmet)
- ✅ Environment variable configuration
- ✅ Pagination with 6 results per page
- ✅ Next page handling
- ✅ Proper error messages for no more results

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env` file and add your SoundCloud Client ID
   - Get Client ID from: https://soundcloud.com/you/apps

3. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Search Tracks
```
GET /api/soundcloud/search?q={query}&page={page}&limit={limit}
```

**Parameters:**
- `q` (required): Search query
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 6, max: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "tracks": [...],
    "pagination": {
      "current_page": 1,
      "limit": 6,
      "total_items": 6,
      "has_next": true,
      "has_previous": false,
      "next_href": "https://api.soundcloud.com/tracks?..."
    }
  },
  "message": "Found 6 tracks for \"search term\""
}
```

### Get Next Page
```
GET /api/soundcloud/next?nextHref={nextHref}
```

**Parameters:**
- `nextHref` (required): Next page URL from previous search response

**Response:**
```json
{
  "success": true,
  "data": {
    "tracks": [...],
    "pagination": {
      "has_next": false,
      "next_href": null
    }
  },
  "message": "No more results available"
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400`: Bad Request (missing or invalid parameters)
- `401`: Unauthorized (invalid SoundCloud Client ID)
- `404`: Not Found (no more results)
- `408`: Request Timeout
- `429`: Rate Limit Exceeded
- `500`: Internal Server Error

## Logging

- Application logs: `logs/app.log`
- Error logs: `logs/error.log`
- Console output for development

## Security

- CORS configured for frontend integration
- Helmet middleware for security headers
- Request timeout protection
- Input validation

## Environment Variables

```
PORT=3001
SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id_here
NODE_ENV=development
```
