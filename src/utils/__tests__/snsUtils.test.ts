import {
  parseInstagramUrl,
  parseTikTokUrl,
  parseWeChatId,
  parseLineUrl,
  parseWhatsAppUrl,
  parseFacebookUrl,
  parseKakaoTalkUrl,
  parseYouTubeUrl,
  parseTelegramUrl,
} from '../snsUtils';

describe('SNS Utils', () => {
  describe('parseInstagramUrl', () => {
    it('should handle username only', () => {
      const result = parseInstagramUrl('ortaclinic_en');
      expect(result.url).toBe('https://www.instagram.com/ortaclinic_en/');
    });

    it('should handle username with leading slash', () => {
      const result = parseInstagramUrl('/ortaclinic_en');
      expect(result.url).toBe('https://www.instagram.com/ortaclinic_en/');
    });

    it('should handle complete URL', () => {
      const result = parseInstagramUrl('https://www.instagram.com/ortaclinic_en/');
      expect(result.url).toBe('https://www.instagram.com/ortaclinic_en/');
    });

    it('should handle username with @', () => {
      const result = parseInstagramUrl('@ortaclinic_en');
      expect(result.url).toBe('https://www.instagram.com/ortaclinic_en/');
    });
  });

  describe('parseTikTokUrl', () => {
    it('should handle username only', () => {
      const result = parseTikTokUrl('reonedermatology');
      expect(result.url).toBe('https://www.tiktok.com/@reonedermatology');
    });

    it('should handle URL without @', () => {
      const result = parseTikTokUrl('https://www.tiktok.com/reonedermatology');
      expect(result.url).toBe('https://www.tiktok.com/@reonedermatology');
    });

    it('should handle complete URL with @', () => {
      const result = parseTikTokUrl('https://www.tiktok.com/@reonedermatology');
      expect(result.url).toBe('https://www.tiktok.com/@reonedermatology');
    });

    it('should handle username with @', () => {
      const result = parseTikTokUrl('@reonedermatology');
      expect(result.url).toBe('https://www.tiktok.com/@reonedermatology');
    });
  });

  describe('parseWeChatId', () => {
    it('should extract ID from URL', () => {
      const result = parseWeChatId('https://www.ortaclinic.com/zh-CN/wechat');
      expect(result.displayValue).toBe('ortaclinic.com');
      expect(result.isIdOnly).toBe(true);
      expect(result.message).toContain('WeChat');
    });

    it('should handle ID only', () => {
      const result = parseWeChatId('bello_kr');
      expect(result.displayValue).toBe('bello_kr');
      expect(result.isIdOnly).toBe(true);
      expect(result.message).toContain('WeChat');
    });
  });

  describe('parseLineUrl', () => {
    it('should handle complete URL', () => {
      const result = parseLineUrl('https://line.me/R/ti/p/@ortaclinic');
      expect(result.url).toBe('https://line.me/R/ti/p/@ortaclinic');
    });

    it('should add @ if missing in URL', () => {
      const result = parseLineUrl('https://line.me/R/ti/p/ortaclinic');
      expect(result.url).toBe('https://line.me/R/ti/p/@ortaclinic');
    });

    it('should handle ID only', () => {
      const result = parseLineUrl('ortaclinic');
      expect(result.url).toBe('https://line.me/R/ti/p/@ortaclinic');
    });

    it('should handle ID with @', () => {
      const result = parseLineUrl('@ortaclinic');
      expect(result.url).toBe('https://line.me/R/ti/p/@ortaclinic');
    });
  });

  describe('parseWhatsAppUrl', () => {
    it('should handle phone number with formatting', () => {
      const result = parseWhatsAppUrl('+82-10-4391-1171');
      expect(result.url).toBe('https://wa.me/821043911171');
    });

    it('should handle complete wa.me URL', () => {
      const result = parseWhatsAppUrl('https://wa.me/821043911171');
      expect(result.url).toBe('https://wa.me/821043911171');
    });

    it('should remove all non-numeric characters', () => {
      const result = parseWhatsAppUrl('+82 (10) 4391-1171');
      expect(result.url).toBe('https://wa.me/821043911171');
    });
  });

  describe('parseFacebookUrl', () => {
    it('should handle username only', () => {
      const result = parseFacebookUrl('1mmps.eng');
      expect(result.url).toBe('https://www.facebook.com/1mmps.eng/');
    });

    it('should handle complete URL', () => {
      const result = parseFacebookUrl('https://www.facebook.com/1mmps.eng/');
      expect(result.url).toBe('https://www.facebook.com/1mmps.eng/');
    });
  });

  describe('parseKakaoTalkUrl', () => {
    it('should handle account ID only', () => {
      const result = parseKakaoTalkUrl('account123');
      expect(result.url).toBe('https://pf.kakao.com/account123');
    });

    it('should handle complete URL', () => {
      const result = parseKakaoTalkUrl('https://pf.kakao.com/account123');
      expect(result.url).toBe('https://pf.kakao.com/account123');
    });

    it('should handle complete URL with /chat', () => {
      const result = parseKakaoTalkUrl('https://pf.kakao.com/account123/chat');
      expect(result.url).toBe('https://pf.kakao.com/account123/chat');
    });
  });

  describe('parseYouTubeUrl', () => {
    it('should handle complete URL', () => {
      const result = parseYouTubeUrl('https://www.youtube.com/@channelname');
      expect(result.url).toBe('https://www.youtube.com/@channelname');
    });

    it('should handle username with @', () => {
      const result = parseYouTubeUrl('@channelname');
      expect(result.url).toBe('https://www.youtube.com/@channelname');
    });

    it('should handle channel ID', () => {
      const result = parseYouTubeUrl('UCxxxxxx');
      expect(result.url).toBe('https://www.youtube.com/channel/UCxxxxxx');
    });
  });

  describe('parseTelegramUrl', () => {
    it('should handle username only', () => {
      const result = parseTelegramUrl('username');
      expect(result.url).toBe('https://t.me/username');
    });

    it('should handle username with @', () => {
      const result = parseTelegramUrl('@username');
      expect(result.url).toBe('https://t.me/username');
    });

    it('should handle complete URL', () => {
      const result = parseTelegramUrl('https://t.me/username');
      expect(result.url).toBe('https://t.me/username');
    });
  });
});
