import React, { useEffect, useState } from "react";
import {
    FiChevronRight,
    FiChevronLeft,
    FiBarChart2,
    FiUsers,
    FiPieChart,
    FiAlertTriangle,
    FiTrendingUp,
    FiSearch,
    FiX,
} from "react-icons/fi";

import styles from "../styles/EnterpriseDashboard.module.css";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

/**
 * 深度多元演示版：完全使用假数据，无后端依赖
 */

type Position = {
    id: string;
    title: string;
    matchScore: number; // 0-100
    requiredSkills: Record<string, number>;
    candidateSkills: Record<string, number>;
    recommendedTraining: string[];
    notes?: string;
};

type Department = {
    id: string;
    name: string;
    positions: Position[];
};

type FunnelMetrics = {
    applied: number;
    screened: number;
    interviewed: number;
    offered: number;
    hired: number;
    avgTimeToHireDays: number;
    costPerHire: number;
    channelPerformance: { channel: string; conversion: number; cost: number }[];
};

type Metrics = {
    departments: Department[];
    funnel: FunnelMetrics;
    teamRolePrediction: Record<string, number>;
    performancePrediction: {
        predictedScore: number;
        confidence: number;
        drivers: { name: string; impact: number }[];
        history: number[];
    };
    attritionRisk: {
        overallRisk: number;
        factors: { name: string; score: number }[];
        recommendedActions: { action: string; priority: number }[];
    };
};

interface RoleCardProps {
    role: string;
    score: number;
}

const roleDetails: Record<string, { desc: string; suggestion: string }> = {
    Leader: {
        desc: "负责统筹决策与方向制定，协调成员角色与资源配置。",
        suggestion: "强化沟通协作机制，确保战略与执行一致性。",
    },
    Engineer: {
        desc: "负责核心功能研发与系统优化，是团队执行的中坚力量。",
        suggestion: "鼓励知识共享与自动化建设，提升整体开发效率。",
    },
    Analyst: {
        desc: "通过数据驱动洞察团队绩效与策略改进方向。",
        suggestion: "建立多维数据指标体系，推动决策可视化。",
    },
    Designer: {
        desc: "塑造产品视觉与交互体验，连接技术与用户之间的桥梁。",
        suggestion: "强化品牌一致性与反馈机制，提升体验质量。",
    },
};

const RoleCard: React.FC<RoleCardProps> = ({ role, score }) => {
    const [expanded, setExpanded] = useState(false);
    const detail = roleDetails[role] || { desc: "暂无描述", suggestion: "暂无建议" };

    return (
        <div
            className={`${styles.roleCardDark} ${expanded ? styles.roleExpanded : ""}`}
            onClick={() => setExpanded(!expanded)}
        >
            <div className={styles.roleHeaderDark}>
                <span className={styles.roleNameDark}>{role}</span>
                <span className={styles.roleScoreDark}>{(score * 100).toFixed(1)}%</span>
                {expanded ? (
                    <FiChevronUp className={styles.chevronIcon} />
                ) : (
                    <FiChevronDown className={styles.chevronIcon} />
                )}
            </div>

            <div className={styles.roleBarDark}>
                <div
                    className={styles.roleFillDark}
                    style={{ width: `${score * 100}%` }}
                ></div>
            </div>

            {expanded && (
                <div className={styles.roleContentDark}>
                    <p className={styles.roleDescDark}>{detail.desc}</p>
                    <p className={styles.roleSuggestionDark}>
                        <strong>AI建议：</strong>
                        {detail.suggestion}
                    </p>
                </div>
            )}
        </div>
    );
};

const makeFakeMetrics = (): Metrics => {
    const deptSoftware: Department = {
        id: "dept-sw",
        name: "软件技术部",
        positions: [
            {
                id: "sw-dev",
                title: "软件开发工程师",
                matchScore: 88,
                requiredSkills: { "算法与数据结构": 85, "系统设计": 80, "工程实践": 75, "沟通": 60 },
                candidateSkills: { "算法与数据结构": 80, "系统设计": 78, "工程实践": 82, "沟通": 68 },
                recommendedTraining: ["系统设计进阶工作坊", "代码质量与重构训练"],
                notes: "候选人工程实践较强，需提升算法深度。",
            },
            {
                id: "sw-sec",
                title: "安全分析工程师",
                matchScore: 72,
                requiredSkills: { "二进制分析": 80, "渗透测试": 75, "网络安全": 70 },
                candidateSkills: { "二进制分析": 65, "渗透测试": 70, "网络安全": 72 },
                recommendedTraining: ["渗透实战训练营", "漏洞分析习题集"],
                notes: "对渗透测试有基础但需实战经验。",
            },
            {
                id: "sw-algo",
                title: "算法研究工程师",
                matchScore: 91,
                requiredSkills: { "数学基础": 90, "模型设计": 90, "论文阅读": 85 },
                candidateSkills: { "数学基础": 92, "模型设计": 88, "论文阅读": 90 },
                recommendedTraining: ["高级模型训练工作坊"],
                notes: "算法能力优秀，适合核心研发团队。",
            },
        ],
    };

    const deptProduct: Department = {
        id: "dept-prod",
        name: "产品与设计部",
        positions: [
            {
                id: "prod-pm",
                title: "产品经理",
                matchScore: 79,
                requiredSkills: { "需求分析": 85, "沟通协作": 80, "数据感知": 70 },
                candidateSkills: { "需求分析": 78, "沟通协作": 83, "数据感知": 65 },
                recommendedTraining: ["数据驱动决策课程"],
                notes: "沟通较强，需增强数据能力。",
            },
            {
                id: "prod-ux",
                title: "UX 设计师",
                matchScore: 67,
                requiredSkills: { "用户研究": 80, "交互设计": 75, "视觉设计": 70 },
                candidateSkills: { "用户研究": 60, "交互设计": 72, "视觉设计": 70 },
                recommendedTraining: ["用户研究实操"],
            },
        ],
    };

    const funnel: FunnelMetrics = {
        applied: 420,
        screened: 150,
        interviewed: 45,
        offered: 8,
        hired: 5,
        avgTimeToHireDays: 34,
        costPerHire: 8200,
        channelPerformance: [
            { channel: "内推", conversion: 8.0, cost: 1200 },
            { channel: "社招平台", conversion: 3.2, cost: 2300 },
            { channel: "校园", conversion: 5.6, cost: 900 },
            { channel: "猎头", conversion: 10.5, cost: 15000 },
        ],
    };

    return {
        departments: [deptSoftware, deptProduct],
        funnel,
        teamRolePrediction: { Leader: 0.85, Engineer: 0.72, Executor: 0.88, Designer: 0.63, Analyst: 0.7 },
        performancePrediction: {
            predictedScore: 87,
            confidence: 0.78,
            drivers: [
                { name: "技术评分", impact: 0.33 },
                { name: "沟通评分", impact: 0.18 },
                { name: "项目经验", impact: 0.22 },
                { name: "学习力", impact: 0.27 },
            ],
            history: [72, 75, 78, 80, 82, 85, 86, 87],
        },
        attritionRisk: {
            overallRisk: 22,
            factors: [
                { name: "岗位匹配差距", score: 30 },
                { name: "晋升机会", score: 20 },
                { name: "敬业度", score: 18 },
                { name: "薪酬竞争力", score: 10 },
            ],
            recommendedActions: [
                { action: "设立导师制", priority: 1 },
                { action: "明确晋升路径", priority: 2 },
                { action: "技能成长计划", priority: 3 },
            ],
        },
    };
};

const EnterpriseDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedDept, setExpandedDept] = useState<string | null>(null);
    const [expandedPosition, setExpandedPosition] = useState<Position | null>(null);
    const [panelOpen, setPanelOpen] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setMetrics(makeFakeMetrics());
            setLoading(false);
        }, 800);
    }, []);

    const openPositionDetail = (pos: Position) => {
        setExpandedPosition(pos);
        setPanelOpen(true);
    };
    const closePanel = () => {
        setPanelOpen(false);
        setTimeout(() => setExpandedPosition(null), 300);
    };

    if (loading || !metrics) {
        return (
            <div className={styles.loaderContainer}>
                <div className={styles.loader}></div>
                <p>加载中 — 正在准备多维分析视图…</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>企业面试官智能仪表盘（深度多元版）</h1>
                <p className={styles.subtitle}>
                    多层次岗位匹配 / 招聘效能漏斗 / 团队角色与绩效驱动 / 流失风险干预建议
                </p>
            </header>

            <div className={styles.gridWrapper}>
                {/* 左列：岗位匹配 + 招聘漏斗 + 绩效预测 */}
                <div className={styles.leftColumn}>
                    {/* 岗位匹配 */}
                    <section className={`${styles.card} ${styles.largeCard} ${styles.leftCardMargin} fadeIn`}>
                        <div className={styles.cardHeader}>
                            <div>
                                <h2>岗位匹配总览</h2>
                                <p className={styles.cardSub}>按部门 → 岗位展开，查看候选人与岗位的多维匹配与差距</p>
                            </div>
                            <div className={styles.smallBadge}>
                                {metrics.departments.reduce((acc, d) => acc + d.positions.length, 0)} 职位
                            </div>
                        </div>

                        <div className={styles.deptList}>
                            {metrics.departments.map((dpt) => (
                                <div key={dpt.id} className={styles.deptBlock}>
                                    <div className={styles.deptHeader}>
                                        <strong>{dpt.name}</strong>
                                        <button
                                            className={styles.linkBtn}
                                            onClick={() =>
                                                setExpandedDept(expandedDept === dpt.id ? null : dpt.id)
                                            }
                                        >
                                            {expandedDept === dpt.id ? "收起" : "展开"}
                                            <FiChevronRight
                                                className={expandedDept === dpt.id ? styles.rotate180 : ""}
                                            />
                                        </button>
                                    </div>

                                    {expandedDept === dpt.id && (
                                        <div className={styles.positionGrid}>
                                            {dpt.positions.map((pos) => (
                                                <div key={pos.id} className={styles.positionCard}>
                                                    <div className={styles.positionHeader}>
                                                        <strong>{pos.title}</strong>
                                                        <div className={styles.scoreBadge}>{pos.matchScore}</div>
                                                    </div>

                                                    <div className={styles.skillRow}>
                                                        {Object.entries(pos.requiredSkills)
                                                            .slice(0, 3)
                                                            .map(([skill, req]) => {
                                                                const cand = pos.candidateSkills[skill] ?? 0;
                                                                const pct = Math.round((cand / req) * 100);
                                                                const fill = Math.min(100, pct);
                                                                return (
                                                                    <div key={skill} className={styles.skillMini}>
                                                                        <div className={styles.skillLabel}>{skill}</div>
                                                                        <div className={styles.skillBar}>
                                                                            <div
                                                                                className={styles.skillFill}
                                                                                style={{ width: `${fill}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>

                                                    <div className={styles.positionActions}>
                                                        <button
                                                            className={styles.detailBtn}
                                                            onClick={() => openPositionDetail(pos)}
                                                        >
                                                            查看详情
                                                        </button>
                                                        <button
                                                            className={styles.adviseBtn}
                                                            onClick={() =>
                                                                alert(`建议：${pos.recommendedTraining.join(", ")}`)
                                                            }
                                                        >
                                                            推荐培训
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                    {/* 招聘效能漏斗 */}
                    {/* 招聘效能漏斗按部门 & 岗位展开 */}
                    <section className={`${styles.card} ${styles.leftCardMargin} fadeIn`}>
                        <div className={styles.cardHeader}>
                            <div>
                                <h3>招聘效能（按部门 & 岗位）</h3>
                                <p className={styles.cardSub}>按部门与岗位展开，查看每个岗位的转化漏斗和渠道成本</p>
                            </div>
                        </div>

                        <div className={styles.deptList}>
                            {metrics.departments.map((dpt) => (
                                <div key={dpt.id} className={styles.deptBlock}>
                                    <div className={styles.deptHeader}>
                                        <strong>{dpt.name}</strong>
                                        <button
                                            className={styles.linkBtn}
                                            onClick={() =>
                                                setExpandedDept(expandedDept === dpt.id ? null : dpt.id)
                                            }
                                        >
                                            {expandedDept === dpt.id ? "收起" : "展开"}
                                            <FiChevronRight
                                                className={expandedDept === dpt.id ? styles.rotate180 : ""}
                                            />
                                        </button>
                                    </div>

                                    {expandedDept === dpt.id && (
                                        <div className={styles.positionGrid}>
                                            {dpt.positions.map((pos) => (
                                                <div key={pos.id} className={styles.positionCard}>
                                                    <div className={styles.positionHeader}>
                                                        <strong>{pos.title}</strong>
                                                    </div>

                                                    {/* 自定义假数据生成每个岗位的漏斗 */}
                                                    <div className={styles.funnel}>
                                                        {["applied", "screened", "interviewed", "offered", "hired"].map((stage) => {
                                                            const value = Math.max(
                                                                1,
                                                                Math.floor(Math.random() * 50 + 5)
                                                            );
                                                            return (
                                                                <div key={stage} className={styles.funnelRow}>
                                                                    <div className={styles.funnelLabel}>{stage}</div>
                                                                    <div
                                                                        className={styles.funnelBar}
                                                                        style={{ width: `${Math.min(100, value)}%` }}
                                                                    >
                                                                        {value}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        <div className={styles.funnelMeta}>
                                                            <div>平均招聘周期: <strong>{Math.floor(Math.random() * 30 + 20)} 天</strong></div>
                                                            <div>人均成本: <strong>¥{Math.floor(Math.random() * 10000 + 2000)}</strong></div>
                                                        </div>

                                                        <div className={styles.channelSection}>
                                                            <h4>渠道表现</h4>
                                                            {["内推", "社招平台", "校园", "猎头"].map((channel) => {
                                                                const conversion = Math.floor(Math.random() * 15 + 2);
                                                                const cost = Math.floor(Math.random() * 15000 + 500);
                                                                return (
                                                                    <div key={channel} className={styles.channelRow}>
                                                                        <div className={styles.channelName}>{channel}</div>
                                                                        <div className={styles.channelMetric}>
                                                                            <div className={styles.channelBar}>
                                                                                <div className={styles.channelFill} style={{ width: `${Math.min(100, conversion)}%` }} />
                                                                            </div>
                                                                            <div className={styles.channelCost}>¥{cost}</div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>


                    {/* 绩效预测放在左列下方 */}
                    {/* 绩效预测模块 */}
                    <section className={`${styles.card} ${styles.leftCardMargin} fadeIn`}>
                        <div className={styles.cardHeader}>
                            <h3>绩效预测模型</h3>
                            <div className={styles.cardSub}>AI 预测分与团队平均趋势对比</div>
                        </div>

                        <div className={styles.performance}>

                            {/* 双折线图并排显示 */}
                            <div className={styles.dualChartWrapper}>
                                {/** 预测分折线图 **/}
                                <div className={styles.singleChart}>
                                    <div className={styles.chartLabel}>预测分趋势（未来 8 月）</div>
                                    <svg className={styles.compactLineChart} viewBox="0 0 330 120">
                                        {/* 背景网格 */}
                                        {[0, 20, 40, 60, 80, 100].map((y, i) => (
                                            <line key={i} x1="20" y1={120 - y} x2="310" y2={120 - y} stroke="#e5e7eb" strokeWidth="0.5" />
                                        ))}

                                        {/* Y轴 */}
                                        <line x1="20" y1="20" x2="20" y2="120" stroke="#9ca3af" strokeWidth="1" />
                                        <line x1="20" y1="120" x2="310" y2="120" stroke="#9ca3af" strokeWidth="1" />

                                        {/* 模拟数据 */}
                                        {(() => {
                                            const history = [72, 75, 78, 80, 83, 85, 87, 90];
                                            const target = 88;

                                            const points = history.map((v, i) => {
                                                const x = i * 35 + 20;
                                                const y = 120 - v;
                                                return (
                                                    <g key={`p-dot-${i}`}>
                                                        <circle cx={x} cy={y} r={3} fill="#3b82f6" />
                                                        <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fill="#1f2937">{v}</text>
                                                        <text x={x} y={132} textAnchor="middle" fontSize="10" fill="#6b7280">{`M${i + 1}`}</text>
                                                    </g>
                                                );
                                            });

                                            const lines = history.map((v, i, arr) => {
                                                if (i === arr.length - 1) return null;
                                                const x1 = i * 35 + 20;
                                                const y1 = 120 - arr[i];
                                                const x2 = (i + 1) * 35 + 20;
                                                const y2 = 120 - arr[i + 1];
                                                return <line key={`p-line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth={2} />;
                                            });

                                            const targetLine = <line x1={20} y1={120 - target} x2={310} y2={120 - target} stroke="#facc15" strokeWidth={2} strokeDasharray="5 3" />;
                                            const targetLabel = <text x={315} y={120 - target + 4} fontSize="10" fill="#facc15">目标分 {target}</text>;

                                            return [...lines, ...points, targetLine, targetLabel];
                                        })()}

                                        {/* 图例 */}
                                        <text x={25} y={15} fontSize="10" fill="#3b82f6">预测分</text>
                                        <text x={190} y={15} fontSize="10" fill="#facc15">目标分</text>
                                    </svg>

                                    {/* 放大按钮 */}
                                    <button className={styles.chartBtn}>预测分分析</button>
                                    <div className={styles.chartInfo}>
                                        <p>AI 根据候选人历史绩效、岗位技能匹配度及行为特征预测未来绩效。蓝线显示个人成长趋势，整体表现稳步上升。</p>
                                    </div>
                                </div>

                                {/** 团队平均折线图 **/}
                                <div className={styles.singleChart}>
                                    <div className={styles.chartLabel}>团队平均趋势（未来 8 月）</div>
                                    <svg className={styles.compactLineChart} viewBox="0 0 330 120">
                                        {[0, 20, 40, 60, 80, 100].map((y, i) => (
                                            <line key={i} x1="20" y1={120 - y} x2="310" y2={120 - y} stroke="#e5e7eb" strokeWidth="0.5" />
                                        ))}
                                        <line x1="20" y1="20" x2="20" y2="120" stroke="#9ca3af" strokeWidth="1" />
                                        <line x1="20" y1="120" x2="310" y2="120" stroke="#9ca3af" strokeWidth="1" />

                                        {(() => {
                                            const teamAvg = [70, 73, 75, 77, 79, 81, 83, 85];
                                            const target = 88;

                                            const points = teamAvg.map((v, i) => {
                                                const x = i * 35 + 20;
                                                const y = 120 - v;
                                                return (
                                                    <g key={`avg-dot-${i}`}>
                                                        <circle cx={x} cy={y} r={3} fill="#34d399" />
                                                        <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fill="#1f2937">{v}</text>
                                                        <text x={x} y={132} textAnchor="middle" fontSize="10" fill="#6b7280">{`M${i + 1}`}</text>
                                                    </g>
                                                );
                                            });

                                            const lines = teamAvg.map((v, i, arr) => {
                                                if (i === arr.length - 1) return null;
                                                const x1 = i * 35 + 20;
                                                const y1 = 120 - arr[i];
                                                const x2 = (i + 1) * 35 + 20;
                                                const y2 = 120 - arr[i + 1];
                                                return <line key={`avg-line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#34d399" strokeWidth={2} strokeDasharray="4 2" />;
                                            });

                                            const targetLine = <line x1={20} y1={120 - target} x2={310} y2={120 - target} stroke="#facc15" strokeWidth={2} strokeDasharray="5 3" />;
                                            const targetLabel = <text x={315} y={120 - target + 4} fontSize="10" fill="#facc15">目标分 {target}</text>;

                                            return [...lines, ...points, targetLine, targetLabel];
                                        })()}

                                        <text x={25} y={15} fontSize="10" fill="#34d399">团队平均</text>
                                        <text x={190} y={15} fontSize="10" fill="#facc15">目标分</text>
                                    </svg>

                                    <button className={styles.chartBtn}>团队平均分析</button>
                                    <div className={styles.chartInfo}>
                                        <p>绿色虚线表示团队平均水平，展示团队整体趋势。通过对比个人预测，能发现候选人与团队的匹配度及潜在差距。</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                {/* 右列开始 */}
                <div className={styles.rightColumn}>
                    {/* 团队角色预测 & 构建建议 */}
                    {/* 团队角色预测与构建建议 */}
                    <section className={`${styles.card} fadeIn`}>
                        <div className={styles.cardHeader}>
                            <h3>团队角色预测 & 构建建议</h3>
                            <span className={styles.smallBadge}>AI智能分析</span>
                        </div>

                        <div className={styles.roleList}>
                            {Object.entries(metrics.teamRolePrediction).map(([role, val]) => (
                                <RoleCard key={role} role={role} score={val} />
                            ))}
                        </div>
                    </section>
                    {/* 流失风险与优先干预 */}
                    <section className={`${styles.card} fadeIn`}>
                        <div className={styles.cardHeader}>
                            <h3>流失风险与优先干预</h3>
                            <div className={styles.cardSub}>多因子分解并给出高优先级干预建议</div>
                        </div>

                        <div className={styles.attrition}>
                            <div className={styles.overallRisk}>
                                <div className={styles.overRiskLabel}>整体流失风险</div>
                                <div className={styles.overRiskValue}>{metrics.attritionRisk.overallRisk}%</div>
                            </div>

                            <div className={styles.factorList}>
                                {metrics.attritionRisk.factors.map((f) => (
                                    <div key={f.name} className={styles.factorRow}>
                                        <div className={styles.factorName}>{f.name}</div>
                                        <div className={styles.factorBar}>
                                            <div className={styles.factorFill} style={{ width: `${f.score}%` }} />
                                        </div>
                                        <div className={styles.factorScore}>{f.score}%</div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.actions}>
                                <h4>推荐优先干预</h4>
                                <ol>
                                    {metrics.attritionRisk.recommendedActions
                                        .sort((a, b) => a.priority - b.priority)
                                        .map((act) => (
                                            <li key={act.action}>
                                                <strong>优先级 {act.priority}：</strong> {act.action}
                                            </li>
                                        ))}
                                </ol>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* 右侧滑出面板：岗位详情 */}
            <aside className={`${styles.sidePanel} ${panelOpen ? styles.open : ""}`}>
                <div className={styles.sideHeader}>
                    <button className={styles.closeBtn} onClick={closePanel}><FiX /></button>
                </div>

                {expandedPosition ? (
                    <div className={styles.panelContent}>
                        <h3>{expandedPosition.title}</h3>
                        <div className={styles.panelScore}>岗位匹配： <span className={styles.panelScoreVal}>{expandedPosition.matchScore}</span></div>

                        <div className={styles.panelSection}>
                            <h4>能力雷达（需求 vs 候选）</h4>
                            <div className={styles.radarFake}>
                                {Object.keys(expandedPosition.requiredSkills).map((skill) => {
                                    const req = expandedPosition.requiredSkills[skill] ?? 0;
                                    const cand = expandedPosition.candidateSkills[skill] ?? 0;
                                    const gap = req - cand;
                                    return (
                                        <div key={skill} className={styles.radarRow}>
                                            <div className={styles.radarLabel}>{skill}</div>
                                            <div className={styles.radarBars}>
                                                <div className={styles.radarReq} style={{ width: `${req}%` }} title={`需求 ${req}`}></div>
                                                <div className={styles.radarCand} style={{ width: `${cand}%` }} title={`候选 ${cand}`}></div>
                                            </div>
                                            <div className={styles.radarGap}>{gap > 0 ? `差距 ${gap}` : "匹配"}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.panelSection}>
                            <h4>推荐培训</h4>
                            <ul>
                                {expandedPosition.recommendedTraining.map((t) => (
                                    <li key={t}>{t}</li>
                                ))}
                            </ul>
                        </div>

                        <div className={styles.panelSection}>
                            <h4>备注</h4>
                            <p>{expandedPosition.notes || "无"}</p>
                        </div>
                    </div>
                ) : (
                    <div className={styles.panelEmpty}>
                        <p>选择岗位以查看详情</p>
                    </div>
                )}
            </aside>
        </div>
    );
};

export default EnterpriseDashboard;


