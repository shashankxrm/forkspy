"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  username: string
  avatar?: string
  size?: "sm" | "md"
  onClick?: () => void
}

export function UserAvatar({ username, avatar, size = "sm", onClick }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
  }

  const Component = onClick ? "button" : "div"

  return (
    <Component onClick={onClick} className={onClick ? "hover:scale-105 transition-transform" : ""}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatar || `/placeholder.svg?height=24&width=24&query=${username}`} />
        <AvatarFallback className="text-xs">{username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
    </Component>
  )
}
