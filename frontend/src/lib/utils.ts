import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 여러 Tailwind 클래스를 합쳐주는 유틸 함수
// 예: cn("px-4", isActive && "bg-forest-500") → 조건부 클래스를 깔끔하게 처리
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
