"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { HoverlayHeader } from "./hoverlay-header"
import { HoverlayTabs } from "./hoverlay-tabs"
import { ActivitySection } from "./activity-section"
import { ForksSection } from "./forks-section"
import { FullForksList } from "./full-forks-list"

interface HoverlayProps {
  repo: {
    id: number
    name: string
    recentActivity: {
      forksLast24h: number
      contributors: Array<{
        username: string
        avatar: string
        commitHash: string
        prNumber: number | null
        timeAgo: string
        totalCommits: number
      }>
    }
    recentForks: Array<{
      username: string
      commits: number
      totalCommits: number
      forkedAgo: string
      commitHash: string | null
      commitAgo: string | null
    }>
  }
  triggerRef: React.RefObject<HTMLDivElement>
  isVisible: boolean
  onClose: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function Hoverlay({ repo, triggerRef, isVisible, onClose, onMouseEnter, onMouseLeave }: HoverlayProps) {
  const [activeSection, setActiveSection] = useState<"activity" | "forks">("activity")
  const [showFullForksList, setShowFullForksList] = useState(false)
  const hoverlayRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, placement: "bottom" })

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !hoverlayRef.current) return

    const updatePosition = () => {
      const trigger = triggerRef.current!
      const hoverlay = hoverlayRef.current!
      const triggerRect = trigger.getBoundingClientRect()
      const hoverlayRect = hoverlay.getBoundingClientRect()
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      }

      let top = triggerRect.bottom + 8
      let left = triggerRect.left
      let placement = "bottom"

      // Check if hoverlay would go off the bottom of the screen
      if (top + hoverlayRect.height > viewport.height - 20) {
        top = triggerRect.top - hoverlayRect.height - 8
        placement = "top"
      }

      // Check if hoverlay would go off the right of the screen
      if (left + hoverlayRect.width > viewport.width - 20) {
        left = viewport.width - hoverlayRect.width - 20
      }

      // Check if hoverlay would go off the left of the screen
      if (left < 20) {
        left = 20
      }

      setPosition({ top, left, placement })
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [isVisible, triggerRef, showFullForksList])

  if (!isVisible) return null

  return (
    <div
      ref={hoverlayRef}
      className="fixed z-50 w-80 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        top: position.top,
        left: position.left,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Card className="shadow-lg border-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader className="pb-3">
          <HoverlayHeader title="Repository Activity" onClose={onClose} />

          {!showFullForksList && <HoverlayTabs activeSection={activeSection} onSectionChange={setActiveSection} />}
        </CardHeader>

        <CardContent className="pt-0">
          {showFullForksList ? (
            <FullForksList
              recentForks={repo.recentForks}
              repoName={repo.name}
              onBack={() => setShowFullForksList(false)}
            />
          ) : (
            <>
              {activeSection === "activity" && (
                <ActivitySection recentActivity={repo.recentActivity} repoName={repo.name} />
              )}

              {activeSection === "forks" && (
                <ForksSection
                  recentForks={repo.recentForks}
                  repoName={repo.name}
                  onViewMore={() => setShowFullForksList(true)}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
