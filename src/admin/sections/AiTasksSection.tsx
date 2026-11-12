import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, Heart, ImagePlus, Loader2, MessageCircle, Play, RefreshCw, Save, Sparkles, Timer, UserPlus } from 'lucide-react';
import {
  AiCliModels,
  AiModelChoice,
  AiRun,
  AiSchedulerState,
  AiTaskKey,
  AiTaskSettings,
  babyCareService,
} from '../../services/babyCareService';
import { errorMessage } from '../../services/api';
import { bn, Card, Pill, SectionHeader } from '../ui';

/**
 * Admin → AI টাস্ক. Three automatic jobs done by labeled "(AI)" users: a post,
 * a batch of comments on one post, and reactions on recent posts. Each runs at
 * a random time inside its range; every number and the node-agent model per
 * task are editable here.
 */

const inputClass =
  'w-full text-sm border border-[#EDD6A9] rounded-lg px-2 py-1.5 bg-white text-[#2D2327] focus:outline-none focus:ring-2 focus:ring-[#56020A]/20';

const TASK_LABEL: Record<AiRun['what'], string> = { post: 'পোস্ট', comment: 'কমেন্ট', like: 'রিঅ্যাকশন', reply: 'উত্তর' };

// ---- small inputs -------------------------------------------------------

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; big?: boolean }> = ({
  checked,
  onChange,
  label,
  big,
}) => (
  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative rounded-full transition-colors ${big ? 'w-12 h-7' : 'w-10 h-6'} ${
        checked ? 'bg-[#375013]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-1 left-1 bg-white rounded-full shadow transition-transform ${big ? 'w-5 h-5' : 'w-4 h-4'} ${
          checked ? (big ? 'translate-x-5' : 'translate-x-4') : ''
        }`}
      />
    </button>
    <span className={`font-semibold ${big ? 'text-sm' : 'text-xs'} text-[#2D2327]`}>{label}</span>
  </label>
);

const Num: React.FC<{ value: number; onChange: (v: number) => void; min?: number; max?: number; ariaLabel: string }> = ({
  value,
  onChange,
  min,
  max,
  ariaLabel,
}) => (
  <input
    type="number"
    inputMode="numeric"
    aria-label={ariaLabel}
    className={inputClass}
    value={Number.isFinite(value) ? value : ''}
    min={min}
    max={max}
    onChange={(e) => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
  />
);

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-gray-600">{label}</p>
    {children}
    {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
  </div>
);

const Range: React.FC<{
  label: string;
  unit: string;
  low: number;
  high: number;
  onLow: (v: number) => void;
  onHigh: (v: number) => void;
  min: number;
  max: number;
}> = ({ label, unit, low, high, onLow, onHigh, min, max }) => (
  <Field label={label} hint={low > high ? 'কম সংখ্যাটি বেশি সংখ্যার চেয়ে বড় হতে পারবে না' : undefined}>
    <div className="flex items-center gap-2">
      <Num value={low} onChange={onLow} min={min} max={max} ariaLabel={`${label} কম`} />
      <span className="text-gray-400 text-sm">–</span>
      <Num value={high} onChange={onHigh} min={min} max={max} ariaLabel={`${label} বেশি`} />
      <span className="text-xs text-gray-500 whitespace-nowrap">{unit}</span>
    </div>
  </Field>
);

/** CLI + model choice. An empty CLI means the defaults in backend/.env (NODE_AGENT_CLI / NODE_AGENT_MODEL). */
const ModelPicker: React.FC<{
  label: string;
  value: AiModelChoice;
  onChange: (v: AiModelChoice) => void;
  catalog: AiCliModels[] | null;
}> = ({ label, value, onChange, catalog }) => {
  const cli = catalog?.find((c) => c.cli === value.cli);
  return (
    <Field label={label}>
      <div className="grid grid-cols-2 gap-2">
        <select
          className={inputClass}
          value={value.cli}
          onChange={(e) => onChange({ cli: e.target.value, model: '' })}
          aria-label={`${label}: CLI`}
        >
          <option value="">ডিফল্ট (.env)</option>
          {catalog?.map((c) => (
            <option key={c.cli} value={c.cli}>
              {c.label}
            </option>
          ))}
          {value.cli && !catalog?.some((c) => c.cli === value.cli) && <option value={value.cli}>{value.cli}</option>}
        </select>
        {cli && cli.models.length > 1 ? (
          <select
            className={inputClass}
            value={value.model}
            onChange={(e) => onChange({ ...value, model: e.target.value })}
            aria-label={`${label}: মডেল`}
          >
            <option value="">ডিফল্ট মডেল</option>
            {cli.models
              .filter((m) => m.id !== 'default')
              .map((m) => (
                <option key={m.id} value={m.id} title={m.description || undefined}>
                  {m.label}
                </option>
              ))}
            {value.model && !cli.models.some((m) => m.id === value.model) && <option value={value.model}>{value.model}</option>}
          </select>
        ) : (
          <input
            className={inputClass}
            value={value.model}
            placeholder={value.cli ? 'মডেল (খালি = ডিফল্ট)' : '—'}
            disabled={!value.cli}
            onChange={(e) => onChange({ ...value, model: e.target.value.trim() })}
            aria-label={`${label}: মডেল`}
          />
        )}
      </div>
    </Field>
  );
};

// ---- timing -------------------------------------------------------------

function useNow(everyMs = 15_000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(t);
  }, [everyMs]);
  return now;
}

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' });

function nextRunText(iso: string | null, now: number) {
  if (!iso) return 'নির্ধারিত নেই';
  const mins = Math.max(0, Math.round((new Date(iso).getTime() - now) / 60_000));
  return `${timeOf(iso)} (${mins < 1 ? 'এখনই' : `${bn(mins)} মিনিট পরে`})`;
}

// ---- main ---------------------------------------------------------------

export const AiTasksSection: React.FC = () => {
  const [saved, setSaved] = useState<AiTaskSettings | null>(null);
  const [draft, setDraft] = useState<AiTaskSettings | null>(null);
  const [scheduler, setScheduler] = useState<AiSchedulerState | null>(null);
  const [runs, setRuns] = useState<AiRun[]>([]);
  const [catalog, setCatalog] = useState<AiCliModels[] | null>(null);
  const [catalogError, setCatalogError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState<AiTaskKey | null>(null);
  const now = useNow();

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);

  const refresh = useCallback(async (withSettings: boolean) => {
    try {
      const data = await babyCareService.admin.ai.tasks.get();
      setScheduler(data.scheduler);
      setRuns(data.runs);
      if (withSettings) {
        setSaved(data.settings);
        setDraft(data.settings);
      }
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void refresh(true);
    babyCareService.admin.ai
      .models()
      .then((m) => setCatalog(m.clis))
      .catch((err) => {
        setCatalog([]);
        setCatalogError(errorMessage(err));
      });
  }, [refresh]);

  // Keep the schedule and history fresh without touching unsaved edits.
  useEffect(() => {
    const t = setInterval(() => void refresh(false), 30_000);
    return () => clearInterval(t);
  }, [refresh]);

  const set = <K extends keyof AiTaskSettings>(key: K, value: Partial<AiTaskSettings[K]> | AiTaskSettings[K]) =>
    setDraft((d) =>
      d ? { ...d, [key]: typeof value === 'object' && value !== null ? { ...(d[key] as object), ...value } : value } : d
    );

  const save = async (override?: Partial<AiTaskSettings>) => {
    if (!draft) return;
    const body = { ...draft, ...override };
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const { settings, scheduler: s } = await babyCareService.admin.ai.tasks.update({
        autoEnabled: body.autoEnabled,
        activeHours: body.activeHours,
        post: body.post,
        comment: body.comment,
        like: body.like,
        persona: body.persona,
      });
      setSaved(settings);
      setDraft(settings);
      setScheduler(s);
      setNotice('সংরক্ষণ হয়েছে।');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const runNow = async (task: AiTaskKey) => {
    setRunning(task);
    setError('');
    setNotice('');
    try {
      const { run, scheduler: s } = await babyCareService.admin.ai.tasks.run(task);
      setScheduler(s);
      if (run.ok) setNotice(`${TASK_LABEL[task]}: ${run.note || run.persona || 'সফল'}`);
      else setError(`${TASK_LABEL[task]}: ${run.error}`);
      await refresh(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRunning(null);
    }
  };

  if (!draft || !scheduler) {
    return (
      <>
        <SectionHeader title="AI টাস্ক" />
        {error ? (
          <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">{error}</p>
        ) : (
          <div className="py-24 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#56020A] animate-spin" />
          </div>
        )}
      </>
    );
  }

  const taskStatus = (task: AiTaskKey) => {
    const t = scheduler.tasks[task];
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {t.busy ? (
          <Pill className="bg-blue-50 text-blue-700">
            <Loader2 className="w-3 h-3 animate-spin" /> চলছে
          </Pill>
        ) : t.pausedUntil ? (
          <Pill className="bg-amber-50 text-amber-700">বিরতি {timeOf(t.pausedUntil)} পর্যন্ত</Pill>
        ) : scheduler.autoEnabled && t.enabled ? (
          <Pill className="bg-green-50 text-green-700">
            <Clock className="w-3 h-3" /> পরবর্তী: {nextRunText(t.nextRunAt, now)}
          </Pill>
        ) : (
          <Pill className="bg-gray-100 text-gray-600">বন্ধ</Pill>
        )}
        <button
          disabled={running !== null || t.busy}
          onClick={() => void runNow(task)}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#56020A] text-white rounded-lg font-bold disabled:opacity-40"
        >
          {running === task ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          এখনই চালান
        </button>
      </div>
    );
  };

  const cardHead = (icon: React.ReactNode, title: string, task: AiTaskKey, enabled: boolean, onToggle: (v: boolean) => void) => (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
      <h3 className="font-bold text-[#2D2327] flex items-center gap-2">
        {icon} {title}
      </h3>
      <Toggle checked={enabled} onChange={onToggle} label={enabled ? 'চালু' : 'বন্ধ'} />
      <div className="w-full">{taskStatus(task)}</div>
    </div>
  );

  const mixTotal = Object.values(draft.like.reactionMix).reduce((a, b) => a + (Number(b) || 0), 0);

  return (
    <>
      <SectionHeader
        title="AI টাস্ক"
        subtitle="লেবেলযুক্ত (AI) ইউজারদের স্বয়ংক্রিয় পোস্ট, কমেন্ট ও রিঅ্যাকশন। প্রতিটি টাস্ক নিজের রেঞ্জের মধ্যে র‍্যান্ডম সময়ে চলে।"
        actions={
          <>
            <button
              onClick={() => void refresh(!dirty)}
              className="p-2 rounded-lg hover:bg-[#EDD6A9]/40 text-[#56020A]"
              title="রিফ্রেশ"
              aria-label="রিফ্রেশ"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              disabled={!dirty || saving}
              onClick={() => void save()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#56020A] text-white rounded-xl text-sm font-bold disabled:opacity-40"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} সংরক্ষণ
            </button>
          </>
        }
      />

      {error && <p className="mb-4 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">{error}</p>}
      {notice && <p className="mb-4 text-sm font-semibold text-green-800 bg-green-50 border border-green-200 p-3 rounded-xl">{notice}</p>}

      {/* Master switch */}
      <Card className="p-5 mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <Toggle
              big
              checked={draft.autoEnabled}
              onChange={(v) => {
                set('autoEnabled', v);
                void save({ autoEnabled: v });
              }}
              label={draft.autoEnabled ? 'অটো চালু' : 'অটো বন্ধ'}
            />
            <p className="text-xs text-gray-500">
              বন্ধ থাকলে কোনো টাস্ক নিজে চলবে না; “এখনই চালান” দিয়ে হাতে চালানো যাবে।
              {!scheduler.inActiveHours && draft.autoEnabled && ' এখন সক্রিয় সময়ের বাইরে — টাস্কগুলো বাদ যাবে।'}
            </p>
          </div>
          <div className="flex items-end gap-3">
            <Field label="সক্রিয় সময় (বাংলাদেশ, ঘণ্টা)">
              <div className="flex items-center gap-2">
                <Num
                  value={draft.activeHours.start}
                  onChange={(v) => set('activeHours', { start: v })}
                  min={0}
                  max={23}
                  ariaLabel="শুরু"
                />
                <span className="text-gray-400">–</span>
                <Num value={draft.activeHours.end} onChange={(v) => set('activeHours', { end: v })} min={1} max={24} ariaLabel="শেষ" />
              </div>
            </Field>
          </div>
        </div>
        <p className="mt-4 text-[11px] text-gray-600 bg-[#EDD6A9]/30 border border-[#EDD6A9] rounded-xl p-3">
          সব কাজ করে শুধু “(AI)” লেবেল ও AI ব্যাজওয়ালা ইউজাররা। প্রতিটি রিঅ্যাকশন একজন নির্দিষ্ট AI ইউজারের (প্রতি পোস্টে একজন একবার),
          কাউন্ট কৃত্রিমভাবে বাড়ানো হয় না। AI ইউজার পয়েন্ট পায় না। AI ইউজার মুছে দিলে তার রিঅ্যাকশন ও কমেন্টও মুছে যায়।
        </p>
      </Card>

      {catalogError && (
        <p className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl">
          মডেলের তালিকা আনা যায়নি ({catalogError})। মডেলের নাম হাতে লিখতে পারবেন।
        </p>
      )}

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* Post */}
        <Card className="p-5">
          {cardHead(<ImagePlus className="w-5 h-5 text-[#56020A]" />, 'নতুন পোস্ট', 'post', draft.post.enabled, (v) =>
            set('post', { enabled: v })
          )}
          <div className="space-y-4">
            <Range
              label="প্রতি কত মিনিটে"
              unit="মিনিট"
              low={draft.post.minMinutes}
              high={draft.post.maxMinutes}
              onLow={(v) => set('post', { minMinutes: v })}
              onHigh={(v) => set('post', { maxMinutes: v })}
              min={5}
              max={1440}
            />
            <Field label="ছবিসহ পোস্ট (%)" hint="ছবি তৈরি হতে ১–৩ মিনিট লাগে">
              <Num value={draft.post.imagePercent} onChange={(v) => set('post', { imagePercent: v })} min={0} max={100} ariaLabel="ছবিসহ পোস্ট %" />
            </Field>
            <ModelPicker label="লেখার মডেল" value={draft.post.textModel} onChange={(v) => set('post', { textModel: v })} catalog={catalog} />
            <ModelPicker label="ছবির মডেল" value={draft.post.imageModel} onChange={(v) => set('post', { imageModel: v })} catalog={catalog} />
            <p className="text-[11px] text-gray-500">একজন র‍্যান্ডম AI ইউজার (গত ৩ ঘণ্টায় পোস্ট করেননি এমন) পোস্ট করবেন।</p>
          </div>
        </Card>

        {/* Comments */}
        <Card className="p-5">
          {cardHead(<MessageCircle className="w-5 h-5 text-[#56020A]" />, 'কমেন্ট ব্যাচ', 'comment', draft.comment.enabled, (v) =>
            set('comment', { enabled: v })
          )}
          <div className="space-y-4">
            <Range
              label="প্রতি কত মিনিটে"
              unit="মিনিট"
              low={draft.comment.minMinutes}
              high={draft.comment.maxMinutes}
              onLow={(v) => set('comment', { minMinutes: v })}
              onHigh={(v) => set('comment', { maxMinutes: v })}
              min={2}
              max={1440}
            />
            <Range
              label="প্রতিবার কয়টি কমেন্ট"
              unit="টি"
              low={draft.comment.minCount}
              high={draft.comment.maxCount}
              onLow={(v) => set('comment', { minCount: v })}
              onHigh={(v) => set('comment', { maxCount: v })}
              min={1}
              max={15}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="সাম্প্রতিক কয়টি পোস্ট থেকে">
                <Num value={draft.comment.recentPosts} onChange={(v) => set('comment', { recentPosts: v })} min={1} max={200} ariaLabel="সাম্প্রতিক পোস্ট" />
              </Field>
              <Field label="প্রতি পোস্টে সর্বোচ্চ AI কমেন্ট">
                <Num
                  value={draft.comment.maxAiCommentsPerPost}
                  onChange={(v) => set('comment', { maxAiCommentsPerPost: v })}
                  min={1}
                  max={100}
                  ariaLabel="প্রতি পোস্টে সর্বোচ্চ AI কমেন্ট"
                />
              </Field>
            </div>
            <Toggle
              checked={draft.comment.includeAiPosts}
              onChange={(v) => set('comment', { includeAiPosts: v })}
              label="AI ইউজারদের পোস্টেও কমেন্ট করবে"
            />
            <ModelPicker label="কমেন্ট লেখার মডেল" value={draft.comment.model} onChange={(v) => set('comment', { model: v })} catalog={catalog} />
            <p className="text-[11px] text-gray-500">
              একটি পোস্ট বেছে এক AI কলে সব কমেন্ট (JSON) লেখা হয়, প্রতিটি আলাদা র‍্যান্ডম AI ইউজারের নামে ~২ মিনিট ধরে যায়। সদস্যের
              পোস্ট হলে তিনি একটি মাত্র নোটিফিকেশন পান।
            </p>
          </div>
        </Card>

        {/* Reactions */}
        <Card className="p-5">
          {cardHead(<Heart className="w-5 h-5 text-[#56020A]" />, 'রিঅ্যাকশন', 'like', draft.like.enabled, (v) => set('like', { enabled: v }))}
          <div className="space-y-4">
            <Range
              label="প্রতি কত মিনিটে"
              unit="মিনিট"
              low={draft.like.minMinutes}
              high={draft.like.maxMinutes}
              onLow={(v) => set('like', { minMinutes: v })}
              onHigh={(v) => set('like', { maxMinutes: v })}
              min={1}
              max={1440}
            />
            <Range
              label="প্রতিবার কয়টি রিঅ্যাকশন"
              unit="টি"
              low={draft.like.minCount}
              high={draft.like.maxCount}
              onLow={(v) => set('like', { minCount: v })}
              onHigh={(v) => set('like', { maxCount: v })}
              min={1}
              max={100}
            />
            <Field label="সাম্প্রতিক কয়টি পোস্টে">
              <Num value={draft.like.recentPosts} onChange={(v) => set('like', { recentPosts: v })} min={1} max={200} ariaLabel="সাম্প্রতিক পোস্ট" />
            </Field>
            <Field label="রিঅ্যাকশনের ভাগ (%)" hint={mixTotal !== 100 ? `মোট ${bn(mixTotal || 0)} — অনুপাত হিসেবে ধরা হবে` : undefined}>
              <div className="grid grid-cols-4 gap-2">
                {(['like', 'love', 'care', 'haha'] as const).map((type) => (
                  <label key={type} className="space-y-0.5">
                    <span className="block text-[11px] text-gray-500 text-center">
                      {{ like: '👍', love: '❤️', care: '🤗', haha: '😆' }[type]}
                    </span>
                    <Num
                      value={draft.like.reactionMix[type]}
                      onChange={(v) => set('like', { reactionMix: { ...draft.like.reactionMix, [type]: v } })}
                      min={0}
                      max={100}
                      ariaLabel={`${type} %`}
                    />
                  </label>
                ))}
              </div>
            </Field>
            <p className="text-[11px] text-gray-500">AI মডেল লাগে না। প্রতিটি রিঅ্যাকশন একজন র‍্যান্ডম AI ইউজারের, যিনি সেই পোস্টে আগে রিঅ্যাক্ট করেননি।</p>
          </div>
        </Card>
      </div>

      {/* Persona generation models */}
      <Card className="p-5 mt-4 sm:mt-6">
        <h3 className="font-bold text-[#2D2327] flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-[#56020A]" /> AI ইউজার তৈরির মডেল
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <ModelPicker
            label="প্রোফাইল (নাম, বায়ো, ভয়েস)"
            value={draft.persona.profileModel}
            onChange={(v) => set('persona', { profileModel: v })}
            catalog={catalog}
          />
          <ModelPicker
            label="প্রোফাইল ছবি"
            value={draft.persona.portraitModel}
            onChange={(v) => set('persona', { portraitModel: v })}
            catalog={catalog}
          />
        </div>
        {catalog === null && (
          <p className="mt-3 text-[11px] text-gray-500 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> মডেলের তালিকা আনা হচ্ছে…
          </p>
        )}
      </Card>

      {/* History */}
      <Card className="mt-4 sm:mt-6 overflow-hidden">
        <h3 className="font-bold text-[#2D2327] flex items-center gap-2 px-5 pt-5 pb-3">
          <Timer className="w-5 h-5 text-[#56020A]" /> সাম্প্রতিক রান
        </h3>
        {runs.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-gray-400">এখনো কোনো রান হয়নি।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#FAF6F0] text-gray-500">
                <tr>
                  <th className="text-left font-semibold px-5 py-2">সময়</th>
                  <th className="text-left font-semibold px-3 py-2">টাস্ক</th>
                  <th className="text-left font-semibold px-3 py-2">AI ইউজার</th>
                  <th className="text-left font-semibold px-3 py-2">ফলাফল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDD6A9]/50">
                {runs.map((r, i) => (
                  <tr key={r.id || i} className={r.ok ? '' : 'bg-red-50/50'}>
                    <td className="px-5 py-2 whitespace-nowrap text-gray-600">{new Date(r.at).toLocaleString('bn-BD')}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {TASK_LABEL[r.what] || r.what}
                      {r.manual && <span className="text-gray-400"> · হাতে</span>}
                    </td>
                    <td className="px-3 py-2 text-gray-700 max-w-[260px] truncate" title={r.personas?.join(', ')}>
                      {r.persona || (r.personas?.length ? `${r.personas[0]}${r.personas.length > 1 ? ` +${bn(r.personas.length - 1)}` : ''}` : '—')}
                    </td>
                    <td className={`px-3 py-2 ${r.ok ? 'text-gray-700' : 'text-red-700'}`}>
                      {r.ok ? (
                        <>
                          <Sparkles className="inline w-3 h-3 text-[#375013] mr-1" />
                          {r.note || (r.withImage ? 'ছবিসহ পোস্ট' : r.topic ? `পোস্ট · ${r.topic}` : 'সফল')}
                          {r.error && <span className="text-amber-700"> ({r.error})</span>}
                        </>
                      ) : (
                        r.error
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
};
