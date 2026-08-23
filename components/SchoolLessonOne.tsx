"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const questions = [
  { q: "What is a blockchain?", answers: ["A bank account", "A shared record maintained by a network", "A type of password"], correct: 1 },
  { q: "What does owning crypto usually mean?", answers: ["You control keys that can authorise transactions", "You own part of the internet", "The exchange guarantees your money"], correct: 0 },
  { q: "Is every cryptocurrency trying to do the same job?", answers: ["Yes", "No — networks and tokens can have very different purposes", "Only Bitcoin has a purpose"], correct: 1 },
];

export default function SchoolLessonOne() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(false);
  const [videoAllowed, setVideoAllowed] = useState(false);

  useEffect(() => {
    setCompleted(localStorage.getItem("csl-school-lesson-1") === "done");
  }, []);

  const score = questions.reduce((n, q, i) => n + (answers[i] === q.correct ? 1 : 0), 0);
  const allAnswered = Object.keys(answers).length === questions.length;

  function finish() {
    if (!allAnswered) return;
    localStorage.setItem("csl-school-lesson-1", "done");
    setCompleted(true);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4"><Link href="/school" className="text-xs font-semibold text-slate-500 hover:text-slate-950">← Crypto School</Link><span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">Lesson 01 · 6 min</span></div>

      <section className="rounded-[26px] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Crypto basics</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">What is cryptocurrency?</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">Cryptocurrency is digital value that can be recorded and transferred using a computer network. Instead of one bank maintaining the master record, many crypto networks use a blockchain: a shared history that network participants verify according to agreed rules.</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[['1','Someone requests a transaction','A wallet signs an instruction using cryptographic keys.'],['2','The network checks it','Computers verify that the transaction follows the network rules.'],['3','The record is updated','Valid activity becomes part of the network’s shared history.']].map(([n,t,d]) => <div key={n} className="rounded-2xl bg-slate-50 p-4"><span className="text-[10px] font-bold text-violet-600">{n}</span><h2 className="mt-1 text-sm font-semibold">{t}</h2><p className="mt-1.5 text-xs leading-5 text-slate-500">{d}</p></div>)}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-5"><h2 className="text-lg font-semibold">Coin vs token</h2><p className="mt-2 text-xs leading-6 text-slate-600"><strong>Coin:</strong> typically the native asset of its own blockchain, such as BTC on Bitcoin or SOL on Solana.</p><p className="mt-2 text-xs leading-6 text-slate-600"><strong>Token:</strong> an asset created using an existing blockchain’s infrastructure. Tokens can represent access, governance, digital assets or many other things.</p></div>
          <div className="rounded-2xl border border-slate-200 p-5"><h2 className="text-lg font-semibold">What gives it value?</h2><p className="mt-2 text-xs leading-6 text-slate-600">There is no single answer. Value can reflect scarcity, network usage, utility, security, expectations and speculation. A token having technology behind it does not mean its market price must rise.</p></div>
        </div>

        <div className="mt-7 rounded-2xl bg-rose-50 p-5"><p className="text-xs font-bold text-rose-800">Remember</p><p className="mt-1.5 text-xs leading-5 text-rose-700">Crypto is not automatically private, safe, decentralised or valuable. Those properties depend on the particular network, asset and how it is used.</p></div>
      </section>

      <section className="mt-5 rounded-[26px] bg-slate-950 p-6 text-white sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">Video explainer</p><h2 className="mt-2 text-xl font-semibold">Watch the concept</h2><p className="mt-2 max-w-2xl text-xs leading-5 text-slate-400">Video is optional. We do not load a third-party YouTube player until you choose to activate it.</p>
        {!videoAllowed ? <button onClick={() => setVideoAllowed(true)} className="mt-5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950">Allow & load video</button> : <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5 text-xs leading-5 text-slate-300">YouTube lesson slot activated. We’ll connect a reviewed CoinSparkLine/educational video here rather than automatically loading an unverified recommendation.<br/><button onClick={() => setVideoAllowed(false)} className="mt-3 text-blue-300">Hide video</button></div>}
      </section>

      <section className="mt-5 rounded-[26px] border border-slate-200/70 bg-white p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">Knowledge check</p><h2 className="mt-1 text-xl font-semibold">3 quick questions</h2></div>{completed && <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">COMPLETED</span>}</div>
        <div className="mt-5 space-y-6">{questions.map((q,i)=><div key={q.q}><p className="text-sm font-semibold">{i+1}. {q.q}</p><div className="mt-2 grid gap-2">{q.answers.map((a,j)=><button key={a} onClick={()=>setAnswers(v=>({...v,[i]:j}))} className={`rounded-xl border px-4 py-2.5 text-left text-xs ${answers[i]===j?'border-violet-400 bg-violet-50 text-violet-900':'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{a}</button>)}</div></div>)}</div>
        {allAnswered && <div className="mt-6 flex flex-wrap items-center gap-3"><button onClick={finish} className="rounded-full bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white">Finish lesson</button><span className={`text-xs font-semibold ${score===3?'text-emerald-600':'text-amber-600'}`}>Score: {score}/3 {score<3?'— review the answers and try again.':'— excellent.'}</span></div>}
      </section>

      <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><strong>Education, not a recommendation.</strong> This lesson explains concepts and does not recommend buying, selling or holding any cryptoasset. Cryptoassets are high risk. Don’t invest unless you’re prepared to lose all the money you invest.</section>
    </div>
  );
}
