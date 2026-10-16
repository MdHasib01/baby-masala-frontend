import React, { useState, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, ShieldAlert, Sparkles } from 'lucide-react';

interface SimulatedCallScreenProps {
  doctorName: string;
  onEndCall: () => void;
}

export const SimulatedCallScreen: React.FC<SimulatedCallScreenProps> = ({ doctorName, onEndCall }) => {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [callTime, setCallTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-70 bg-gray-900 text-white flex flex-col justify-between p-6 font-hind">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-black/40 backdrop-blur-md px-4 py-3 rounded-2xl">
        <div>
          <h2 className="text-sm font-bold">{doctorName}</h2>
          <p className="text-[10px] text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> লাইভ ভিডিও কনসালটেশন (ডেমো)
          </p>
        </div>
        <div className="bg-black/60 px-3 py-1 rounded-full text-xs font-mono">
          {formatTime(callTime)}
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex items-center justify-center relative my-4">
        <div className="w-full max-w-lg h-96 bg-gray-800 rounded-3xl overflow-hidden border-2 border-[#EDD6A9]/30 relative flex items-center justify-center shadow-2xl">
          {camOn ? (
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-gray-800 to-[#56020A]/40 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#EDD6A9] mb-3 shadow-lg">
                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80" alt="Doctor" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-base font-bold text-white">{doctorName}</h3>
              <p className="text-xs text-[#EDD6A9]">"আপনার শিশুর পুষ্টি ও ঘুম নিয়ে বলুন, আমি শুনছি..."</p>
            </div>
          ) : (
            <div className="text-gray-500 text-xs">ক্যামেরা বন্ধ রয়েছে</div>
          )}

          {/* Self view PiP */}
          <div className="absolute bottom-4 right-4 w-24 h-32 bg-gray-700 rounded-xl overflow-hidden border-2 border-white shadow-md flex items-center justify-center text-[10px] text-gray-300">
            {camOn ? 'আপনার ক্যামেরা' : 'ভিডিও বন্ধ'}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center gap-4 pb-4">
        <button
          onClick={() => setMicOn(!micOn)}
          className={`p-4 rounded-full transition-colors ${micOn ? 'bg-white/20 text-white' : 'bg-red-600 text-white'}`}
        >
          {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button
          onClick={() => setCamOn(!camOn)}
          className={`p-4 rounded-full transition-colors ${camOn ? 'bg-white/20 text-white' : 'bg-red-600 text-white'}`}
        >
          {camOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <button
          onClick={onEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform hover:scale-105"
          title="কল শেষ করুন"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>

      <div className="text-center text-[10px] text-gray-400">
        জরুরি চিকিৎসার জন্য এই সিমুলেটেড সেশনের অপেক্ষা করবেন না।
      </div>
    </div>
  );
};
