import React, { useState } from 'react';
import { Doctor, DoctorQuestion, Child } from '../../types';
import { ArrowLeft, Stethoscope, Clock, ShieldCheck, Send, CheckCircle2, Video, Plus, X, AlertCircle } from 'lucide-react';
import { SimulatedCallScreen } from './SimulatedCallScreen';

interface AskDoctorScreenProps {
  doctors: Doctor[];
  questions: DoctorQuestion[];
  onUpdateQuestions: (qs: DoctorQuestion[]) => void;
  childrenList: Child[];
  onBack: () => void;
}

export const AskDoctorScreen: React.FC<AskDoctorScreenProps> = ({
  doctors,
  questions,
  onUpdateQuestions,
  childrenList,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'live' | 'leave_question'>('live');

  // Selected doctor modal profile
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [bookingStep, setBookingStep] = useState<'profile' | 'select_child' | 'reason' | 'confirmation'>('profile');
  const [selectedChildForDoc, setSelectedChildForDoc] = useState(childrenList[0]?.name || 'সাধারণ');
  const [consultationReason, setConsultationReason] = useState('');
  const [isWaitingRoom, setIsWaitingRoom] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);

  // Leave a question form
  const [qChild, setQChild] = useState(childrenList[0]?.name || 'সাধারণ প্রশ্ন');
  const [qCategory, setQCategory] = useState('খাবার ও পুষ্টি');
  const [qTitle, setQTitle] = useState('');
  const [qDetails, setQDetails] = useState('');
  const [qSuccess, setQSuccess] = useState(false);

  // Expanded question detail modal
  const [activeQuestion, setActiveQuestion] = useState<DoctorQuestion | null>(null);
  const [followUpText, setFollowUpText] = useState('');

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle.trim() || !qDetails.trim()) return;

    const newQ: DoctorQuestion = {
      id: 'q-' + Date.now(),
      childNameOrGeneral: qChild,
      category: qCategory,
      title: qTitle,
      detailedQuestion: qDetails,
      status: 'উত্তর অপেক্ষায়',
      submissionDate: 'আজ',
      assignedDoctorName: 'ডাঃ মোসাম্মত নাজনীন সুলতানা',
      sampleReply: 'আপনার প্রশ্নটি ডেমো ডাক্তারের কাছে পৌঁছেছে। শীঘ্রই উত্তর দেওয়া হবে।',
      followUpQuestions: [],
      isPrivate: true,
    };

    onUpdateQuestions([newQ, ...questions]);
    setQTitle('');
    setQDetails('');
    setQSuccess(true);
    setTimeout(() => setQSuccess(false), 2000);
  };

  const handleSendFollowUp = (qId: string) => {
    if (!followUpText.trim()) return;
    onUpdateQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          const updatedFollowUps = [...q.followUpQuestions, { sender: 'user' as const, text: followUpText, time: 'এইমাত্র' }];
          return { ...q, followUpQuestions: updatedFollowUps };
        }
        return q;
      })
    );
    setFollowUpText('');
    if (activeQuestion) {
      setActiveQuestion({
        ...activeQuestion,
        followUpQuestions: [...activeQuestion.followUpQuestions, { sender: 'user', text: followUpText, time: 'এইমাত্র' }],
      });
    }
  };

  if (isCallActive && selectedDoc) {
    return (
      <SimulatedCallScreen
        doctorName={selectedDoc.name}
        onEndCall={() => {
          setIsCallActive(false);
          setIsWaitingRoom(false);
          setSelectedDoc(null);
        }}
      />
    );
  }

  if (isWaitingRoom && selectedDoc) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-6 text-center font-hind">
        <div className="bg-white p-8 rounded-3xl border border-[#EDD6A9] shadow-xl max-w-md w-full space-y-6">
          <div className="w-20 h-20 bg-[#375013]/10 text-[#375013] rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Video className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#56020A]">ডাক্তার কনসালটেশন ওয়েটিং রুম</h2>
            <p className="text-xs text-gray-600">
              {selectedDoc.name}-এর সাথে আপনার ভিডিও কল সংযোগ স্থাপন করা হচ্ছে...
            </p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
            জরুরি চিকিৎসার জন্য এই সেবার অপেক্ষা করবেন না।
          </div>
          <button
            onClick={() => setIsCallActive(true)}
            className="w-full py-3.5 bg-[#56020A] text-white font-bold text-xs rounded-xl shadow-lg hover:bg-[#56020A]/90"
          >
            কল শুরু করুন (ডেমো ভিডিও)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col pb-24 font-hind selection:bg-[#EDD6A9] selection:text-[#56020A]">
      {/* Top Header */}
      <div className="bg-[#56020A] text-white p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 rounded-full hover:bg-white/10 text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold">ডাক্তারকে জিজ্ঞেস করুন</h1>
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="bg-white border-b border-[#EDD6A9] px-4 pt-2 flex gap-6 text-xs font-bold text-[#56020A]">
        <button
          onClick={() => setActiveTab('live')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'live' ? 'border-[#56020A] text-[#56020A]' : 'border-transparent text-gray-500'
          }`}
        >
          লাইভ ডাক্তার
        </button>
        <button
          onClick={() => setActiveTab('leave_question')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'leave_question' ? 'border-[#56020A] text-[#56020A]' : 'border-transparent text-gray-500'
          }`}
        >
          প্রশ্ন রেখে দিন ({questions.length})
        </button>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        {/* Emergency Notice */}
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>জরুরি চিকিৎসার জন্য এই সেবার অপেক্ষা করবেন না। যেকোনো জরুরি পরিস্থিতিতে অবিলম্বে নিকটস্থ হাসপাতালে যোগাযোগ করুন।</span>
        </div>

        {activeTab === 'live' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#56020A]">উপলব্ধ শিশু বিশেষজ্ঞগণ</h3>
            <div className="space-y-3">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-white rounded-2xl p-4 border border-[#EDD6A9] shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={doc.avatar} alt={doc.name} className="w-14 h-14 rounded-full object-cover border border-[#EDD6A9]" />
                    <div>
                      <h4 className="text-sm font-bold text-[#56020A]">{doc.name}</h4>
                      <p className="text-[11px] text-[#375013] font-semibold">{doc.specialty}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{doc.experience} · ভাষা: {doc.languages.join(', ')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDoc(doc);
                      setBookingStep('profile');
                    }}
                    className="px-3.5 py-2 bg-[#56020A] text-white text-xs font-bold rounded-xl shadow hover:bg-[#56020A]/90 transition-colors"
                  >
                    কনসালটেশন
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leave_question' && (
          <div className="space-y-6">
            {/* Submit question form */}
            <div className="bg-white rounded-2xl p-4 border border-[#EDD6A9] shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[#56020A]">নতুন প্রশ্ন লিখে পাঠান</h3>
              <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">সন্তান বা সাধারণ</label>
                  <select
                    value={qChild}
                    onChange={(e) => setQChild(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EDD6A9] rounded-xl"
                  >
                    <option value="সাধারণ প্রশ্ন">সাধারণ প্রশ্ন</option>
                    {childrenList.map((c) => (
                      <option key={c.id} value={`${c.name} (${c.dob})`}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">বিভাগ</label>
                  <select
                    value={qCategory}
                    onChange={(e) => setQCategory(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EDD6A9] rounded-xl"
                  >
                    <option value="খাবার ও পুষ্টি">খাবার ও পুষ্টি</option>
                    <option value="ঘুম ও রুটিন">ঘুম ও রুটিন</option>
                    <option value="বিকাশ ও স্বাস্থ্য">বিকাশ ও স্বাস্থ্য</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">প্রশ্নের শিরোনাম</label>
                  <input
                    type="text"
                    value={qTitle}
                    onChange={(e) => setQTitle(e.target.value)}
                    placeholder="সংক্ষেপে আপনার প্রশ্নটি লিখুন..."
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EDD6A9] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">বিস্তারিত বিবরণ</label>
                  <textarea
                    rows={3}
                    value={qDetails}
                    onChange={(e) => setQDetails(e.target.value)}
                    placeholder="বিস্তারিত লক্ষণ বা প্রশ্ন..."
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EDD6A9] rounded-xl"
                  />
                </div>

                {qSuccess && <p className="text-green-700 font-bold bg-green-50 p-2 rounded">প্রশ্ন সফলভাবে জমা হয়েছে!</p>}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#56020A] text-white font-bold rounded-xl shadow"
                >
                  প্রশ্ন জমা দিন (গোপনীয়)
                </button>
              </form>
            </div>

            {/* My Questions list */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#56020A]">আমার প্রশ্ন ও উত্তরসমূহ</h3>
              {questions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => setActiveQuestion(q)}
                  className="bg-white rounded-2xl p-4 border border-[#EDD6A9] shadow-sm space-y-2 cursor-pointer hover:border-[#56020A] transition-colors"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#56020A]">{q.category}</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      q.status === 'উত্তর এসেছে' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-800">{q.title}</h4>
                  <p className="text-[11px] text-gray-500">{q.submissionDate} · {q.childNameOrGeneral}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Doctor Profile & Booking Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EDD6A9] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#56020A]">ডাক্তার কনসালটেশন</h3>
              <button onClick={() => setSelectedDoc(null)} className="p-1 rounded-full hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingStep === 'profile' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <img src={selectedDoc.avatar} alt={selectedDoc.name} className="w-16 h-16 rounded-full object-cover border border-[#EDD6A9]" />
                  <div>
                    <h4 className="font-bold text-[#56020A] text-sm">{selectedDoc.name}</h4>
                    <p className="text-[#375013] font-semibold">{selectedDoc.specialty}</p>
                    <p className="text-gray-500">{selectedDoc.experience}</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#EDD6A9] space-y-1">
                  <p className="font-bold text-[#56020A]">যোগ্যতা (ডেমো):</p>
                  <p className="text-gray-700">{selectedDoc.demoQualifications}</p>
                  <p className="font-bold text-[#56020A] mt-2">কনসালটেশন ফি:</p>
                  <p className="text-gray-700">{selectedDoc.feePlaceholder}</p>
                </div>
                <button
                  onClick={() => setBookingStep('select_child')}
                  className="w-full py-3 bg-[#56020A] text-white font-bold rounded-xl shadow"
                >
                  তাৎক্ষণিক কনসালটেশন শুরু করুন
                </button>
              </div>
            )}

            {bookingStep === 'select_child' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-[#56020A]">কার জন্য পরামর্শ নিতে চান?</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedChildForDoc('সাধারণ প্রশ্ন');
                      setBookingStep('reason');
                    }}
                    className="w-full p-3 bg-white border border-[#EDD6A9] rounded-xl text-left font-semibold hover:bg-amber-50"
                  >
                    সাধারণ প্রশ্ন / নিজের জন্য
                  </button>
                  {childrenList.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setSelectedChildForDoc(ch.name);
                        setBookingStep('reason');
                      }}
                      className="w-full p-3 bg-white border border-[#EDD6A9] rounded-xl text-left font-semibold hover:bg-amber-50"
                    >
                      সন্তান: {ch.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bookingStep === 'reason' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-[#56020A]">কনসালটেশনের কারণ লিখুন</h4>
                <textarea
                  rows={3}
                  value={consultationReason}
                  onChange={(e) => setConsultationReason(e.target.value)}
                  placeholder="যেমন: জ্বর বা ঘুমের সমস্যা..."
                  className="w-full p-3 bg-white border border-[#EDD6A9] rounded-xl"
                />
                <button
                  onClick={() => {
                    if (!consultationReason.trim()) return;
                    setBookingStep('confirmation');
                  }}
                  className="w-full py-3 bg-[#56020A] text-white font-bold rounded-xl shadow"
                >
                  পরবর্তী ধাপ
                </button>
              </div>
            )}

            {bookingStep === 'confirmation' && (
              <div className="space-y-4 text-center text-xs">
                <CheckCircle2 className="w-12 h-12 text-green-700 mx-auto" />
                <h4 className="font-bold text-[#56020A] text-sm">কনসালটেশন বুকিং নিশ্চিত হয়েছে</h4>
                <p className="text-gray-600">{selectedDoc.name} এর সাথে সংযোগের জন্য প্রস্তুত।</p>
                <button
                  onClick={() => {
                    setSelectedDoc(null);
                    setIsWaitingRoom(true);
                  }}
                  className="w-full py-3 bg-[#375013] text-white font-bold rounded-xl shadow"
                >
                  ওয়েটিং রুমে প্রবেশ করুন
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Question Detail Modal */}
      {activeQuestion && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#EDD6A9] overflow-hidden">
            <div className="bg-[#56020A] text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">প্রশ্নের বিস্তারিত</h3>
              <button onClick={() => setActiveQuestion(null)} className="p-1 rounded-full hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-[#EDD6A9] space-y-2">
                <span className="text-[#375013] font-bold">{activeQuestion.category}</span>
                <h4 className="font-bold text-[#56020A] text-sm">{activeQuestion.title}</h4>
                <p className="text-gray-700">{activeQuestion.detailedQuestion}</p>
                <p className="text-[10px] text-gray-400">জমাদানের তারিখ: {activeQuestion.submissionDate}</p>
              </div>

              {activeQuestion.sampleReply && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200 space-y-2">
                  <span className="font-bold text-green-900">{activeQuestion.assignedDoctorName}-এর উত্তর:</span>
                  <p className="text-green-800">{activeQuestion.sampleReply}</p>
                </div>
              )}

              {/* Follow ups */}
              <div className="space-y-2">
                {activeQuestion.followUpQuestions.map((fu, idx) => (
                  <div key={idx} className={`p-2.5 rounded-xl text-xs ${fu.sender === 'user' ? 'bg-amber-100 ml-4' : 'bg-white border border-[#EDD6A9] mr-4'}`}>
                    <span className="font-bold block text-[10px] text-gray-500">{fu.sender === 'user' ? 'আপনি' : 'ডাক্তার'}</span>
                    <p className="text-gray-800">{fu.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={followUpText}
                  onChange={(e) => setFollowUpText(e.target.value)}
                  placeholder="ফলো-আপ প্রশ্ন লিখুন..."
                  className="flex-1 p-2 bg-white border border-[#EDD6A9] rounded-xl"
                />
                <button
                  onClick={() => handleSendFollowUp(activeQuestion.id)}
                  className="px-3 py-2 bg-[#56020A] text-white font-bold rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
