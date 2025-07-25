"use client"

import { Button } from "@/components/ui/button"
import { Activity, GitFork } from "lucide-react"

interface HoverlayTabsProps {
  activeSection: "activity" | "forks"
  onSectionChange: (section: "activity" | "forks") => void
}

export function HoverlayTabs({ activeSection, onSectionChange }: HoverlayTabsProps) {
  return (
    <div className="flex gap-1">
      <Button
        variant={activeSection === "activity" ? "default" : "ghost"}
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => onSectionChange("activity")}
      >
        <Activity className="h-3 w-3 mr-1" />
        Activity
      </Button>
      <Button
        variant={activeSection === "forks" ? "default" : "ghost"}
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => onSectionChange("forks")}
      >
        <GitFork className="h-3 w-3 mr-1" />
        Forks
      </Button>
    </div>
  )
}
