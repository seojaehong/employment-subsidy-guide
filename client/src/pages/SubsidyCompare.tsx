// Design: Dark Fintech Minimal — Side-by-side subsidy comparison table
import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Plus,
  X,
  ArrowRight,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { subsidyData, categoryColors, categories, type SubsidyCategory } from "@/lib/subsidyData";

const MAX_COMPARE = 4;

export default function SubsidyCompare() {
  const [selected, setSelected] = useState<string[]>([]);
  const [filterCat, setFilterCat] = useState<SubsidyCategory | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length < MAX_COMPARE
        ? [...prev, id]
        : prev
    );
  };

  const selectedSubsidies = selected
    .map((id) => subsidyData.find((s) => s.id === id))
    .filter(Boolean) as typeof subsidyData;

  const filteredList = filterCat
    ? subsidyData.filter((s) => s.category === filterCat)
    : subsidyData;

  const companyTypes = ["우선지원대상기업", "중견기업", "대규모기업"] as const;

  return (
    <div className="min-h-screen" style={{ background: "#0A0E1A" }}>
      <Navigation />

      {/* Header */}
      <div
        className="pt-24 pb-10"
        style={{
          background: "linear-gradient(180deg, rgba(139,92,246,0.06) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{
                background: "rgba(139,92,246,0.12)",
                border: "1px solid rgba(139,92,246,0.3)",
                color: "#C4B5FD",
              }}
            >
              <BarChart3 size={12} />
              지원금 비교
            </div>
            <h1
              className="text-3xl md:text-4xl font-black mb-2"
              style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}
            >
              지원금 한눈에 비교
            </h1>
            <p className="text-sm" style={{ color: "rgba(248,250,252,0.5)" }}>
              최대 {MAX_COMPARE}개 지원금을 선택해 지원금액·기간·요건을 나란히 비교하세요.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-8">
        {/* Selected chips + Add button */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {selectedSubsidies.map((s) => {
            const color = categoryColors[s.category];
            return (
              <div
                key={s.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
                style={{
                  background: color.bg,
                  border: `1px solid ${color.border}`,
                  color: color.text,
                }}
              >
                {s.name}
                <button onClick={() => toggle(s.id)}>
                  <X size={14} />
                </button>
              </div>
            );
          })}

          {selected.length < MAX_COMPARE && (
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px dashed rgba(255,255,255,0.15)",
                color: "rgba(248,250,252,0.5)",
              }}
              onClick={() => setShowPicker(!showPicker)}
            >
              <Plus size={14} />
              지원금 추가 ({selected.length}/{MAX_COMPARE})
            </button>
          )}

          {selected.length > 0 && (
            <button
              className="ml-auto text-xs px-3 py-2 rounded-xl transition-all"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.15)",
                color: "#F87171",
              }}
              onClick={() => setSelected([])}
            >
              전체 초기화
            </button>
          )}
        </div>

        {/* Picker panel */}
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-5 rounded-2xl mb-8"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: !filterCat ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                  border: !filterCat ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  color: !filterCat ? "#93C5FD" : "rgba(248,250,252,0.5)",
                }}
                onClick={() => setFilterCat(null)}
              >
                전체
              </button>
              {categories.map((cat) => {
                const color = categoryColors[cat];
                const isActive = filterCat === cat;
                return (
                  <button
                    key={cat}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: isActive ? color.bg : "rgba(255,255,255,0.04)",
                      border: isActive ? `1px solid ${color.border}` : "1px solid rgba(255,255,255,0.08)",
                      color: isActive ? color.text : "rgba(248,250,252,0.5)",
                    }}
                    onClick={() => setFilterCat(isActive ? null : cat)}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
              {filteredList.map((s) => {
                const isSelected = selected.includes(s.id);
                const color = categoryColors[s.category];
                const disabled = !isSelected && selected.length >= MAX_COMPARE;
                return (
                  <button
                    key={s.id}
                    className="flex items-center gap-2 p-3 rounded-xl text-left transition-all"
                    style={{
                      background: isSelected ? color.bg : "rgba(255,255,255,0.03)",
                      border: isSelected ? `1px solid ${color.border}` : "1px solid rgba(255,255,255,0.06)",
                      opacity: disabled ? 0.4 : 1,
                      cursor: disabled ? "not-allowed" : "pointer",
                    }}
                    onClick={() => !disabled && toggle(s.id)}
                    disabled={disabled}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isSelected ? color.text : "rgba(255,255,255,0.08)",
                        border: isSelected ? "none" : "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      {isSelected && <CheckCircle2 size={12} style={{ color: "#0A0E1A" }} />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate" style={{ color: isSelected ? color.text : "#F8FAFC" }}>
                        {s.name}
                      </div>
                      <div className="text-xs" style={{ color: "rgba(248,250,252,0.35)" }}>
                        {s.amountLabel}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                color: "#fff",
                opacity: selected.length > 0 ? 1 : 0.4,
              }}
              onClick={() => setShowPicker(false)}
            >
              선택 완료 ({selected.length}개)
            </button>
          </motion.div>
        )}

        {/* Comparison Table */}
        {selectedSubsidies.length >= 2 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-x-auto"
          >
            <div style={{ minWidth: `${200 + selectedSubsidies.length * 220}px` }}>
              {/* Header row */}
              <div className="flex">
                <div
                  className="w-48 flex-shrink-0 p-4 text-xs font-bold uppercase tracking-widest"
                  style={{ color: "rgba(248,250,252,0.3)" }}
                >
                  비교 항목
                </div>
                {selectedSubsidies.map((s) => {
                  const color = categoryColors[s.category];
                  return (
                    <div
                      key={s.id}
                      className="flex-1 p-4 rounded-t-2xl"
                      style={{
                        background: color.bg,
                        border: `1px solid ${color.border}`,
                        borderBottom: "none",
                        minWidth: "200px",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold mb-1" style={{ color: color.text }}>
                            {s.category}
                          </div>
                          <div className="text-sm font-black leading-tight" style={{ color: "#F8FAFC" }}>
                            {s.name}
                          </div>
                          {s.subName && (
                            <div className="text-xs mt-0.5" style={{ color: color.text }}>
                              {s.subName}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => toggle(s.id)}
                          style={{ color: "rgba(248,250,252,0.4)" }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rows */}
              {[
                {
                  label: "지원 금액",
                  render: (s: typeof subsidyData[0]) => {
                    const color = categoryColors[s.category];
                    return (
                      <div>
                        <div className="text-base font-black mb-1" style={{ color: color.text }}>
                          {s.amountLabel}
                        </div>
                        {s.amount.우선지원대상기업 && (
                          <div className="text-xs" style={{ color: "rgba(248,250,252,0.5)" }}>
                            우선: {s.amount.우선지원대상기업.slice(0, 40)}
                          </div>
                        )}
                      </div>
                    );
                  },
                },
                {
                  label: "지원 기간",
                  render: (s: typeof subsidyData[0]) => (
                    <span className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>
                      {s.duration}
                    </span>
                  ),
                },
                {
                  label: "신청 주기",
                  render: (s: typeof subsidyData[0]) => (
                    <span className="text-sm" style={{ color: "rgba(248,250,252,0.7)" }}>
                      {s.applicationCycle}
                    </span>
                  ),
                },
                {
                  label: "주요 요건",
                  render: (s: typeof subsidyData[0]) => (
                    <ul className="space-y-1.5">
                      {s.requirements.slice(0, 3).map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2
                            size={12}
                            className="mt-0.5 flex-shrink-0"
                            style={{ color: "#34D399" }}
                          />
                          <span className="text-xs leading-relaxed" style={{ color: "rgba(248,250,252,0.65)" }}>
                            {req.length > 60 ? req.slice(0, 60) + "…" : req}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  label: "지원 제외",
                  render: (s: typeof subsidyData[0]) =>
                    s.exclusions.length > 0 ? (
                      <ul className="space-y-1.5">
                        {s.exclusions.slice(0, 2).map((exc, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <XCircle
                              size={12}
                              className="mt-0.5 flex-shrink-0"
                              style={{ color: "#F87171" }}
                            />
                            <span className="text-xs leading-relaxed" style={{ color: "rgba(248,250,252,0.55)" }}>
                              {exc.length > 60 ? exc.slice(0, 60) + "…" : exc}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs" style={{ color: "rgba(248,250,252,0.3)" }}>
                        해당 없음
                      </span>
                    ),
                },
                {
                  label: "기업 규모별\n지원금",
                  render: (s: typeof subsidyData[0]) => (
                    <div className="space-y-1.5">
                      {companyTypes.map((type) => {
                        const val = s.amount[type as keyof typeof s.amount];
                        if (!val) return null;
                        return (
                          <div key={type}>
                            <div className="text-xs font-semibold mb-0.5" style={{ color: "rgba(248,250,252,0.4)" }}>
                              {type}
                            </div>
                            <div className="text-xs" style={{ color: "rgba(248,250,252,0.7)" }}>
                              {(val as string).slice(0, 50)}{(val as string).length > 50 ? "…" : ""}
                            </div>
                          </div>
                        );
                      })}
                      {s.amount.공통 && (
                        <div>
                          <div className="text-xs font-semibold mb-0.5" style={{ color: "rgba(248,250,252,0.4)" }}>
                            공통
                          </div>
                          <div className="text-xs" style={{ color: "rgba(248,250,252,0.7)" }}>
                            {s.amount.공통.slice(0, 50)}{s.amount.공통.length > 50 ? "…" : ""}
                          </div>
                        </div>
                      )}
                    </div>
                  ),
                },
              ].map((row, rowIdx, arr) => (
                <div key={row.label} className="flex">
                  <div
                    className="w-48 flex-shrink-0 p-4 flex items-start"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      borderBottom: rowIdx < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      borderRight: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <span
                      className="text-xs font-semibold whitespace-pre-line"
                      style={{ color: "rgba(248,250,252,0.4)" }}
                    >
                      {row.label}
                    </span>
                  </div>
                  {selectedSubsidies.map((s) => {
                    const color = categoryColors[s.category];
                    return (
                      <div
                        key={s.id}
                        className="flex-1 p-4"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: `1px solid ${color.border}`,
                          borderTop: "none",
                          borderBottom: rowIdx < arr.length - 1 ? `1px solid rgba(255,255,255,0.05)` : `1px solid ${color.border}`,
                          minWidth: "200px",
                        }}
                      >
                        {row.render(s)}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* CTA row */}
              <div className="flex">
                <div className="w-48 flex-shrink-0" />
                {selectedSubsidies.map((s) => {
                  const color = categoryColors[s.category];
                  return (
                    <div
                      key={s.id}
                      className="flex-1 p-4 rounded-b-2xl"
                      style={{
                        background: color.bg,
                        border: `1px solid ${color.border}`,
                        borderTop: "none",
                        minWidth: "200px",
                      }}
                    >
                      <Link href={`/subsidies/${s.id}`}>
                        <button
                          className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                          style={{
                            background: "rgba(255,255,255,0.1)",
                            color: color.text,
                            border: `1px solid ${color.border}`,
                          }}
                        >
                          상세 보기
                          <ChevronRight size={12} />
                        </button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Apply to draft */}
            <div className="mt-8 flex justify-center">
              <Link href={`/apply?subsidies=${selected.join(",")}`}>
                <button
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                    color: "#fff",
                    boxShadow: "0 0 25px rgba(59,130,246,0.35)",
                  }}
                >
                  선택한 지원금으로 신청서 초안 생성
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <BarChart3 size={48} className="mx-auto mb-4 opacity-20" style={{ color: "#C4B5FD" }} />
            <p className="text-base font-semibold mb-1" style={{ color: "rgba(248,250,252,0.5)" }}>
              비교할 지원금을 2개 이상 선택해주세요
            </p>
            <p className="text-sm mb-6" style={{ color: "rgba(248,250,252,0.3)" }}>
              위의 '지원금 추가' 버튼을 눌러 선택하세요.
            </p>
            <Link href="/subsidies">
              <button
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "rgba(139,92,246,0.12)",
                  border: "1px solid rgba(139,92,246,0.25)",
                  color: "#C4B5FD",
                }}
              >
                전체 지원금 목록 보기
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="py-8 mt-16"
        style={{
          background: "rgba(5,8,15,0.9)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="container text-center text-xs" style={{ color: "rgba(248,250,252,0.25)" }}>
          본 사이트의 정보는 참고용이며, 실제 지원금 신청 시 관할 고용센터 또는 전문 노무사와 상담하시기 바랍니다.
        </div>
      </footer>
    </div>
  );
}
