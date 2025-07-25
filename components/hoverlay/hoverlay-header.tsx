"use client"

import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

interface HoverlayHeaderProps {
  title: string
  onClose: () => void
}

export function HoverlayHeader({ title, onClose }: HoverlayHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
