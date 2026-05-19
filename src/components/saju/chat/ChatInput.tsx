'use client';

import { useRef, useCallback, type KeyboardEvent, type FormEvent } from 'react';
import { Link } from '@/i18n/routing';

interface ChatInputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export default function ChatInput({
  onSubmit,
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 72)}px`;
  }, []);

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const el = textareaRef.current;
      if (!el || !el.value.trim() || disabled) return;
      onSubmit(el.value.trim());
      el.value = '';
      el.style.height = 'auto';
    },
    [onSubmit, disabled],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.nativeEvent.isComposing) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div
      className="sticky bottom-0 px-3 sm:px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      style={{ backgroundColor: '#131318', borderTop: '1px solid rgba(73,68,84,0.2)' }}
    >
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={disabled ? '별을 충전해주세요' : '메시지를 입력하세요...'}
          disabled={disabled}
          onInput={handleResize}
          onKeyDown={handleKeyDown}
          className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm text-[#e4e1e9]
            focus:outline-none
            disabled:cursor-not-allowed
            placeholder:text-[#494454]"
          style={{
            border: '1px solid rgba(73,68,84,0.3)',
            backgroundColor: '#1f1f25',
          }}
          onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(208,188,255,0.4)'; }}
          onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(73,68,84,0.3)'; }}
        />
        <button
          type="submit"
          disabled={disabled}
          className="flex-shrink-0 w-9 h-9 rounded-full text-[#3c0091] flex items-center justify-center
            transition-all disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)' }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </form>
      {disabled && (
        <p className="text-xs text-gray-600 mt-1.5 text-center">
          <Link href="/coin-shop" className="text-purple-400 hover:text-purple-300">
            코인샵에서 별 충전하기 →
          </Link>
        </p>
      )}
    </div>
  );
}
