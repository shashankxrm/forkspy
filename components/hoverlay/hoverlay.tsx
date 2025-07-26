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
        commitHash: string | null
        prNumber: number | null
        timeAgo: string | null
        totalCommits: number
        repoOwner: string
        repoName: string
      }>
    }
    recentForks: Array<{
      username: string
      avatar: string
      commits: number
      totalCommits: number
      forkedAgo: string
      commitHash: string | null
      commitAgo: string | null
      repoOwner: string
      repoName: string
    }>
  }
  triggerRef: React.RefObject<HTMLDivElement | null>
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

      const margin = 16 // Margin from screen edges
      let top = triggerRect.bottom + 8
      let left = triggerRect.left
      let placement = "bottom"

      // Vertical positioning
      // Check if hoverlay would go off the bottom of the screen
      if (top + hoverlayRect.height > viewport.height - margin) {
        // Try placing above the trigger
        const topAbove = triggerRect.top - hoverlayRect.height - 8
        if (topAbove >= margin) {
          top = topAbove
          placement = "top"
        } else {
          // If both above and below don't fit, place it in the best available space
          const spaceBelow = viewport.height - triggerRect.bottom - margin
          const spaceAbove = triggerRect.top - margin
          
          if (spaceBelow > spaceAbove) {
            top = triggerRect.bottom + 8
            placement = "bottom"
          } else {
            top = margin
            placement = "top"
          }
        }
      }

      // Horizontal positioning
      // Check if hoverlay would go off the right of the screen
      if (left + hoverlayRect.width > viewport.width - margin) {
        left = viewport.width - hoverlayRect.width - margin
      }

      // Check if hoverlay would go off the left of the screen
      if (left < margin) {
        left = margin
      }

      // Ensure top doesn't go negative or too far down
      if (top < margin) {
        top = margin
      } else if (top + hoverlayRect.height > viewport.height - margin) {
        top = viewport.height - hoverlayRect.height - margin
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
              onBack={() => setShowFullForksList(false)}
            />
          ) : (
            <>
              {activeSection === "activity" && (
                <ActivitySection recentActivity={repo.recentActivity} />
              )}

              {activeSection === "forks" && (
                <ForksSection
                  recentForks={repo.recentForks}
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
