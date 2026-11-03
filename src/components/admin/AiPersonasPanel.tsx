import React, { useCallback, useEffect, useState } from 'react';
import { Bot, Camera, ImagePlus, Pause, Pencil, Play, Plus, RefreshCw, Send, Sparkles, Trash2, UserPlus } from 'lucide-react';
import { AiBatch, AiPersona, AiPersonaInput, AiStatus, babyCareService } from '../../services/babyCareService';
import { ApiError, errorMessage } from '../../services/api';

const TOPICS = ['খাবার', 'ঘুম', 'বিকাশ', 'মায়ের গল্প'];
const EMPTY: AiPersonaInput = { name: '', avatar: '', bio: '', voice: '', focusTopics: [], active: true };
const MAX_PER_BATCH = 20;

const stripLabel = (name: string) => name.replace(/\s*\(\s*AI(\s*সহকারী)?\s*\)\s*$/i, '');
const stripBioPrefix = (bio: string) =>
  bio.replace(/^(AI-তৈরি প্রোফাইল — সত্যিকারের মানুষ নন।|আমি বেবি কেয়ার অ্যাপের একজন AI সহকারী — সত্যিকারের মানুষ নই।)\s*/, '');

const STEP_LABEL: Record<string, string> = {
  pending: 'অপেক্ষায়',
  profile: 'প্রোফাইল তৈরি হচ্ছে…',
  photo: 'ছবি তৈরি হচ্ছে… (১–৩ মিনিট)',
  done: 'তৈরি হয়েছে',
  failed: 'ব্যর্থ',
  skipped: 'বাদ পড়েছে',
};

type Filter = 'all' | 'active' | 'paused';

/**
 * Admin → AI ইউজার. Generates AI users in bulk (realistic name, portrait, bio)
 * and manages them. Every AI user's name ends with "(AI)" and shows an AI badge.
 */
export const AiPersonasPanel: React.FC = () => {
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [personas, setPersonas] = useState<AiPersona[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string | null; data: AiPersonaInput } | null>(null);

  const [count, setCount] = useState(5);
  const [guidance, setGuidance] = useState('');
  const [batch, setBatch] = useState<AiBatch | null>(null);

  const loadPersonas = useCallback(async () => {
    const active = filter === 'all' ? undefined : filter === 'active';
    const p = await babyCareService.admin.ai.personas(active);
    setPersonas(p.personas);
    setTotal(p.total);
  }, [filter]);

  const load = useCallback(async () => {
    setError('');
    try {
      const [s] = await Promise.all([babyCareService.admin.ai.status(), loadPersonas()]);
      setStatus(s);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [loadPersonas]);

  useEffect(() => {
    void load();
  }, [load]);

  // Pick up a batch that is still running (e.g. after reopening the panel).
  useEffect(() => {
    babyCareService.admin.ai
      .batches()
      .then(({ batches }) => {
        const latest = batches[0];
        if (latest) setBatch(latest);
      })
      .catch(() => {});
  }, []);

  const batchActive = batch?.status === 'queued' || batch?.status === 'running';
  const batchId = batch?.id;

  useEffect(() => {
    if (!batchActive || !batchId) return;
    let lastDone = -1;
    const timer = setInterval(async () => {
      try {
        const { batch: fresh } = await babyCareService.admin.ai.batch(batchId);
        setBatch(fresh);
        if (fresh.done !== lastDone) {
          lastDone = fresh.done;
          void loadPersonas();
        }
        if (fresh.status === 'done' || fresh.status === 'stopped') void load();
      } catch (err) {
        // 404: the batch is gone (started before batches were stored). Stop polling.
        if (err instanceof ApiError && err.status === 404) {
          setBatch(null);
          void load();
        }
        /* other errors: keep polling */
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [batchActive, batchId, load, loadPersonas]);

  const run = async (key: string, action: () => Promise<unknown>, done?: string) => {
    setBusy(key);
    setError('');
    try {
      await action();
      if (done) alert(done);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const generate = async () => {
    setError('');
    try {
      const n = Math.min(Math.max(Math.floor(count) || 1, 1), MAX_PER_BATCH);
      const { batch: started } = await babyCareService.admin.ai.generatePersonas(n, guidance.trim() || undefined);
      setBatch(started);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const save = () => {
    if (!editing) return;
    const { id, data } = editing;
    void run('save', () =>
      id ? babyCareService.admin.ai.updatePersona(id, data) : babyCareService.admin.ai.createPersona(data)
    ).then(() => setEditing(null));
  };

  const agent = status?.agent;
  const agentOk = Boolean(agent?.reachable && agent?.tokenOk);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#56020A] flex items-center gap-1.5">
          <Bot className="w-4 h-4" /> AI ইউজার
        </h3>
        <button onClick={() => void load()} className="p-1.5 rounded-lg hover:bg-[#EDD6A9]/40 text-[#56020A]" title="রিফ্রেশ">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] text-gray-600 bg-[#EDD6A9]/30 border border-[#EDD6A9] rounded-xl p-3">
        AI ইউজারদের নামের পরে সবসময় "(AI)" থাকে এবং অ্যাপে AI ব্যাজ দেখায়। তারা লাইক/রিঅ্যাকশন দেয় না, পয়েন্ট পায় না,
        লিডারবোর্ডে থাকে না, লগইন করতে পারে না। একটি পোস্টে সর্বোচ্চ একটি AI উত্তর যায়।
      </p>

      {error && <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">{error}</p>}

      {status && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-[#EDD6A9]">
            <p className="text-gray-500">node-agent</p>
            <p className={`font-bold ${agentOk ? 'text-green-700' : 'text-red-700'}`}>
              {!agent?.configured ? 'কনফিগার করা নেই' : agentOk ? `সংযুক্ত (${agent?.latencyMs}ms)` : 'সমস্যা'}
            </p>
            {agent?.clis?.length ? <p className="text-gray-500">CLI: {agent.clis.join(', ')}</p> : null}
            {agent?.message && <p className="text-red-600 mt-1 break-words">{agent.message}</p>}
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#EDD6A9]">
            <p className="text-gray-500">অটো পোস্ট ও উত্তর</p>
            <p className={`font-bold ${status.scheduler.running ? 'text-green-700' : 'text-gray-600'}`}>
              {status.scheduler.running ? 'চালু' : 'বন্ধ (AI_COMMUNITY_ENABLED)'}
            </p>
            <p className="text-gray-500">
              প্রতি {status.scheduler.settings.postEveryHours} ঘণ্টায় পোস্ট · {status.scheduler.settings.activeHours.join('–')}টা
            </p>
            <p className="text-gray-500" title="backend/.env: AI_IMAGE_POST_PERCENT">
              {status.scheduler.settings.imagePostPercent ?? 0}% পোস্টে ছবি থাকবে
            </p>
            {status.scheduler.pausedUntil && (
              <p className="text-amber-700">বিরতি: {new Date(status.scheduler.pausedUntil).toLocaleTimeString()}</p>
            )}
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#EDD6A9]">
            <p className="text-gray-500">মোট</p>
            <p className="font-bold text-[#56020A]">
              {status.counts.personas} AI ইউজার · {status.counts.aiPosts} পোস্ট · {status.counts.aiComments} কমেন্ট
            </p>
            <button
              disabled={busy !== null || !agentOk}
              onClick={() => void run('tick', () => babyCareService.admin.ai.runNow())}
              className="mt-1 inline-flex items-center gap-1 px-2 py-1 bg-[#56020A] text-white rounded-lg font-bold disabled:opacity-40"
            >
              <Play className="w-3 h-3" /> {busy === 'tick' ? 'চলছে…' : 'এখনই পোস্ট/উত্তর চালান'}
            </button>
          </div>
        </div>
      )}

      {/* Bulk generator */}
      <div className="bg-white p-4 rounded-xl border border-[#56020A]/30 space-y-3 text-xs">
        <h4 className="text-sm font-bold text-[#56020A] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> AI ইউজার তৈরি করুন
        </h4>
        <p className="text-gray-600">
          প্রতিটি ইউজারের জন্য বাংলাদেশি নাম, বাস্তবসম্মত প্রোফাইল ছবি, বায়ো ও লেখার ধরন তৈরি হবে। ছবি তৈরিতে জনপ্রতি ১–৩ মিনিট লাগে,
          তাই পুরো কাজটি ব্যাকগ্রাউন্ডে চলে।
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-1">
            <span className="block font-semibold text-gray-700">কতজন (১–{MAX_PER_BATCH})</span>
            <input
              type="number"
              min={1}
              max={MAX_PER_BATCH}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-24 px-2.5 py-1.5 border border-[#EDD6A9] rounded-lg bg-[#FAF6F0]"
            />
          </label>
          <label className="space-y-1 flex-1 min-w-[200px]">
            <span className="block font-semibold text-gray-700">নির্দেশনা (ঐচ্ছিক)</span>
            <input
              value={guidance}
              onChange={(e) => setGuidance(e.target.value)}
              maxLength={500}
              placeholder="যেমন: চট্টগ্রাম ও সিলেটের মায়েরা, ১ বছরের নিচের শিশু"
              className="w-full px-2.5 py-1.5 border border-[#EDD6A9] rounded-lg bg-[#FAF6F0]"
            />
          </label>
          <button
            disabled={!agentOk || batchActive}
            onClick={() => void generate()}
            className="inline-flex items-center gap-1 px-3 py-2 bg-[#56020A] text-white rounded-lg font-bold disabled:opacity-40"
            title={!agentOk ? 'আগে node-agent সংযোগ ঠিক করুন' : undefined}
          >
            <UserPlus className="w-4 h-4" /> {batchActive ? 'তৈরি হচ্ছে…' : 'তৈরি করুন'}
          </button>
        </div>

        {batch && (
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <p className="font-semibold text-gray-700">
              শেষ ব্যাচ: {batch.done}/{batch.requested} তৈরি হয়েছে
              {batch.failed ? ` · ${batch.failed}টি ব্যর্থ` : ''} ·{' '}
              {batch.status === 'running' || batch.status === 'queued'
                ? 'চলছে'
                : batch.status === 'stopped'
                  ? 'থেমে গেছে'
                  : 'শেষ'}
            </p>
            {batch.error && <p className="text-red-700 break-words">{batch.error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {batch.items.map((item) => (
                <div key={item.index} className="flex items-center gap-2 bg-[#FAF6F0] rounded-lg p-2">
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#EDD6A9]/60 flex items-center justify-center">
                      {item.status === 'profile' || item.status === 'photo' ? (
                        <RefreshCw className="w-4 h-4 text-[#56020A] animate-spin" />
                      ) : (
                        <span className="text-[10px] text-gray-500">{item.index}</span>
                      )}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-[#56020A] truncate">{item.name || `AI ইউজার ${item.index}`}</p>
                    <p className={`text-[10px] ${item.status === 'failed' ? 'text-red-700' : 'text-gray-500'} break-words`}>
                      {STEP_LABEL[item.status]}
                      {item.error ? `: ${item.error}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 text-xs">
          <span className="font-bold text-[#56020A] mr-1">AI ইউজার ({total})</span>
          {(['all', 'active', 'paused'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded-lg border ${filter === f ? 'bg-[#56020A] text-white border-[#56020A]' : 'border-[#EDD6A9]'}`}
            >
              {f === 'all' ? 'সব' : f === 'active' ? 'সক্রিয়' : 'বিরত'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setEditing({ id: null, data: { ...EMPTY } })}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-[#375013] text-[#375013] rounded-lg text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5" /> নিজে যোগ করুন
        </button>
      </div>

      {editing && (
        <div className="bg-white p-4 rounded-xl border border-[#56020A]/30 space-y-2 text-xs">
          <input
            value={editing.data.name}
            onChange={(e) => setEditing({ ...editing, data: { ...editing.data, name: e.target.value } })}
            placeholder='নাম — "(AI)" নিজে থেকে যোগ হবে'
            maxLength={60}
            className="w-full px-2.5 py-1.5 border border-[#EDD6A9] rounded-lg bg-[#FAF6F0]"
          />
          <input
            value={editing.data.avatar || ''}
            onChange={(e) => setEditing({ ...editing, data: { ...editing.data, avatar: e.target.value } })}
            placeholder="প্রোফাইল ছবির URL"
            className="w-full px-2.5 py-1.5 border border-[#EDD6A9] rounded-lg bg-[#FAF6F0]"
          />
          <input
            value={editing.data.bio || ''}
            onChange={(e) => setEditing({ ...editing, data: { ...editing.data, bio: e.target.value } })}
            placeholder="ছোট বায়ো (AI পরিচয় নিজে থেকে যোগ হবে)"
            maxLength={400}
            className="w-full px-2.5 py-1.5 border border-[#EDD6A9] rounded-lg bg-[#FAF6F0]"
          />
          <textarea
            value={editing.data.voice || ''}
            onChange={(e) => setEditing({ ...editing, data: { ...editing.data, voice: e.target.value } })}
            placeholder="লেখার ধরন: কী নিয়ে, কীভাবে লিখবে (AI-কে নির্দেশনা)"
            maxLength={1000}
            rows={3}
            className="w-full px-2.5 py-1.5 border border-[#EDD6A9] rounded-lg bg-[#FAF6F0]"
          />
          <div className="flex flex-wrap gap-3">
            {TOPICS.map((t) => (
              <label key={t} className="inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={editing.data.focusTopics?.includes(t) || false}
                  onChange={(e) => {
                    const cur = editing.data.focusTopics || [];
                    const focusTopics = e.target.checked ? [...cur, t] : cur.filter((x) => x !== t);
                    setEditing({ ...editing, data: { ...editing.data, focusTopics } });
                  }}
                />
                {t}
              </label>
            ))}
            <label className="inline-flex items-center gap-1 ml-auto font-semibold">
              <input
                type="checkbox"
                checked={editing.data.active !== false}
                onChange={(e) => setEditing({ ...editing, data: { ...editing.data, active: e.target.checked } })}
              />
              সক্রিয়
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg border border-[#EDD6A9]">
              বাতিল
            </button>
            <button
              disabled={busy !== null || !editing.data.name.trim()}
              onClick={save}
              className="px-3 py-1.5 bg-[#56020A] text-white rounded-lg font-bold disabled:opacity-40"
            >
              সেভ
            </button>
          </div>
        </div>
      )}

      {personas.length === 0 && <p className="text-xs text-gray-500">এখনও কোনো AI ইউজার নেই। উপরে "তৈরি করুন" চাপুন।</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {personas.map((p) => (
          <div key={p.id} className={`bg-white p-3 rounded-xl border border-[#EDD6A9] shadow-sm space-y-2 ${p.active ? '' : 'opacity-60'}`}>
            <div className="flex items-start gap-3">
              <img src={p.avatar} alt={p.name} className="w-14 h-14 rounded-full object-cover border border-[#EDD6A9]" />
              <div className="flex-1 min-w-0 text-xs">
                <p className="font-bold text-[#56020A] truncate">{p.name}</p>
                {p.location && <p className="text-gray-500">{p.location}</p>}
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.focusTopics.map((t) => (
                    <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                  {!p.active && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">বিরত</span>}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-600 line-clamp-2">{stripBioPrefix(p.bio)}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">
                শেষ পোস্ট: {p.lastPostAt ? new Date(p.lastPostAt).toLocaleDateString() : '—'}
              </span>
              <div className="flex items-center">
                <button
                  disabled={busy !== null || !agentOk}
                  onClick={() => void run(`post-${p.id}`, () => babyCareService.admin.ai.postNow(p.id), 'পোস্ট প্রকাশ হয়েছে।')}
                  className="p-1.5 text-[#375013] hover:bg-green-50 rounded-lg disabled:opacity-40"
                  title="এখনই একটি লেখা পোস্ট"
                >
                  {busy === `post-${p.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
                <button
                  disabled={busy !== null || !agentOk}
                  onClick={() =>
                    void run(`imgpost-${p.id}`, async () => {
                      const { imageError } = await babyCareService.admin.ai.postNow(p.id, { withImage: true });
                      alert(imageError ? `পোস্ট প্রকাশ হয়েছে, কিন্তু ছবি তৈরি হয়নি: ${imageError}` : 'ছবিসহ পোস্ট প্রকাশ হয়েছে।');
                    })
                  }
                  className="p-1.5 text-[#375013] hover:bg-green-50 rounded-lg disabled:opacity-40"
                  title="এখনই ছবিসহ পোস্ট (১–৩ মিনিট লাগে)"
                >
                  {busy === `imgpost-${p.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                </button>
                <button
                  disabled={busy !== null || !agentOk}
                  onClick={() => void run(`photo-${p.id}`, () => babyCareService.admin.ai.regeneratePhoto(p.id))}
                  className="p-1.5 text-[#56020A] hover:bg-[#EDD6A9]/40 rounded-lg disabled:opacity-40"
                  title="নতুন ছবি (কয়েক মিনিট লাগে)"
                >
                  {busy === `photo-${p.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
                <button
                  disabled={busy !== null}
                  onClick={() => void run(`toggle-${p.id}`, () => babyCareService.admin.ai.updatePersona(p.id, { active: !p.active }))}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40"
                  title={p.active ? 'বিরত রাখুন' : 'সক্রিয় করুন'}
                >
                  {p.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() =>
                    setEditing({
                      id: p.id,
                      data: {
                        name: stripLabel(p.name),
                        avatar: p.avatar,
                        bio: stripBioPrefix(p.bio),
                        voice: p.voice,
                        focusTopics: p.focusTopics,
                        active: p.active,
                      },
                    })
                  }
                  className="p-1.5 text-[#56020A] hover:bg-[#EDD6A9]/40 rounded-lg"
                  title="এডিট"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  disabled={busy !== null}
                  onClick={() => {
                    if (confirm(`${p.name} এবং তার সব পোস্ট/কমেন্ট মুছে ফেলবেন?`)) {
                      void run(`del-${p.id}`, () => babyCareService.admin.ai.deletePersona(p.id));
                    }
                  }}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-40"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {status && status.runs.length > 0 && (
        <div className="bg-white p-3 rounded-xl border border-[#EDD6A9] text-[11px] space-y-1">
          <h4 className="text-xs font-bold text-[#56020A]">সাম্প্রতিক পোস্ট ও উত্তর</h4>
          {status.runs.slice(0, 12).map((r, i) => (
            <p key={i} className={r.ok ? 'text-gray-700' : 'text-red-700'}>
              {new Date(r.at).toLocaleString()} · {r.what === 'post' ? 'পোস্ট' : 'উত্তর'} · {r.persona || '—'}
              {r.withImage ? ' · ছবিসহ' : ''}
              {r.manual ? ' · ম্যানুয়াল' : ''} · {r.ok ? 'সফল' : r.error}
              {r.ok && r.error ? <span className="text-amber-700"> ({r.error})</span> : null}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
