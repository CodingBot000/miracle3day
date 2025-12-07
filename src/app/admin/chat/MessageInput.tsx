'use client';

import { useState, useRef } from 'react';
import type { Channel } from 'stream-chat';

interface MessageInputProps {
  channel: Channel;
}

export default function MessageInput({ channel }: MessageInputProps) {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      await channel.sendMessage({
        text: text.trim(),
      });
      setText('');
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('메시지 전송에 실패했습니다.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);

      const file = files[0];

      // Upload file to Stream
      const response = await channel.sendImage(file);

      console.log('File uploaded:', response);
    } catch (err) {
      console.error('Failed to upload file:', err);
      alert('파일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-end gap-2">
        {/* File upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="이미지 첨부"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Text input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
          className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={1}
          style={{
            minHeight: '40px',
            maxHeight: '120px',
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || uploading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          전송
        </button>
      </div>

      {uploading && (
        <p className="text-sm text-gray-500 mt-2">파일 업로드 중...</p>
      )}
    </div>
  );
}
