"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Play,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import styles from "./HomeHero.module.css";

export default function HomeHero({ stats }) {
  const heroStats = stats.slice(0, 3);

  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <div className={styles.container}>
        <div className={styles.copy}>
          <h1 id="home-hero-title" className={styles.title}>
            <span>Hire for</span>{" "}
            <br className={styles.mobileBreak} />
            <span>
              <span className={styles.mobileAccent}>proven skills,</span>
              <br className={styles.desktopBreak} />
              <span className={styles.desktopAccent}>not</span>{" "}
            </span>
            <br className={styles.mobileBreak} />
            <span className={styles.desktopAccent}>just resumes.</span>
          </h1>

          <p className={styles.description}>
            JobMatch AI validates real abilities through structured assessments,
            then matches candidates by <strong>demonstrated performance</strong> —
            not keywords.
          </p>

          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/signup">
              Start Hiring Now
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
            <a className={styles.secondaryAction} href="#how-it-works">
              <span className={styles.playIcon} aria-hidden="true"><Play size={13} fill="currentColor" /></span>
              Watch Demo
            </a>
          </div>

          <p className={styles.jobsLink}>
            Looking for your next role? <Link href="/jobs">Explore open jobs <ArrowRight size={14} aria-hidden="true" /></Link>
          </p>

          <div className={styles.stats} aria-label="Platform highlights">
            {heroStats.map((stat, index) => (
              <div className={styles.stat} key={stat.label}>
                <span className={styles.statIcon} aria-hidden="true">
                  {index === 0 ? <UserRound /> : index === 1 ? <BriefcaseBusiness /> : <ShieldCheck />}
                </span>
                <span className={styles.statCopy}>
                  <strong>{stat.display}</strong>
                  <span>{stat.label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
