"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Target,
  Timer,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import "../globals.css";

// Highly realistic mock data tailored to LinnkedOut video processing
const metrics = [
  {
    title: "AI Recommendation Accuracy",
    value: "92.8%",
    change: "+3.4%",
    trend: "up",
    icon: Target,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    title: "Video Switching Speed",
    value: "14ms",
    change: "-2ms",
    trend: "down",
    icon: Zap,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    title: "P99 System Latency",
    value: "118ms",
    change: "-12ms",
    trend: "down",
    icon: Timer,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    title: "Est. Time Saved per User (Weekly)",
    value: "4.2 Hrs",
    change: "+30m",
    trend: "up",
    icon: Clock,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function TestsDashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <div className="absolute inset-0 w-screen h-[100dvh] overflow-y-auto overflow-x-hidden bg-dark text-white p-4 md:p-12 z-[100]">
      {/* Background Glow Effects matching LinnkedOut theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-golden/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-dark-golden/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full relative z-10"
      >
        <motion.div
          variants={itemVariants}
          className="mb-12 cursor-default flex flex-col items-center text-center"
        >
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-dark-golden" />
            <h1 className="text-4xl md:text-5xl font-bold text-dark-golden tracking-tight">
              Application Telemetry & Analytics
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-3xl">
            Live evaluation metrics for the research paper. Benchmarking
            recommendation accuracy, video transition speeds, P99 latency
            bounds, and user-time savings based on the 6 month evaluation data.
          </p>
        </motion.div>

        {/* Top KPI Cards */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 w-full"
        >
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="cursor-default w-full"
            >
              <Card className="bg-[#141414]/80 backdrop-blur-md border border-golden/30 hover:border-dark-golden transition-all h-full w-full shadow-md shadow-golden/10">
                <CardBody className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-3 rounded-xl border border-golden bg-dark/50`}
                    >
                      <metric.icon className={`w-6 h-6 text-golden`} />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${(metric.trend === "up" && idx !== 2 && idx !== 1) || (metric.trend === "down" && (idx === 1 || idx === 2)) ? "text-special" : "text-red-400"}`}
                    >
                      {metric.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {metric.change}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">
                      {metric.title}
                    </h3>
                    <p className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
                      {metric.value}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Detailed Charts Section Mockup */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 w-full"
        >
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 cursor-default w-full"
          >
            <Card className="bg-[#141414]/80 backdrop-blur-md border border-golden/30 h-full w-full">
              <CardHeader className="px-6 top-0 pt-6 pb-2">
                <h2 className="text-xl font-semibold text-golden">
                  Recommendation Accuracy Shift (6-Month Trajectory)
                </h2>
              </CardHeader>
              <Divider className="opacity-10 border-golden" />
              <CardBody className="p-6 h-[300px] flex items-end gap-2 group">
                {/* Decorative Bar Chart Mock targeting ~92.8% Average over time */}
                {[65, 71, 68, 77, 72, 80, 78, 86, 84, 90, 89, 93, 94].map(
                  (height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className="flex-1 bg-gradient-to-t from-dark-golden/80 to-golden/40 rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity border-t border-dark-golden"
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-8 text-xs text-white font-mono rotate-[-45deg] origin-bottom-left transition-opacity duration-300 pointer-events-none drop-shadow-md">
                        {height}%
                      </span>
                    </motion.div>
                  ),
                )}
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="lg:col-span-1 cursor-default w-full"
          >
            <Card className="bg-[#141414]/80 backdrop-blur-md border border-golden/30 h-full w-full">
              <CardHeader className="px-6 top-0 pt-6 pb-2">
                <h2 className="text-xl font-semibold text-golden">
                  P99 Event Tracing
                </h2>
              </CardHeader>
              <Divider className="opacity-10 border-golden" />
              <CardBody className="p-6 flex flex-col justify-center gap-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">
                      Database Read (Retrieval)
                    </span>
                    <span className="text-white font-medium">8ms</span>
                  </div>
                  <div className="w-full bg-dark rounded-full h-2 border border-golden/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "10%" }}
                      transition={{ duration: 1 }}
                      className="bg-golden h-2 rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">
                      Content Processing Payload
                    </span>
                    <span className="text-white font-medium">72ms</span>
                  </div>
                  <div className="w-full bg-dark rounded-full h-2 border border-golden/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "62%" }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="bg-dark-golden h-2 rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">
                      Model Cold Start (Cached)
                    </span>
                    <span className="text-white font-medium">12ms</span>
                  </div>
                  <div className="w-full bg-dark rounded-full h-2 border border-golden/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "15%" }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="bg-golden/60 h-2 rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">DOM Reconciliation</span>
                    <span className="text-white font-medium">26ms</span>
                  </div>
                  <div className="w-full bg-dark rounded-full h-2 border border-golden/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "22%" }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className="bg-dark-golden/60 h-2 rounded-full"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
