'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { useFormMode } from '@/contexts/admin/FormModeContext';
import { toast } from 'sonner';

interface FormModeEnforcerProps {
  children: ReactNode;
}

/**
 * FormModeEnforcer
 *
 * Automatically enforces read-only mode on form inputs when mode is 'read'.
 *
 * Features:
 * - Automatically applies readOnly/disabled to all inputs, textareas, and selects
 * - Handles both native HTML elements and React components
 * - Supports escape hatches via data attributes:
 *   - data-enforcer-skip: Skip enforcement for this element and its children
 *   - data-allow-interact: Allow interaction even in read mode
 *
 * Usage:
 * <FormModeEnforcer>
 *   <YourFormContent />
 * </FormModeEnforcer>
 */
export function FormModeEnforcer({ children }: FormModeEnforcerProps) {
  const { isReadMode } = useFormMode();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Toast 중복 방지를 위한 debounce
    let lastToastTime = 0;
    const TOAST_DEBOUNCE_MS = 2000; // 2초 내 중복 토스트 방지

    // Read-only 모드에서 편집 시도 감지
    const handleReadOnlyClick = (e: MouseEvent) => {
      if (!isReadMode) return;

      const target = e.target as HTMLElement;

      // data-allow-interact 속성이 있으면 무시
      if (target.closest('[data-allow-interact]')) {
        return;
      }

      // data-enforcer-skip 속성이 있으면 무시
      if (target.closest('[data-enforcer-skip]')) {
        return;
      }

      // 편집 가능한 요소인지 확인
      const isEditableElement =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLButtonElement &&
         target.type !== 'submit' &&
         target.type !== 'button') ||
        target.getAttribute('contenteditable') === 'true' ||
        target.getAttribute('role') === 'textbox' ||
        // 부모가 편집 가능한 요소인 경우도 포함
        target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]');

      // ✅ disabled 버튼 클릭 감지 (read mode에서 비활성화된 버튼)
      const isDisabledButton =
        (target instanceof HTMLButtonElement && target.disabled) ||
        target.closest('button:disabled');

      // 편집 가능한 요소 또는 disabled 버튼을 클릭했을 때 토스트 표시
      if (isEditableElement || isDisabledButton) {
        const now = Date.now();
        if (now - lastToastTime > TOAST_DEBOUNCE_MS) {
          toast.error('읽기모드입니다. 수정하시려면 우측 상단의 버튼을 눌러 편집모드로 변환 후 수정하세요', {
            id: 'read-only-mode', // 같은 ID로 중복 방지
          });
          lastToastTime = now;
        }
      }
    };

    // 클릭 이벤트 리스너 추가
    container.addEventListener('click', handleReadOnlyClick, true); // capture phase에서 실행

    // Function to lock/unlock an element
    const enforceMode = (element: HTMLElement, shouldLock: boolean) => {
      // Check for escape hatches
      if (element.hasAttribute('data-enforcer-skip')) {
        return; // Skip this element and its children
      }

      if (element.hasAttribute('data-allow-interact')) {
        return; // Allow interaction
      }

      // Handle native form elements
      if (element instanceof HTMLInputElement) {
        if (element.type === 'checkbox' || element.type === 'radio') {
          element.disabled = shouldLock;
        } else {
          element.readOnly = shouldLock;
        }

        // Visual feedback
        if (shouldLock) {
          element.classList.add('cursor-not-allowed', 'bg-gray-50');
        } else {
          element.classList.remove('cursor-not-allowed', 'bg-gray-50');
        }
      } else if (element instanceof HTMLTextAreaElement) {
        element.readOnly = shouldLock;
        if (shouldLock) {
          element.classList.add('cursor-not-allowed', 'bg-gray-50');
        } else {
          element.classList.remove('cursor-not-allowed', 'bg-gray-50');
        }
      } else if (element instanceof HTMLSelectElement) {
        element.disabled = shouldLock;
        if (shouldLock) {
          element.classList.add('cursor-not-allowed', 'bg-gray-50');
        } else {
          element.classList.remove('cursor-not-allowed', 'bg-gray-50');
        }
      } else if (element instanceof HTMLButtonElement) {
        // Only disable buttons that are not explicitly marked to allow interaction
        if (element.type === 'submit' || element.type === 'button') {
          // Check if button has special markers
          const buttonText = element.textContent?.toLowerCase() || '';
          const isNavigationButton =
            buttonText.includes('prev') ||
            buttonText.includes('next') ||
            buttonText.includes('save') ||
            buttonText.includes('draft') ||
            buttonText.includes('preview') ||
            buttonText.includes('home');

          // Don't disable navigation buttons
          if (!isNavigationButton) {
            element.disabled = shouldLock;
          }
        }
      }

      // Handle React components by checking for common input-like classes
      if (element.getAttribute('role') === 'textbox' ||
          element.getAttribute('contenteditable') === 'true') {
        if (shouldLock) {
          element.setAttribute('contenteditable', 'false');
          element.classList.add('cursor-not-allowed', 'bg-gray-50');
        } else {
          element.setAttribute('contenteditable', 'true');
          element.classList.remove('cursor-not-allowed', 'bg-gray-50');
        }
      }
    };

    // Recursively apply enforcement to all form elements
    const applyEnforcement = (node: HTMLElement) => {
      // Check for escape hatches FIRST before processing
      if (node.hasAttribute('data-enforcer-skip')) {
        return; // Skip this element and all its children
      }

      if (node.hasAttribute('data-allow-interact')) {
        return; // Allow interaction on this element
      }

      enforceMode(node, isReadMode);

      // Process children only if not skipped
      Array.from(node.children).forEach((child) => {
        if (child instanceof HTMLElement) {
          applyEnforcement(child);
        }
      });
    };

    // Apply enforcement to all elements
    applyEnforcement(container);

    // Set up MutationObserver to handle dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            applyEnforcement(node);
          }
        });
      });
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      container.removeEventListener('click', handleReadOnlyClick, true);
    };
  }, [isReadMode]);

  return (
    <div ref={containerRef} className="form-mode-enforcer-container">
      {children}
    </div>
  );
}
