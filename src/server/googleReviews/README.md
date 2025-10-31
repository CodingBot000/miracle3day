# Google Reviews Caching System

This module implements a database-first approach for Google Places reviews, reducing API calls and improving performance.

## Architecture

```
Client → API Route → Server Utils → Database → (Google API if stale)
```

## Key Features

1. **Database-first**: Always read from cache first
2. **Smart sync**: Only call Google API when data is stale
3. **Configurable cadence**: Each hospital can have custom sync frequency
4. **No data loss**: Reviews are accumulated, not replaced

## Database Tables

### `hospital_google_snapshot`
- Stores rating summary (1:1 with hospital)
- Configurable sync cadence per hospital
- Tracks last sync and last change times

### `hospital_google_reviews`
- Stores individual reviews (1:N with hospital)
- Uses `review_key` as natural identifier
- Accumulates reviews over time (no deletion)

## Usage

### In React Components

```typescript
import { useHospitalGoogleReviews } from '@/hooks/useHospitalGoogleReviews';

function MyComponent({ hospitalId }: { hospitalId: string }) {
  const { data, isLoading, isSyncing } = useHospitalGoogleReviews(hospitalId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Rating: {data?.rating}</p>
      <p>Reviews: {data?.userRatingCount}</p>
      {data?.reviews.map((review, i) => (
        <div key={i}>{review.text.text}</div>
      ))}
    </div>
  );
}
```

### In API Routes

```typescript
import { syncHospitalReviews } from '@/server/googleReviews';

// Trigger sync
const result = await syncHospitalReviews({
  idUuidHospital: 'uuid-here',
  searchKey: 'Hospital Name|Additional Info',
  forceSync: false, // Optional: bypass staleness check
});
```

### Direct Database Access

```typescript
import { getSnapshot, getReviews } from '@/server/googleReviews';

// Get cached summary
const snapshot = await getSnapshot(hospitalId);

// Get cached reviews
const reviews = await getReviews(hospitalId, 5);
```

## API Endpoints

### GET `/api/hospital/[id]/google-reviews`
Returns cached data from database (never calls Google API)

**Response:**
```json
{
  "placeId": "ChIJxxx",
  "rating": 4.8,
  "userRatingCount": 123,
  "lastSyncedAt": "2025-10-30T12:34:56Z",
  "syncCadenceHours": 72,
  "needsSync": false,
  "reviews": [...]
}
```

### POST `/api/hospital/[id]/google-reviews/sync`
Triggers sync from Google Places API to database

**Request Body (optional):**
```json
{
  "forceSync": false
}
```

## Sync Logic

1. **PlaceID Discovery**:
   - Check if `place_id` exists in snapshot
   - If not, extract `searchKey` → search Google Places
   - Cache the `place_id` for future use

2. **Staleness Check**:
   - Calculate: `now() - last_synced_at >= sync_cadence_hours`
   - Skip sync if cache is fresh (unless `forceSync=true`)

3. **Google API Call**:
   - Fetch details from Google Places API
   - Extract rating, userRatingCount, and reviews

4. **Database Update**:
   - Upsert snapshot (rating, userRatingCount)
   - Upsert reviews using `review_key` (prevents duplicates)
   - Update `last_synced_at` and `last_changed_at`

## Configuration

### Sync Cadence
Default: 72 hours (3 days)

You can customize per hospital in the database:
```sql
UPDATE public.hospital_google_snapshot
SET sync_cadence_hours = 24  -- 1 day
WHERE id_uuid_hospital = 'xxx';
```

### Review Key Generation
Reviews are identified by:
```
md5(author_profile_url + '|' + publish_time)
```

This prevents duplicates while allowing updates to existing reviews.

## Error Handling

- Missing `placeId`: Returns empty data, no errors thrown
- Google API errors: Uses cached data if available
- Invalid `searchKey`: Skips sync gracefully
- Network errors: Retries on next sync cycle

## Performance

- **Cache hit**: ~10ms (database query only)
- **Cache miss**: ~1-2s (Google API + database update)
- **Concurrent requests**: React Query deduplication prevents duplicate fetches

## Migration from Old System

### Before (Direct Google API)
```typescript
const { data } = useGooglePlaceReviews(searchKey);
```

### After (DB-first)
```typescript
const { data } = useHospitalGoogleReviews(hospitalId);
```

The new hook returns the same data structure for compatibility.

## Monitoring

Check sync status:
```sql
SELECT
  h.name,
  s.last_synced_at,
  s.sync_cadence_hours,
  now() - s.last_synced_at as time_since_sync,
  CASE
    WHEN now() - s.last_synced_at >= (s.sync_cadence_hours || ' hours')::interval
    THEN 'STALE'
    ELSE 'FRESH'
  END as status
FROM public.hospital_google_snapshot s
JOIN public.hospital h ON h.id_uuid = s.id_uuid_hospital
ORDER BY s.last_synced_at DESC NULLS LAST;
```

## Future Enhancements

1. **Batch sync**: Sync multiple hospitals in background
2. **Webhook notifications**: Alert when reviews change significantly
3. **Review limit**: Keep only latest N reviews per hospital
4. **Translation cache**: Store both original and translated text

## Troubleshooting

### No reviews showing up
- Check if `place_id` is set in snapshot table
- Verify `searchKey` format in hospital table
- Check sync logs for Google API errors

### Data not updating
- Check `last_synced_at` timestamp
- Verify `sync_cadence_hours` setting
- Try manual sync with `forceSync: true`

### Duplicate reviews
- Shouldn't happen due to `review_key` UNIQUE constraint
- If occurs, check `author_profile_url` and `publish_time` values
