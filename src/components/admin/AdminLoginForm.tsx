// components/AdminLoginForm.tsx
"use client";
import { useState } from "react";
import { useNavigation } from "@/hooks/useNavigation";

import InputField from "./InputField";
import { Button } from "../ui/button";
import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { log } from "@/utils/logger";

export default function AdminLoginForm() {
  const { navigate } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      log.info('로그인 시도:', username);

      // 기존 로직: username, password 가 폼 state에 있다고 가정
      const email = `${username}@beautylink.com`;

      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      // Rate Limit 에러 처리 (429)
      if (res.status === 429) {
        setError(`⏱️ ${json.error}`);
        return;
      }

      if (!res.ok) {
        // 로그인 실패 처리 (에러 메시지 표시 등)
        setError("아이디 또는 비밀번호를 확인해주세요.");
        return;
      }

      if (json.ok) {
        // 성공: 서버가 HttpOnly 쿠키로 세션을 이미 심었다.
        // 클라이언트에서는 /admin 으로 라우팅만 하면 된다.
        log.info('로그인 성공:', email);
        navigate("/admin");
      } else {
        setError("아이디 또는 비밀번호를 확인해주세요.");
      }
    } catch (err) {
      console.error('로그인 처리 중 오류:', err);
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 엔터키 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen bg-gray-50">
      {/* <p>현재 개선작업 중입니다.</p> */}
      <div className="text-center mb-8">
          <Image
              src="/admin/logo/logo_mimotok.svg"
              alt="logo"
              width={0}  // dummy
              height={0} // dummy
              style={{ width: "500px", height: "auto" }} // 기본값
             className="w-[200px] h-auto md:w-[300px] lg:w-[386px]"
            />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Mimotok Admin</h1>
       
      
        <p className="text-lg text-gray-600">Please enter your ID and password</p>
      </div>
      <div className="space-y-4 w-full max-w-md p-6 bg-white rounded-lg shadow-lg" onKeyDown={handleKeyDown}>
        <InputField
            label="Login ID"
            type="text"
            name="login_id"
            placeholder="발급받은 로그인 아이디를 입력하세요"
            value={username}
            onChange={e => setUsername(e.target.value)}
            // value={email}
            // onChange={e => setEmail(e.target.value)}
            required
          />

        <InputField
            label="Password"
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

        <Button type="button" onClick={handleLogin} className="w-full" disabled={isLoading}>
          {isLoading ? '로그인 중...' : 'Login'}
        </Button>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>

      <Card className="w-full max-w-md mt-2 p-2 bg-white rounded-lg shadow-lg mb-3">
        <CardContent>
        <p className="text-sm font-bold text-gray-800 mb-2">
          최초 입력하시는 병원이라면.<br />
        <span className="text-sm font-bold text-red-500 mb-2">-썸네일 이미지 1장</span><br />
        <span className="text-sm font-bold text-red-500 mb-2">-병원 이미지 최소 3장에서 최대 7장까지</span><br />
        <span className="text-sm font-bold text-red-500 mb-2">- 의사선생님 사진 각 1장씩 </span><br />
        미리 준비 부탁드립니다.<br />
        (의사선생님 사진은 선택이며 원하지않으시면 디폴트 이미지로 대체됩니다) <br />
        정식 오픈전까지 언제든 수정가능하십니다 <br />
        정식 오픈후에는 변경시 반영에 시간이 소요될수있음을 양해부탁드립니다 <br />
        </p>
        </CardContent>
        </Card>
    </div>
  );
}
