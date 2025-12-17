"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/admin/api-client";

interface ConsultationSubmission {
  id_uuid: string;
  created_at: string;
  form_version: number;
  private_first_name: string;
  private_last_name: string;
  private_email: string;
  private_age_range: string;
  private_gender: string;
  skin_types: string;
  budget_ranges: string;
  skin_concerns: string[];
  skin_concerns_other: string;
  treatment_areas: string[];
  treatment_areas_other: string;
  medical_conditions: string[];
  medical_conditions_other: string;
  priorities: string[];
  treatment_goals: string[];
  past_treatments: string[];
  past_treatments_side_effect_desc: string;
  anything_else: string;
  visit_path: string;
  visit_path_other: string;
  image_paths: string[];
  country: string;
  korean_phone_number: string | null;
  messengers: any;
  status: string;
  updated_at: string;
  doctor_notes: string;
}

type StatusType = 'New' | 'Done' | 'Retry';

const statusOptions: StatusType[] = ['New', 'Done', 'Retry'];

export default function ConsultationPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ConsultationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRows, setEditingRows] = useState<{[key: string]: {doctor_notes: string, status: StatusType}}>({});
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user !== undefined) {
      checkAuth();
    }
  }, [user]);

  const checkAuth = async () => {
    console.log('🔐 인증 체크 시작');
    try {
      if (!user) {
        console.log('❌ 사용자가 로그인되어 있지 않음');
        router.push('/admin/login');
        return;
      }

      const email = user.email;
      const username = email?.split('@')[0];
      console.log('🏷️ 추출된 사용자명:', username);
      console.log('🔑 환경변수 SUPER_ADMIN:', process.env.NEXT_PUBLIC_SUPER_ADMIN);

      if (username !== process.env.NEXT_PUBLIC_SUPER_ADMIN!) {
        console.log('❌ 권한 없음. 사용자:', username, '필요 권한:', process.env.NEXT_PUBLIC_SUPER_ADMIN);
        router.push('/admin');
        return;
      }
      
      console.log('✅ 인증 성공');
      setCurrentUser(username);
      await fetchSubmissions();
    } catch (error) {
      console.error('💥 Auth check error:', error);
      router.push('/admin/login');
    }
  };

  const fetchSubmissions = async () => {
    console.log('🔍 fetchSubmissions 시작');
    try {
      console.log('📡 API로부터 데이터 조회 중...');

      // Use API endpoint instead of direct Supabase access
      const result = await api.consultation.getAll();

      console.log('📊 API 응답:', result);

      if (!result.success || !result.data) {
        console.error('❌ Error fetching submissions:', result.error);
        setSubmissions([]);
        return;
      }

      const data = result.data.submissions;
      console.log('📊 데이터 개수:', data?.length || 0);

      if (!data || data.length === 0) {
        console.log('⚠️ 데이터가 없습니다.');
        setSubmissions([]);
        return;
      }

      console.log('✅ 데이터 조회 성공:', data.length, '개의 레코드');
      console.log('📝 첫 번째 레코드 샘플:', data[0]);

      // Data is already sorted by the API
      setSubmissions(data || []);
    } catch (error) {
      console.error('💥 fetchSubmissions 예외 발생:', error);
      setSubmissions([]);
    } finally {
      setLoading(false);
      console.log('✅ fetchSubmissions 완료');
    }
  };

  const handleEdit = (id: string, field: 'doctor_notes' | 'status', value: string) => {
    setEditingRows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleUpdate = async (id: string) => {
    const editData = editingRows[id];
    if (!editData) return;

    try {
      // Use API endpoint instead of direct Supabase UPDATE
      const result = await api.consultation.update(id, {
        doctor_notes: editData.doctor_notes,
        status: editData.status
      });

      if (!result.success) {
        console.error('Update error:', result.error);
        return;
      }

      setEditingRows(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      await fetchSubmissions();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const hasChanges = (id: string) => {
    return editingRows[id] !== undefined;
  };

  const formatArrayValue = (value: string[] | null) => {
    if (!value || !Array.isArray(value)) return '';
    return value.join(', ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  console.log('🎨 렌더링 시점 상태:', {
    submissions: submissions.length,
    currentUser,
    loading
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">상담 신청서 조회</h1>
      
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                액션
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">성</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연령대</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">성별</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">피부타입</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예산범위</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">피부고민</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">피부고민(기타)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">치료부위</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">치료부위(기타)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">의료조건</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">의료조건(기타)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">우선순위</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">치료목표</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">과거치료</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">과거치료 부작용</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기타사항</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">방문경로</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">방문경로(기타)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이미지</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">국가</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">메신저</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">의사 메모</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수정일</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => {
              const currentEdit = editingRows[submission.id_uuid];
              const hasEdit = hasChanges(submission.id_uuid);
              
              return (
                <tr key={submission.id_uuid} className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-4 py-2 whitespace-nowrap border-r">
                    {hasEdit ? (
                      <button
                        onClick={() => handleUpdate(submission.id_uuid)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        적용
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 bg-gray-300 text-gray-500 text-sm rounded cursor-not-allowed"
                        disabled
                      >
                        보기
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.id_uuid}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatDate(submission.created_at)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={currentEdit?.status || submission.status || 'New'}
                      onChange={(e) => handleEdit(submission.id_uuid, 'status', e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.private_last_name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.private_first_name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.private_email}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.private_age_range}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.private_gender}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.skin_types}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.budget_ranges}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatArrayValue(submission.skin_concerns)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.skin_concerns_other}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatArrayValue(submission.treatment_areas)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.treatment_areas_other}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatArrayValue(submission.medical_conditions)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.medical_conditions_other}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatArrayValue(submission.priorities)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatArrayValue(submission.treatment_goals)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatArrayValue(submission.past_treatments)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.past_treatments_side_effect_desc}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.anything_else}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.visit_path}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.visit_path_other}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatArrayValue(submission.image_paths)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.country}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.korean_phone_number}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{JSON.stringify(submission.messengers)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    <textarea
                      value={currentEdit?.doctor_notes || submission.doctor_notes || ''}
                      onChange={(e) => handleEdit(submission.id_uuid, 'doctor_notes', e.target.value)}
                      className="border rounded px-2 py-1 min-w-[200px] h-20"
                      placeholder="의사 메모를 입력하세요"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{submission.updated_at ? formatDate(submission.updated_at) : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}