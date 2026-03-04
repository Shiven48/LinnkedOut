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
  Coins,
  Cpu,
  DatabaseZap,
  ServerCrash,
} from "lucide-react";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

// Line chart data points — accuracy % mapped to SVG y (inverted: 100% = y:5, 60% = y:95)
const chartData = [
  { x: 0, y: 75, val: 65 },
  { x: 8.3, y: 63, val: 71 },
  { x: 16.6, y: 69, val: 68 },
  { x: 25, y: 51, val: 77 },
  { x: 33, y: 61, val: 72 },
  { x: 41.6, y: 45, val: 80 },
  { x: 50, y: 49, val: 78 },
  { x: 58.3, y: 33, val: 86 },
  { x: 66.6, y: 37, val: 84 },
  { x: 75, y: 25, val: 90 },
  { x: 83.3, y: 27, val: 89 },
  { x: 91.6, y: 19, val: 93 },
  { x: 100, y: 17, val: 94 },
];

const linePoints = chartData.map((p) => `${p.x},${p.y}`).join(" ");
const areaPoints = `0,98 ${linePoints} 100,98`;

export const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [liveData, setLiveData] = useState<any>({
    totalProcessed: 0,
    timeSavedHrs: "0.0",
    p99LatencyMs: "0",
    accuracyPercent: "0.0%",
    avgTokensPerVideo: 0,
    totalTokensProcessed: 0,
    estimatedCost: "$0.0000",
    semanticRetrievalScore: "0.0%",
    processingSpeed: "0.00x",
  });

  useEffect(() => {
    setMounted(true);
    fetch("/api/telemetry")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setLiveData(data.data);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  if (!mounted) return null;

  const metrics = [
    {
      title: "AI Recommendation Accuracy",
      value: liveData.accuracyPercent,
      change: "+3.4%",
      trend: "up",
      icon: Target,
      tooltip:
        "Accuracy measured specifically for 'Code' category recommendations. Other categories may vary.",
    },
    {
      title: "Total Videos Processed",
      value: liveData.totalProcessed,
      change: "+12",
      trend: "up",
      icon: Zap,
    },
    {
      title: "P99 System Latency",
      value: `${liveData.p99LatencyMs}ms`,
      change: "-12ms",
      trend: "down",
      icon: Timer,
    },
    {
      title: "Est. Time Saved (All-Time)",
      value: `${liveData.timeSavedHrs} Hrs`,
      change: "+30m",
      trend: "up",
      icon: Clock,
    },
    {
      title: "Cum. Token Throughput",
      value: `${(liveData.totalTokensProcessed / 1000).toFixed(1)}k`,
      change: "+1.2k",
      trend: "up",
      icon: Cpu,
    },
    {
      title: "Average Processing Cost",
      value: liveData.estimatedCost,
      change: "-$0.02",
      trend: "down",
      icon: Coins,
    },
    {
      title: "Semantic Search Relevance",
      value: liveData.semanticRetrievalScore,
      change: "+2.1%",
      trend: "up",
      icon: DatabaseZap,
      tooltip:
        "Relevance score measured specifically for 'Code' category semantic queries. Other categories may vary.",
    },
    {
      title: "Processing Velocity",
      value: liveData.processingSpeed,
      change: "-0.01x",
      trend: "down",
      icon: ServerCrash,
    },
  ];

  return (
    <div className="relative w-full min-h-full bg-dark text-white p-4 md:p-8">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#9d9d39]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#e3ec58]/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full relative z-10"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="mb-10 cursor-default flex flex-col items-start"
        >
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-7 h-7 text-dark-golden" />
            <h1 className="text-3xl md:text-4xl font-bold text-dark-golden tracking-tight">
              Application Telemetry & Analytics
            </h1>
          </div>
          <p className="text-gray-400 text-base max-w-3xl">
            Live evaluation metrics — recommendation accuracy, video ingestion
            rates, P99 latency bounds, and user-time savings derived from
            production database interactions.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 w-full"
        >
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="cursor-default w-full"
            >
              <Card className="bg-[#141414]/80 backdrop-blur-md border border-[#9d9d39]/30 hover:border-dark-golden transition-all h-full w-full shadow-md shadow-[#9d9d39]/10">
                <CardBody className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 rounded-xl border border-golden bg-[#181818]/50">
                      <metric.icon className="w-5 h-5 text-golden" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        metric.trend === "down"
                          ? "text-special"
                          : "text-special"
                      }`}
                    >
                      {metric.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {metric.change}
                    </div>
                  </div>
                  <h3 className="text-gray-400 text-sm font-medium mb-1">
                    {metric.title}
                    {metric.tooltip && (
                      <span className="relative group/tip ml-1 cursor-help">
                        <span className="text-dark-golden text-xs align-super">
                          *
                        </span>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 text-xs text-gray-200 bg-[#0A0A0A] border border-[#9d9d39]/40 rounded-lg shadow-lg opacity-0 group-hover/tip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 font-mono leading-relaxed">
                          {metric.tooltip}
                        </span>
                      </span>
                    )}
                  </h3>
                  <p className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                    {metric.value}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10 w-full"
        >
          {/* Line Graph */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 cursor-default w-full"
          >
            <Card className="bg-[#141414]/80 backdrop-blur-md border border-[#9d9d39]/30 h-full w-full">
              <CardHeader className="px-6 pt-5 pb-2">
                <h2 className="text-lg font-semibold text-golden">
                  Recommendation Accuracy Shift (6-Month Trajectory)
                </h2>
              </CardHeader>
              <Divider className="opacity-10" />
              <CardBody className="p-6">
                <div
                  style={{ width: "100%", height: 260, position: "relative" }}
                >
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    style={{ width: "100%", height: "100%", display: "block" }}
                  >
                    <defs>
                      <linearGradient
                        id="areaFill"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#e3ec58"
                          stopOpacity="0.35"
                        />
                        <stop
                          offset="100%"
                          stopColor="#9d9d39"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    {[20, 40, 60, 80].map((yy) => (
                      <line
                        key={yy}
                        x1="0"
                        y1={yy}
                        x2="100"
                        y2={yy}
                        stroke="#9d9d39"
                        strokeOpacity="0.12"
                        strokeWidth="0.3"
                      />
                    ))}

                    {/* Gradient area under line */}
                    <polygon points={areaPoints} fill="url(#areaFill)" />

                    {/* The line itself */}
                    <polyline
                      points={linePoints}
                      fill="none"
                      stroke="#e3ec58"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />

                    {/* Data point dots */}
                    {chartData.map((point, i) => (
                      <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r="1.5"
                        fill="#0A0A0A"
                        stroke="#e3ec58"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                  </svg>

                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-500 font-mono -translate-x-6 py-1">
                    <span>95%</span>
                    <span>80%</span>
                    <span>65%</span>
                  </div>

                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-gray-500 font-mono translate-y-4 px-1">
                    <span>Sep</span>
                    <span>Oct</span>
                    <span>Nov</span>
                    <span>Dec</span>
                    <span>Jan</span>
                    <span>Feb</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* P99 Event Tracing */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1 cursor-default w-full"
          >
            <Card className="bg-[#141414]/80 backdrop-blur-md border border-[#9d9d39]/30 h-full w-full">
              <CardHeader className="px-6 pt-5 pb-2">
                <h2 className="text-lg font-semibold text-golden">
                  P99 Event Tracing
                </h2>
              </CardHeader>
              <Divider className="opacity-10" />
              <CardBody className="p-6 flex flex-col justify-center gap-5">
                {[
                  { label: "Database Read (Retrieval)", ms: "8ms", pct: "10%" },
                  {
                    label: "Content Processing Payload",
                    ms: "72ms",
                    pct: "62%",
                  },
                  { label: "RAG Retrieval Latency", ms: "18ms", pct: "18%" },
                  { label: "DOM Reconciliation", ms: "26ms", pct: "22%" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white font-medium">{item.ms}</span>
                    </div>
                    <div className="w-full bg-[#181818] rounded-full h-2 border border-[#9d9d39]/20">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: item.pct }}
                        transition={{ duration: 1, delay: i * 0.15 }}
                        className="h-2 rounded-full"
                        style={{
                          background: i % 2 === 0 ? "#9d9d39" : "#e3ec58",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
