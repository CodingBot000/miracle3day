import { log } from '@/utils/logger';
import crypto from 'crypto';

interface AuthResponse {
  status: number;
  result: {
    access_token: string;
  };
}

export class YouCamAuth {
  private static instance: YouCamAuth;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private readonly TOKEN_VALIDITY_MS = 3600000;

  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly authEndpoint = 'https://yce-api-01.perfectcorp.com/s2s/v1.0/client/auth';

  private constructor() {
    this.apiKey = process.env.YOU_CAM_API_KEY || '';
    this.secretKey = process.env.YOU_CAM_SECRET_KEY || '';

    if (!this.apiKey || !this.secretKey) {
      throw new Error('YouCam API credentials not configured');
    }
  }

  public static getInstance(): YouCamAuth {
    if (!YouCamAuth.instance) {
      YouCamAuth.instance = new YouCamAuth();
    }
    return YouCamAuth.instance;
  }

  private generateIdToken(): string {
    const timestamp = Date.now();
    const payload = `client_id=${this.apiKey}&timestamp=${timestamp}`;
    
    const publicKey = `-----BEGIN PUBLIC KEY-----
${this.secretKey}
-----END PUBLIC KEY-----`;
    
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(payload)
    );

    return encrypted.toString('base64');
  }

  public async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      log.debug('Using cached access token');
      return this.accessToken;
    }

    log.debug('Generating new access token...');
    const idToken = this.generateIdToken();

    log.debug('Auth endpoint:', this.authEndpoint);
    log.debug('API Key:', this.apiKey.substring(0, 10) + '...');
    
    const response = await fetch(this.authEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.apiKey,
        id_token: idToken,
      }),
    });

    log.debug('Auth response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Auth error response:', errorData);
      throw new Error(`Authentication failed: ${response.status} - ${errorData}`);
    }

    const data: AuthResponse = await response.json();

    if (data.status !== 200 || !data.result?.access_token) {
      throw new Error('Invalid authentication response');
    }

    this.accessToken = data.result.access_token;
    this.tokenExpiry = Date.now() + this.TOKEN_VALIDITY_MS;

    return this.accessToken;
  }

  public async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAccessToken();

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}
