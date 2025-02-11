"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from 'next/image';

interface LoadingScannerDarkProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingScannerDark({ size = "md", className }: LoadingScannerDarkProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  const dimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Glow effect */}
      <motion.div
        className={cn("absolute rounded-full bg-white/10 blur-xl", sizeClasses[size])}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Main image container */}
      <motion.div
        className={cn("relative", sizeClasses[size])}
        animate={{
          rotateY: [0, 180, 360],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/forkspy-dark-ViEZTGQPOqJ7kFBZIZ2JH60w1iC0uW.png"
          alt="Loading"
          className="w-full h-full"
          width={dimensions[size].width}
          height={dimensions[size].height}
        />

        {/* Scanning effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
          animate={{
            y: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </motion.div>
    </div>
  )
}

