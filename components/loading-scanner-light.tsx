"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from 'next/image';

interface LoadingCircuitLightProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingCircuitLight({ size = "md", className }: LoadingCircuitLightProps) {
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
      {/* Outer glow effect */}
      <motion.div
        className={cn("absolute rounded-full bg-sky-400/20 blur-xl", sizeClasses[size])}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Main image container with pulse and rotate */}
      <motion.div
        className={cn("relative", sizeClasses[size])}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          scale: {
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
          rotate: {
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
        }}
      >
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/forkspy-light-sKEDeZLQEnmozK17sO1A1wbZbrY1Vt.png"
          alt="Loading"
          className="w-full h-full"
          width={dimensions[size].width}
          height={dimensions[size].height}
        />

        {/* Circuit energy flow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-sky-400/30 to-transparent"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Nodes highlight effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0"
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
        />
      </motion.div>
    </div>
  )
}

