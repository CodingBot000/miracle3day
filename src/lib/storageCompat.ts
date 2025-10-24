const AWS_BASE = (process.env.NEXT_PUBLIC_LIGHTSAIL_ENDPOINT ||
  process.env.LIGHTSAIL_ENDPOINT ||
  '').replace(/\/+$/, '');

type ListItem = {
  name?: string | null;
  key?: string | null;
  size?: number | null;
  lastModified?: string | Date | null;
};

function buildPublicUrl(key: string) {
  if (!AWS_BASE) {
    return `/${key}`;
  }
  return `${AWS_BASE}/${key}`;
}

async function parseJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function createStorageCompat() {
  return {
    from(bucket: string) {
      const normalizedBucket = bucket.replace(/^\//, '').replace(/\/+$/, '');

      return {
        getPublicUrl(path: string) {
          const key = [normalizedBucket, path].filter(Boolean).join('/').replace(/\/+/g, '/');
          return { data: { publicUrl: buildPublicUrl(key) }, error: null as any };
        },

        async list(prefix: string) {
          const searchParams = new URLSearchParams({
            bucket: normalizedBucket,
            prefix,
          });

          try {
            const res = await fetch(`/api/storage/s3/list?${searchParams.toString()}`, {
              method: 'GET',
              cache: 'no-store',
            });
            const json = await parseJson(res);

            if (!res.ok) {
              return { data: [] as ListItem[], error: json ?? { message: 'list failed' } };
            }

            return { data: ((json?.data ?? []) as ListItem[]), error: null };
          } catch (error) {
            return {
              data: [] as ListItem[],
              error: { message: error instanceof Error ? error.message : 'list failed' },
            };
          }
        },

        async remove(paths: string[]) {
          try {
            const res = await fetch('/api/storage/s3/remove', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bucket: normalizedBucket, paths }),
            });
            const json = await parseJson(res);

            if (!res.ok) {
              return { data: null, error: json ?? { message: 'remove failed' } };
            }

            return { data: true, error: null };
          } catch (error) {
            return {
              data: null,
              error: { message: error instanceof Error ? error.message : 'remove failed' },
            };
          }
        },

        async upload(path: string, file: File | Blob, opts?: { upsert?: boolean }) {
          const contentType = (file as any).type || 'application/octet-stream';

          try {
            const res = await fetch('/api/storage/s3/sign-upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bucket: normalizedBucket,
                key: path,
                contentType,
                upsert: !!opts?.upsert,
              }),
            });
            const json = await parseJson(res);

            if (!res.ok || !json?.url) {
              return { data: null, error: json ?? { message: 'sign failed' } };
            }

            const putRes = await fetch(json.url, {
              method: 'PUT',
              headers: { 'Content-Type': contentType },
              body: file,
            });

            if (!putRes.ok) {
              return {
                data: null,
                error: { message: `upload failed (${putRes.status})` },
              };
            }

            return { data: { key: path }, error: null };
          } catch (error) {
            return {
              data: null,
              error: { message: error instanceof Error ? error.message : 'upload failed' },
            };
          }
        },
      };
    },
  };
}
