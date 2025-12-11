import { messaging } from '@/lib/firebase-admin';
import { q } from '@/lib/db';
import { TABLE_PUSH_FCM_TOKENS, TABLE_PUSH_HISTORY } from '@/constants/tables';
import { PushType } from '@/models/fcm.dto';

// ===========================
// 다국어 메시지 템플릿
// ===========================

const PUSH_MESSAGES: Record<PushType, Record<string, { title: string; body: string }>> = {
  // 트랜잭션
  appointment_confirmed: {
    en: { title: 'Appointment Confirmed', body: 'Your appointment has been confirmed.' },
    ko: { title: '예약 확정', body: '예약이 확정되었습니다.' },
    ja: { title: '予約確定', body: '予約が確定しました。' },
    zh: { title: '预约确认', body: '您的预约已确认。' },
  },
  appointment_cancelled: {
    en: { title: 'Appointment Cancelled', body: 'Your appointment has been cancelled.' },
    ko: { title: '예약 취소', body: '예약이 취소되었습니다.' },
    ja: { title: '予約キャンセル', body: '予約がキャンセルされました。' },
    zh: { title: '预约取消', body: '您的预约已取消。' },
  },
  appointment_reminder: {
    en: { title: 'Appointment Reminder', body: 'Your appointment is tomorrow.' },
    ko: { title: '예약 알림', body: '내일 예약이 있습니다.' },
    ja: { title: '予約リマインダー', body: '明日予約があります。' },
    zh: { title: '预约提醒', body: '您明天有预约。' },
  },
  consultation_ready: {
    en: { title: 'Consultation Starting Soon', body: 'Your consultation will start in 10 minutes.' },
    ko: { title: '상담 시작 임박', body: '10분 후 상담이 시작됩니다.' },
    ja: { title: '相談開始間近', body: '10分後に相談が始まります。' },
    zh: { title: '咨询即将开始', body: '您的咨询将在10分钟后开始。' },
  },
  consultation_started: {
    en: { title: 'Consultation Started', body: 'Your consultation has started.' },
    ko: { title: '상담 시작', body: '상담이 시작되었습니다.' },
    ja: { title: '相談開始', body: '相談が始まりました。' },
    zh: { title: '咨询开始', body: '您的咨询已开始。' },
  },
  payment_completed: {
    en: { title: 'Payment Completed', body: 'Your payment was successful.' },
    ko: { title: '결제 완료', body: '결제가 완료되었습니다.' },
    ja: { title: '支払い完了', body: '支払いが完了しました。' },
    zh: { title: '支付完成', body: '您的支付已完成。' },
  },
  payment_refunded: {
    en: { title: 'Payment Refunded', body: 'Your payment has been refunded.' },
    ko: { title: '환불 처리', body: '환불이 처리되었습니다.' },
    ja: { title: '返金処理', body: '返金されました。' },
    zh: { title: '退款处理', body: '您的款项已退回。' },
  },
  // 일반
  system_announcement: {
    en: { title: 'System Announcement', body: 'Important announcement.' },
    ko: { title: '시스템 공지', body: '중요한 공지사항입니다.' },
    ja: { title: 'システムお知らせ', body: '重要なお知らせです。' },
    zh: { title: '系统公告', body: '重要公告。' },
  },
  service_maintenance: {
    en: { title: 'Service Maintenance', body: 'Scheduled maintenance.' },
    ko: { title: '서비스 점검', body: '정기 점검 예정입니다.' },
    ja: { title: 'サービス点検', body: '定期点検予定です。' },
    zh: { title: '服务维护', body: '计划维护。' },
  },
  terms_updated: {
    en: { title: 'Terms Updated', body: 'Terms of service updated.' },
    ko: { title: '약관 변경', body: '이용약관이 변경되었습니다.' },
    ja: { title: '利用規約変更', body: '利用規約が変更されました。' },
    zh: { title: '条款更新', body: '服务条款已更新。' },
  },
  review_approved: {
    en: { title: 'Review Approved', body: 'Your review has been approved.' },
    ko: { title: '리뷰 승인', body: '회원님의 리뷰가 승인되었습니다.' },
    ja: { title: 'レビュー承認', body: 'あなたのレビューが承認されました。' },
    zh: { title: '评价已批准', body: '您的评价已获批准。' },
  },
  review_rejected: {
    en: { title: 'Review Rejected', body: 'Your review was rejected.' },
    ko: { title: '리뷰 반려', body: '회원님의 리뷰가 반려되었습니다.' },
    ja: { title: 'レビュー却下', body: 'あなたのレビューが却下されました。' },
    zh: { title: '评价被拒', body: '您的评价已被拒绝。' },
  },
  // 활동
  review_comment: {
    en: { title: 'New Comment', body: 'Someone commented on your review.' },
    ko: { title: '새 댓글', body: '회원님의 리뷰에 댓글이 달렸습니다.' },
    ja: { title: '新しいコメント', body: 'あなたのレビューにコメントがつきました。' },
    zh: { title: '新评论', body: '有人评论了您的评价。' },
  },
  review_like: {
    en: { title: 'New Like', body: 'Someone liked your review.' },
    ko: { title: '새 좋아요', body: '회원님의 리뷰에 좋아요가 추가되었습니다.' },
    ja: { title: '新しいいいね', body: 'あなたのレビューにいいねがつきました。' },
    zh: { title: '新点赞', body: '有人赞了您的评价。' },
  },
  community_comment: {
    en: { title: 'New Comment', body: 'Someone commented on your post.' },
    ko: { title: '새 댓글', body: '회원님의 게시글에 댓글이 달렸습니다.' },
    ja: { title: '新しいコメント', body: 'あなたの投稿にコメントがつきました。' },
    zh: { title: '新评论', body: '有人评论了您的帖子。' },
  },
  community_reply: {
    en: { title: 'New Reply', body: 'Someone replied to your comment.' },
    ko: { title: '새 답글', body: '회원님의 댓글에 답글이 달렸습니다.' },
    ja: { title: '新しい返信', body: 'あなたのコメントに返信がつきました。' },
    zh: { title: '新回复', body: '有人回复了您的评论。' },
  },
  community_like: {
    en: { title: 'New Like', body: 'Someone liked your post.' },
    ko: { title: '새 좋아요', body: '회원님의 게시글에 좋아요가 추가되었습니다.' },
    ja: { title: '新しいいいね', body: 'あなたの投稿にいいねがつきました。' },
    zh: { title: '新点赞', body: '有人赞了您的帖子。' },
  },
  // 마케팅
  promotion_event: {
    en: { title: 'New Event', body: 'Check out our special event!' },
    ko: { title: '새 이벤트', body: '특별 이벤트를 확인하세요!' },
    ja: { title: '新しいイベント', body: '特別イベントをチェック!' },
    zh: { title: '新活动', body: '查看我们的特别活动！' },
  },
  promotion_discount: {
    en: { title: 'Special Discount', body: '50% off this week!' },
    ko: { title: '특별 할인', body: '이번 주 50% 할인!' },
    ja: { title: '特別割引', body: '今週50%オフ！' },
    zh: { title: '特别折扣', body: '本周五折！' },
  },
  promotion_coupon: {
    en: { title: 'Coupon Issued', body: 'You received a new coupon!' },
    ko: { title: '쿠폰 발급', body: '새로운 쿠폰이 발급되었습니다!' },
    ja: { title: 'クーポン発行', body: '新しいクーポンが発行されました！' },
    zh: { title: '优惠券发放', body: '您收到了新的优惠券！' },
  },
  new_hospital: {
    en: { title: 'New Hospital', body: 'A new hospital has joined!' },
    ko: { title: '신규 병원', body: '새로운 병원이 입점했습니다!' },
    ja: { title: '新しい病院', body: '新しい病院が参加しました！' },
    zh: { title: '新医院', body: '新医院已加入！' },
  },
  new_treatment: {
    en: { title: 'New Treatment', body: 'Check out our new treatment!' },
    ko: { title: '신규 시술', body: '새로운 시술을 확인하세요!' },
    ja: { title: '新しい施術', body: '新しい施術をチェック!' },
    zh: { title: '新疗法', body: '查看我们的新疗法！' },
  },
};

// ===========================
// 헬퍼 함수
// ===========================

function getMessage(pushType: PushType, language: string): { title: string; body: string } {
  const messages = PUSH_MESSAGES[pushType];
  return messages[language] || messages['en']; // fallback to English
}

// ===========================
// 푸시 발송 함수
// ===========================

/**
 * 특정 회원에게 푸시 발송
 */
export async function sendPushToMember(
  memberId: string,
  pushType: PushType,
  data?: Record<string, string>
): Promise<{ success: boolean; sentCount: number }> {
  try {
    // 1. 회원의 활성 토큰 조회
    const tokens = await q<{ fcm_token: string; preferred_language: string }>(
      `SELECT fcm_token, preferred_language
       FROM ${TABLE_PUSH_FCM_TOKENS}
       WHERE id_uuid_member = $1
         AND is_active = true`,
      [memberId]
    );

    if (tokens.length === 0) {
      console.log(`[FCM] No active tokens for member: ${memberId}`);
      return { success: false, sentCount: 0 };
    }

    // 2. 언어별로 그룹핑
    const tokensByLanguage = tokens.reduce((acc, token) => {
      const lang = token.preferred_language || 'en';
      if (!acc[lang]) acc[lang] = [];
      acc[lang].push(token.fcm_token);
      return acc;
    }, {} as Record<string, string[]>);

    // 3. 언어별 발송
    let sentCount = 0;
    for (const [lang, fcmTokens] of Object.entries(tokensByLanguage)) {
      const message = getMessage(pushType, lang);

      const response = await messaging.sendEachForMulticast({
        tokens: fcmTokens,
        notification: {
          title: message.title,
          body: message.body,
        },
        data: {
          pushType,
          ...data,
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'mimotok_default',
          },
        },
      });

      sentCount += response.successCount;

      // 실패한 토큰 처리
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (
            errorCode === 'messaging/registration-token-not-registered' ||
            errorCode === 'messaging/invalid-registration-token'
          ) {
            // 토큰 비활성화
            deactivateToken(fcmTokens[idx]);
          }
        }
      });
    }

    // 4. 발송 이력 저장
    await savePushHistory({
      pushType,
      targetType: 'individual',
      targetMemberId: memberId,
      sentCount,
      successCount: sentCount,
      metadata: data,
    });

    return { success: true, sentCount };
  } catch (error) {
    console.error('[FCM Send Error]', error);
    return { success: false, sentCount: 0 };
  }
}

/**
 * 트랜잭션 알림 발송 (예약/상담 테이블에서 회원 ID 조회)
 */
export async function sendTransactionPush(
  resourceType: 'appointment' | 'consultation',
  resourceId: number,
  pushType: PushType,
  data?: Record<string, string>
): Promise<void> {
  try {
    let memberId: string | null = null;

    if (resourceType === 'appointment') {
      const result = await q<{ id_uuid_member: string }>(
        `SELECT id_uuid_member FROM reservations WHERE id = $1`,
        [resourceId]
      );
      memberId = result[0]?.id_uuid_member;
    } else if (resourceType === 'consultation') {
      const result = await q<{ id_uuid_member: string }>(
        `SELECT id_uuid_member FROM consultation_submissions WHERE id = $1`,
        [resourceId]
      );
      memberId = result[0]?.id_uuid_member;
    }

    if (!memberId) {
      console.error(`[FCM] Member not found for ${resourceType}:${resourceId}`);
      return;
    }

    // 토큰 조회 시 로그인 여부 무관 (트랜잭션 알림)
    const tokens = await q<{ fcm_token: string; preferred_language: string }>(
      `SELECT fcm_token, preferred_language
       FROM ${TABLE_PUSH_FCM_TOKENS}
       WHERE id_uuid_member = $1
         AND is_active = true`,
      [memberId]
    );

    if (tokens.length === 0) {
      console.log(`[FCM] No active tokens for member: ${memberId}`);
      return;
    }

    // 발송 (언어별 그룹핑)
    for (const token of tokens) {
      const message = getMessage(pushType, token.preferred_language);

      await messaging.send({
        token: token.fcm_token,
        notification: {
          title: message.title,
          body: message.body,
        },
        data: {
          pushType,
          [`${resourceType}Id`]: resourceId.toString(),
          ...data,
        },
        android: {
          priority: 'high',
        },
      });
    }

    await savePushHistory({
      pushType,
      targetType: 'individual',
      targetMemberId: memberId,
      sentCount: tokens.length,
      metadata: { resourceType, resourceId: resourceId.toString(), ...data },
    });
  } catch (error) {
    console.error('[FCM Transaction Push Error]', error);
  }
}

/**
 * 토큰 비활성화
 */
async function deactivateToken(fcmToken: string): Promise<void> {
  try {
    await q(
      `UPDATE ${TABLE_PUSH_FCM_TOKENS}
       SET is_active = false, updated_at = NOW()
       WHERE fcm_token = $1`,
      [fcmToken]
    );
    console.log(`[FCM] Token deactivated: ${fcmToken.substring(0, 20)}...`);
  } catch (error) {
    console.error('[FCM] Failed to deactivate token', error);
  }
}

/**
 * 발송 이력 저장
 */
async function savePushHistory(data: {
  pushType: string;
  targetType: string;
  targetMemberId?: string;
  sentCount: number;
  successCount?: number;
  metadata?: any;
}): Promise<void> {
  try {
    await q(
      `INSERT INTO ${TABLE_PUSH_HISTORY}
       (push_type, target_type, target_member_id, sent_count, success_count, metadata, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        data.pushType,
        data.targetType,
        data.targetMemberId || null,
        data.sentCount,
        data.successCount || data.sentCount,
        JSON.stringify(data.metadata || {}),
        'completed',
      ]
    );
  } catch (error) {
    console.error('[FCM] Failed to save push history', error);
  }
}

/**
 * 특정 병원의 관리자들에게 푸시 알림 전송
 */
export async function sendPushToAdmins(
  hospitalId: string,
  notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
): Promise<{ sent: number; failed: number }> {
  try {
    // 1. 병원 관리자 이메일 조회
    const adminEmails = await q<{ email: string }>(
      `SELECT UNNEST(authorized_ids) as email
       FROM admin
       WHERE id_uuid_hospital = $1`,
      [hospitalId]
    );

    if (adminEmails.length === 0) {
      console.log(`[FCM Admin] No admins found for hospital ${hospitalId}`);
      return { sent: 0, failed: 0 };
    }

    console.log(`[FCM Admin] Found ${adminEmails.length} admin emails for hospital ${hospitalId}`);

    let sent = 0;
    let failed = 0;

    // 2. 각 관리자의 FCM 토큰 조회 및 푸시 전송
    for (const { email } of adminEmails) {
      // 관리자의 member_id 조회
      const member = await q<{ id_uuid: string }>(
        'SELECT id_uuid FROM members WHERE email = $1 AND role = $2',
        [email, 'hospital_admin']
      );

      if (member.length === 0) {
        console.log(`[FCM Admin] Admin ${email} not found in members table`);
        continue;
      }

      const memberId = member[0].id_uuid;

      // FCM 토큰 조회
      const tokens = await q<{ fcm_token: string }>(
        `SELECT fcm_token
         FROM ${TABLE_PUSH_FCM_TOKENS}
         WHERE id_uuid_member = $1
           AND is_active = true`,
        [memberId]
      );

      console.log(`[FCM Admin] Found ${tokens.length} tokens for admin ${email}`);

      // 각 토큰으로 푸시 전송
      for (const { fcm_token } of tokens) {
        try {
          await messaging.send({
            token: fcm_token,
            notification: {
              title: notification.title,
              body: notification.body,
            },
            data: {
              type: 'new_consultation',
              ...notification.data,
            },
            android: {
              priority: 'high',
              notification: {
                sound: 'default',
                channelId: 'admin_notifications',
              },
            },
          });

          sent++;
          console.log(`[FCM Admin] Push sent to admin ${email}`);
        } catch (error) {
          failed++;
          console.error(`[FCM Admin] Failed to send push to admin ${email}:`, error);
        }
      }
    }

    console.log(`[FCM Admin] Push summary - Sent: ${sent}, Failed: ${failed}`);

    // 발송 이력 저장
    await savePushHistory({
      pushType: 'new_consultation',
      targetType: 'admin',
      sentCount: sent + failed,
      successCount: sent,
      metadata: {
        hospitalId,
        notification,
      },
    });

    return { sent, failed };
  } catch (error) {
    console.error('[FCM Admin] Error in sendPushToAdmins:', error);
    return { sent: 0, failed: 0 };
  }
}
