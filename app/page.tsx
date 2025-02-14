"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { GitFork, Mail, Shield, Github, Twitter, GitBranch, Bell, Users, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes" // Add this import

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme() // Use next-themes hook
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Check if theme is dark
  const isDark = theme === "dark"

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/network-bg.svg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          y: backgroundY,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background to-background z-10" />

      {/* Content */}
      <div className="relative z-20">
        {/* Header */}
        <header className="fixed w-full backdrop-blur-lg bg-background/75 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={
                  isDark
                    ? "/forkspy-dark.png"
                    : "/forkspy-light.png"
                }
                alt="ForkSpy Logo"
                width={40}
                height={40}
                className="w-10 h-10"
                priority
              />
              <span className="text-2xl font-bold">ForkSpy</span>
            </div>
            <Button variant="default" asChild>
              <Link href="/auth/signin">Sign In with GitHub</Link>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500">
                Know When Your Repos Get Forked. Stay Updated Instantly.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                ForkSpy helps you track forks on your GitHub repositories and notifies you instantly when someone forks
                your project. Never miss out on your repo&rsquo;s impact again.
              </p>
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/auth/signin">Start Tracking Repos</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Powerful Features</h2>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              <FeatureCard
                icon={<GitFork className="w-8 h-8 text-cyan-500" />}
                title="Real-time Fork Tracking"
                description="Instantly know when someone forks your repo and take action."
              />
              <FeatureCard
                icon={<Mail className="w-8 h-8 text-cyan-500" />}
                title="Email Notifications"
                description="Receive automatic email alerts whenever a fork happens."
              />
              <FeatureCard
                icon={<Shield className="w-8 h-8 text-cyan-500" />}
                title="Secure & Fast"
                description="Built with performance and security in mind, ensuring smooth tracking."
              />
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <StepCard
                number={1}
                title="Sign in with GitHub"
                description="Quick and secure authentication with your GitHub account"
                icon={<Github className="w-6 h-6" />}
              />
              <StepCard
                number={2}
                title="Select repositories"
                description="Choose which repositories you want to track"
                icon={<GitBranch className="w-6 h-6" />}
              />
              <StepCard
                number={3}
                title="Get notifications"
                description="Receive instant alerts when your repos are forked"
                icon={<Bell className="w-6 h-6" />}
              />
            </div>
          </div>
        </section>

        {/* Use Cases Section (New) */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Who Benefits from ForkSpy?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <UseCaseCard
                icon={<Users className="w-12 h-12 text-cyan-500" />}
                title="Open Source Maintainers"
                description="Stay on top of your project's growth and engage with contributors effectively."
              />
              <UseCaseCard
                icon={<GitBranch className="w-12 h-12 text-cyan-500" />}
                title="Project Managers"
                description="Track how your codebase is being used and forked across different teams."
              />
              <UseCaseCard
                icon={<Zap className="w-12 h-12 text-cyan-500" />}
                title="Individual Developers"
                description="Understand the impact of your personal projects in the developer community."
              />
            </div>
          </div>
        </section>

        {/* Animated Stats Section (New) */}
        <section className="py-20 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">ForkSpy in Numbers</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <AnimatedStat number={10000} label="Repos Tracked" />
              <AnimatedStat number={50000} label="Forks Detected" />
              <AnimatedStat number={5000} label="Happy Users" />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Tracking Your Repos Today!</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers who use ForkSpy to monitor their repository impact and grow their open source
              community.
            </p>
            <Button size="lg" variant="default" className="text-lg px-8" asChild>
              <Link href="/auth/signin">Know Your Repo Impact</Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} ForkSpy. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link href="#" className="text-muted-foreground hover:text-cyan-500 transition-colors">
                  <Github className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-cyan-500 transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div whileHover={{ y: -5 }} className="p-6 rounded-xl bg-card shadow-lg">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}

function StepCard({
  number,
  title,
  description,
  icon,
}: { number: number; title: string; description: string; icon: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="w-16 h-16 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4 relative">
        {number}
        <div className="absolute -right-2 -bottom-2 bg-primary rounded-full p-2">{icon}</div>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}

function UseCaseCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="p-6 rounded-xl bg-card shadow-lg text-center">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}

function AnimatedStat({ number, label }: { number: number; label: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const end = number
    const duration = 2000
    let startTimestamp: number | null = null

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }

    window.requestAnimationFrame(step)
  }, [number])

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100 }}
        className="text-4xl md:text-5xl font-bold mb-2"
      >
        {count.toLocaleString()}+
      </motion.div>
      <p className="text-xl">{label}</p>
    </div>
  )
}

