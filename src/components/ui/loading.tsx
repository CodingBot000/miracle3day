"use client"

import { Spinner } from "./spinner"

interface LoadingProps {
  text?: string
  size?: "sm" | "md" | "lg"
}

export function Loading({ text = "Loading...", size = "lg" }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Spinner size={size} />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
} 