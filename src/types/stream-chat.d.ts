/**
 * Stream Chat 커스텀 채널 데이터 타입 정의
 */
export interface CustomChannelData {
  hospitalId?: string;
  hospitalShortId?: string;
  userId?: string;
  userShortId?: string;
  userType?: 'customer' | 'hospital';
  hospitalName?: string;
  userName?: string;
}

