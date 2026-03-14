// Design: Dark Fintech Minimal — Hero + Stats + Category Cards + CTA
// Philosophy: OpenAI Codex × Toss — 권위감 있는 다크 프리미엄 + 명확한 정보 전달
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Building2,
  Baby,
  UserCheck,
  Clock,
  Briefcase,
  Heart,
  MapPin,
  RefreshCw,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { subsidyData, categories, categoryColors, subsidyStats } from "@/lib/subsidyData";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030038200/XC6n9ZU6onukUjjwtTPKYz/hero-bg-nL7QQCqGnFuXL3kaKg2vur.webp";
const CTA_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030038200/XC6n9ZU6onukUjjwtTPKYz/cta-section-bg-T7KUtMtZ88CaHxQHUAKEeb.webp";

// 카운트업 훅
function useCountUp(target: number, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

const categoryIcons: Record<string, React.ReactNode> = {
  고용창출장려금: <Users size={20} />,
  고용안정장려금: <Shield size={20} />,
  고용유지지원금: <Clock size={20} />,
  청년고용장려금: <Zap size={20} />,
  장년고용장려금: <TrendingUp size={20} />,
  고용환경개선장려금: <Building2 size={20} />,
  장애인고용: <Heart size={20} />,
  지역고용촉진지원금: <MapPin size={20} />,
  정규직전환지원: <RefreshCw size={20} />,
};

const categoryDescriptions: Record<string, string> = {
  고용창출장려금: "취약계층 신규채용 시 지원",
  고용안정장려금: "워라밸·출산육아 환경 개선",
  고용유지지원금: "경영위기 시 고용 유지 지원",
  청년고용장려금: "취업애로청년 정규직 채용",
  장년고용장려금: "고령자 고용 및 계속고용",
  고용환경개선장려금: "어린이집·시설 설치 지원",
  장애인고용: "장애인 의무고용 초과 지원",
  지역고용촉진지원금: "고용위기지역 이전·채용",
  정규직전환지원: "비정규직 정규직 전환",
};

const highlights = [
  { icon: <CheckCircle2 size={16} />, text: "2026년 1월 공식 가이드 반영" },
  { icon: <CheckCircle2 size={16} />, text: "고령자 계속고용 2026 가이드 반영" },
  { icon: <CheckCircle2 size={16} />, text: "17개 지원금 제도 수록" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function Home() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const count17 = useCountUp(17, 1200, statsVisible);
  const count9 = useCountUp(9, 1000, statsVisible);
  const count140 = useCountUp(140, 1400, statsVisible);

  return (
    <div className="min-h-screen" style={{ background: "#0A0E1A" }}>
      <Navigation />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(10,14,26,0.85) 0%, rgba(10,14,26,0.6) 50%, rgba(10,14,26,0.8) 100%)",
          }}
        />

        <div className="container relative z-10 pt-24 pb-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 mb-6"
            >
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(59,130,246,0.15)",
                  border: "1px solid rgba(59,130,246,0.35)",
                  color: "#93C5FD",
                }}
              >
                2026년 공식 가이드 기준
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(16,185,129,0.15)",
                  border: "1px solid rgba(16,185,129,0.35)",
                  color: "#6EE7B7",
                }}
              >
                노무법인 위너스
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6"
              style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}
            >
              고용장려금,
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #60A5FA 0%, #34D399 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                지금 바로 확인하세요
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="text-lg md:text-xl leading-relaxed mb-8"
              style={{ color: "rgba(248,250,252,0.65)" }}
            >
              2026년 고용노동부 가이드 기준 고용창출·고용안정·출산육아·청년·장년 등<br className="hidden md:block" />
              17개 고용장려금 제도를 한눈에 확인하고 신청 자격을 검토하세요.
            </motion.p>

            {/* Highlights */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="flex flex-wrap gap-3 mb-10"
            >
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-sm"
                  style={{ color: "rgba(248,250,252,0.55)" }}
                >
                  <span style={{ color: "#34D399" }}>{h.icon}</span>
                  {h.text}
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="flex flex-wrap gap-4"
            >
              <Link href="/check">
                <button
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                    color: "#fff",
                    boxShadow: "0 0 30px rgba(59,130,246,0.4)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 40px rgba(59,130,246,0.6)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(59,130,246,0.4)";
                  }}
                >
                  자격 검토 시작하기
                  <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/subsidies">
                <button
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(248,250,252,0.85)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                  }}
                >
                  전체 지원금 보기
                  <ChevronRight size={18} />
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div
            className="w-5 h-8 rounded-full border flex items-start justify-center pt-1.5"
            style={{ borderColor: "rgba(255,255,255,0.16)" }}
          >
            <div
              className="w-1 h-1.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.32)" }}
            />
          </div>
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section
        ref={statsRef}
        className="py-16"
        style={{
          background: "rgba(15,23,42,0.8)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                value: count17,
                suffix: "개",
                label: "지원금 제도",
                color: "#60A5FA",
              },
              {
                value: count9,
                suffix: "개",
                label: "지원 카테고리",
                color: "#34D399",
              },
              {
                value: count140,
                suffix: "만원",
                label: "월 최대 지원금",
                color: "#FCD34D",
              },
              {
                value: null,
                suffix: "",
                label: "우선지원대상기업 중심",
                special: "SME",
                color: "#C4B5FD",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.15}
                className="text-center"
              >
                <div
                  className="text-4xl md:text-5xl font-black mb-1"
                  style={{ color: stat.color }}
                >
                  {stat.special ? stat.special : `${stat.value}${stat.suffix}`}
                </div>
                <div
                  className="text-sm font-medium"
                  style={{ color: "rgba(248,250,252,0.5)" }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY GRID ────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-14"
          >
            <div className="text-sm font-semibold mb-3" style={{ color: "#60A5FA" }}>
              지원금 카테고리
            </div>
            <h2
              className="text-3xl md:text-4xl font-black mb-4"
              style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}
            >
              9가지 분야의 고용장려금
            </h2>
            <p className="text-base max-w-xl" style={{ color: "rgba(248,250,252,0.55)" }}>
              기업 규모와 상황에 맞는 지원금을 찾아보세요.
              각 카테고리를 클릭하면 상세 내용을 확인할 수 있습니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => {
              const color = categoryColors[cat];
              const count = subsidyData.filter((s) => s.category === cat).length;
              return (
                <motion.div
                  key={cat}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i * 0.08}
                >
                  <Link href={`/subsidies?category=${encodeURIComponent(cat)}`}>
                    <div
                      className="group p-5 rounded-2xl cursor-pointer transition-all duration-300"
                      style={{
                        background: color.bg,
                        border: `1px solid ${color.border}`,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px ${color.border}`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: color.border, color: color.text }}
                        >
                          {categoryIcons[cat]}
                        </div>
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: color.border,
                            color: color.text,
                          }}
                        >
                          {count}개
                        </span>
                      </div>
                      <h3
                        className="text-base font-bold mb-1"
                        style={{ color: "#F8FAFC" }}
                      >
                        {cat}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "rgba(248,250,252,0.5)" }}
                      >
                        {categoryDescriptions[cat]}
                      </p>
                      <div
                        className="mt-3 flex items-center gap-1 text-xs font-medium group-hover:gap-2 transition-all"
                        style={{ color: color.text }}
                      >
                        자세히 보기 <ChevronRight size={12} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHT SUBSIDIES ──────────────────────────── */}
      <section
        className="py-24"
        style={{
          background: "rgba(15,23,42,0.5)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="container">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-14"
          >
            <div className="text-sm font-semibold mb-3" style={{ color: "#34D399" }}>
              주요 지원금
            </div>
            <h2
              className="text-3xl md:text-4xl font-black mb-4"
              style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}
            >
              놓치기 쉬운 핵심 지원금
            </h2>
            <p className="text-base max-w-xl" style={{ color: "rgba(248,250,252,0.55)" }}>
              많은 기업이 신청하지 못하고 있는 주요 지원금입니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subsidyData
              .filter((s) => s.highlight)
              .map((subsidy, i) => {
                const color = categoryColors[subsidy.category];
                return (
                  <motion.div
                    key={subsidy.id}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i * 0.1}
                  >
                    <Link href={`/subsidies/${subsidy.id}`}>
                      <div
                        className="group p-6 rounded-2xl cursor-pointer transition-all duration-300 h-full flex flex-col"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)";
                          (e.currentTarget as HTMLDivElement).style.borderColor = color.border;
                          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                        }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{
                              background: color.bg,
                              border: `1px solid ${color.border}`,
                              color: color.text,
                            }}
                          >
                            {subsidy.category}
                          </span>
                        </div>

                        <h3
                          className="text-lg font-bold mb-1"
                          style={{ color: "#F8FAFC" }}
                        >
                          {subsidy.name}
                        </h3>
                        {subsidy.subName && (
                          <div
                            className="text-sm mb-3"
                            style={{ color: color.text }}
                          >
                            {subsidy.subName}
                          </div>
                        )}

                        <p
                          className="text-sm leading-relaxed flex-1 mb-4"
                          style={{ color: "rgba(248,250,252,0.5)" }}
                        >
                          {subsidy.description.slice(0, 80)}...
                        </p>

                        <div
                          className="mt-auto pt-4 flex items-center justify-between"
                          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <div>
                            <div
                              className="text-xs mb-0.5"
                              style={{ color: "rgba(248,250,252,0.4)" }}
                            >
                              지원 금액
                            </div>
                            <div
                              className="text-base font-bold"
                              style={{ color: color.text }}
                            >
                              {subsidy.amountLabel}
                            </div>
                          </div>
                          <ChevronRight
                            size={18}
                            style={{ color: "rgba(248,250,252,0.3)" }}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <Link href="/subsidies">
              <button
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(248,250,252,0.8)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                }}
              >
                전체 {subsidyStats.totalPrograms}개 지원금 모두 보기
                <ArrowRight size={16} />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="text-sm font-semibold mb-3" style={{ color: "#60A5FA" }}>
              이용 방법
            </div>
            <h2
              className="text-3xl md:text-4xl font-black"
              style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}
            >
              3단계로 간편하게
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {[
              {
                step: "01",
                title: "지원금 안내 확인",
                desc: "17개 고용장려금 제도의 지원요건, 금액, 신청 방법을 공식 가이드 기준으로 확인합니다.",
                color: "#60A5FA",
                icon: <Briefcase size={24} />,
              },
              {
                step: "02",
                title: "자격 요건 검토",
                desc: "기업 규모, 근로자 현황 등을 입력하면 신청 가능한 지원금을 자동으로 확인합니다.",
                color: "#34D399",
                icon: <UserCheck size={24} />,
              },
              {
                step: "03",
                title: "전문가 상담 연결",
                desc: "검토 결과와 보완 항목을 바탕으로 노무법인 위너스와 상담을 진행합니다.",
                color: "#FCD34D",
                icon: <Zap size={24} />,
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.15}
                className="relative z-10 p-6 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="text-xs font-black mb-4"
                  style={{ color: step.color, letterSpacing: "0.1em" }}
                >
                  STEP {step.step}
                </div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: `${step.color}18`,
                    border: `1px solid ${step.color}30`,
                    color: step.color,
                  }}
                >
                  {step.icon}
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: "#F8FAFC" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.5)" }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────── */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          backgroundImage: `url(${CTA_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(10,14,26,0.7)" }}
        />
        <div className="container relative z-10 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2
              className="text-3xl md:text-5xl font-black mb-6"
              style={{
                color: "#F8FAFC",
                letterSpacing: "-0.02em",
                textShadow: "0 0 60px rgba(59,130,246,0.3)",
              }}
            >
              지금 바로 자격 검토를 시작하세요
            </h2>
            <p
              className="text-lg mb-10 max-w-xl mx-auto"
              style={{ color: "rgba(248,250,252,0.6)" }}
            >
              몇 가지 질문에 답하면 귀사에 적합한 고용장려금을 확인할 수 있습니다.
            </p>
            <Link href="/check">
              <button
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                  color: "#fff",
                  boxShadow: "0 0 40px rgba(59,130,246,0.5)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px) scale(1.02)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 60px rgba(59,130,246,0.7)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0) scale(1)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 40px rgba(59,130,246,0.5)";
                }}
              >
                무료 자격 검토 시작
                <ArrowRight size={20} />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer
        className="py-12"
        style={{
          background: "rgba(5,8,15,0.9)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                  style={{ background: "linear-gradient(135deg, #3B82F6, #10B981)" }}
                >
                  ₩
                </div>
                <span className="text-sm font-bold" style={{ color: "#F8FAFC" }}>
                  2026 고용장려금 가이드
                </span>
              </div>
              <p className="text-xs" style={{ color: "rgba(248,250,252,0.35)" }}>
                노무법인 위너스 제공 · 고용노동부 2026 공식 가이드 반영
              </p>
            </div>
            <div className="flex gap-6">
              <Link href="/subsidies">
                <span className="text-xs cursor-pointer hover:text-white/70 transition-colors" style={{ color: "rgba(248,250,252,0.4)" }}>
                  지원금 안내
                </span>
              </Link>
              <Link href="/check">
                <span className="text-xs cursor-pointer hover:text-white/70 transition-colors" style={{ color: "rgba(248,250,252,0.4)" }}>
                  자격 검토
                </span>
              </Link>
            </div>
          </div>
          <div
            className="mt-8 pt-6 text-xs"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              color: "rgba(248,250,252,0.25)",
            }}
          >
            본 검토 결과는 참고용이며, 실제지원금 신청시 노무법인 위너스에 연락주시면 친절하게 상담드리겠습니다.
          </div>
        </div>
      </footer>
    </div>
  );
}
