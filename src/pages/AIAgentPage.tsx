import { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Shield, MapPin, ChevronDown } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { useAuth } from '../context/AuthContext';
import { useSafety } from '../context/SafetyContext';
import { aiApi, ApiError } from '../utils/api';

// ─── Offline knowledge base (used when backend AI is unavailable) ────────────
const SAFETY_KB: { patterns: RegExp[]; response: string }[] = [
  {
    patterns: [/\bsos\b/i, /\bemergency\b/i, /\bhelp me\b/i, /\bdanger\b/i, /\battack/i],
    response: `🚨 **Emergency Steps:**
1. Press the red SOS button on your dashboard and hold for 3 seconds
2. Your location will be shared with trusted contacts
3. **Call 112** (Police) or **100** (Emergency) immediately
4. Try to move to a lit, crowded, public area
5. Make noise — shout, activate your phone alarm
6. If followed, enter a shop or police post`,
  },
  {
    patterns: [/\bfollowed\b/i, /\bstalker\b/i, /\bsomeone following\b/i],
    response: `🛡️ **If You're Being Followed:**
1. **Don't go home directly** — enter a busy public place
2. Call a trusted contact and stay on the line
3. Use the Fake Call feature to appear occupied
4. Tell a shopkeeper or security guard
5. Activate Safety Mode — your location is being shared
6. Call **112** if the threat escalates`,
  },
  {
    patterns: [/\bfake call\b/i, /\bdistraction call\b/i],
    response: `📞 **Fake Incoming Call:**
Tap "Fake Call" in Quick Actions on your dashboard. It simulates an urgent incoming call that you can "answer" to appear occupied and deter threats.`,
  },
  {
    patterns: [/\bnight\b/i, /\blate.*walk\b/i, /\bwalk.*alone\b/i],
    response: `🌙 **Walking Alone at Night:**
1. Stay on well-lit, busy streets
2. Share your live location with a trusted contact
3. Enable Safety Mode + Travel Mode with 15-min check-ins
4. Keep your phone charged and accessible
5. Trust your instincts — cross the street if unsure
6. Avoid headphones in both ears`,
  },
  {
    patterns: [/\btravel\b/i, /\bcommute\b/i, /\bcheck.?in\b/i],
    response: `✈️ **Travel Safety Mode:**
Set your destination and check-in interval (5–120 min). If you miss a check-in, SOS activates automatically. Go to **Travel Safety** from your dashboard.`,
  },
  {
    patterns: [/\bcontact\b/i, /\btrusted\b/i, /\bwho.*notified\b/i],
    response: `👥 **Trusted Contacts:**
Add people who will be alerted when you trigger SOS. Mark any as "Primary Emergency Contact" — they're notified first. Go to the **Contacts** tab → tap **Add**.`,
  },
  {
    patterns: [/\bshake\b/i, /\bshake.*detect\b/i],
    response: `📱 **Shake Detection:**
When enabled in Settings, vigorously shaking your phone triggers a Safety Check. Enable it: Settings → Permissions → Shake Detection ✓`,
  },
  {
    patterns: [/\bmap\b/i, /\brisk\b/i, /\bdangerous area\b/i],
    response: `🗺️ **Safety Map:**
The map shows risk zones in green (low), amber (caution), red (danger). Tap **Track GPS** to record your movement trail. Search any destination using OpenStreetMap geocoding.`,
  },
  {
    patterns: [/\bpolice\b/i, /\b112\b/, /\bemergency number\b/i],
    response: `🚔 **Emergency Numbers (India):**
- **112** — All-in-one emergency
- **100** — Police
- **1091** — Women's Helpline
- **102** — Ambulance

The SOS screen has a direct "Call Police 112" button.`,
  },
  {
    patterns: [/\btips\b/i, /\bsafety tips\b/i, /\badvice\b/i, /\bstay safe\b/i],
    response: `💡 **General Safety Tips:**
1. Share live location when traveling alone
2. Enable Safety Mode before entering unfamiliar areas
3. Keep your phone charged (carry a power bank)
4. Trust your instincts — leave if something feels wrong
5. Vary your routines — predictable routes are riskier
6. Know your nearest police station and hospital`,
  },
  {
    patterns: [/\bhello\b/i, /\bhi\b/i, /\bhey\b/i, /\bnamaste\b/i],
    response: `👋 Hello! I'm **Priya**, your AI Safety Assistant.

I can help with:
- 🆘 Emergency guidance and SOS activation
- 🗺️ Map and GPS navigation help
- 🌙 Safety tips for walking alone, travel, commuting
- 📞 Using Fake Call as a distraction
- 👥 Managing trusted contacts

What do you need help with today?`,
  },
];

const QUICK_PROMPTS = [
  "I'm being followed, what should I do?",
  "How do I trigger SOS?",
  "Safety tips for walking alone at night",
  "How does Travel Mode work?",
  "What are emergency numbers?",
];

function getOfflineResponse(input: string): string {
  for (const kb of SAFETY_KB) {
    if (kb.patterns.some(p => p.test(input))) return kb.response;
  }
  return `I understand you need help. Here's what I can assist with:

🆘 **Emergency** — Type "SOS" or "emergency"
🗺️ **Map** — Type "map" or "risk zones"
🌙 **Safety tips** — Type "tips" or "walking alone at night"
📞 **Fake call** — Type "fake call"
📞 **Emergency numbers** — Type "police" or "112"

Or ask me anything about staying safe. 💜`;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export function AIAgentPage() {
  const { user, backendAvailable } = useAuth();
  const { safetyStatus, location } = useSafety();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: `👋 Hi ${user?.name?.split(' ')[0] ?? 'there'}! I'm **Priya**, your AI Safety Assistant.

Current status: **${safetyStatus}** ${safetyStatus === 'SAFE' ? '✅' : safetyStatus === 'CAUTION' ? '⚠️' : '🚨'}
${location ? `📍 Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '📍 Location not acquired yet'}

How can I help keep you safe today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null); // null = unknown
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setShowQuickPrompts(false);

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let responseText = '';

      // Try backend AI proxy first (keys are server-side)
      if (backendAvailable) {
        try {
          const history = messages.slice(-8).map(m => ({ role: m.role, content: m.text }));
          history.push({ role: 'user', content: text.trim() });

          const contextStr = [
            `Safety status: ${safetyStatus}`,
            location ? `Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '',
          ].filter(Boolean).join('. ');

          const resp = await aiApi.chat(history, contextStr);
          responseText = resp.reply;
          setAiAvailable(true);
        } catch (err) {
          if (err instanceof ApiError && err.status === 503) {
            // Server says no AI configured
            setAiAvailable(false);
          }
          // Fall through to offline KB
          await new Promise(r => setTimeout(r, 400));
          responseText = getOfflineResponse(text);
        }
      } else {
        // Backend not available — use offline KB
        setAiAvailable(false);
        await new Promise(r => setTimeout(r, 500 + Math.random() * 300));
        responseText = getOfflineResponse(text);
      }

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: responseText,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const renderText = (text: string) =>
    text.split('\n').map((line, i) => (
      <p key={i} className={`${i > 0 ? 'mt-1' : ''} leading-relaxed`}>
        {line.split(/\*\*(.+?)\*\*/g).map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
      </p>
    ));

  const statusIndicator = aiAvailable === true ? 'bg-green-400' : aiAvailable === false ? 'bg-yellow-400' : 'bg-gray-300';

  return (
    <PageLayout title="AI Safety Agent — Priya" showNav showBack>
      <div className="flex flex-col" style={{ height: 'calc(100vh - 112px)' }}>

        {/* Banner */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">Priya — Your Safety AI</p>
            <p className="text-pink-200 text-xs truncate">
              {aiAvailable === true
                ? 'Connected to AI backend'
                : aiAvailable === false
                ? 'Offline mode — using safety knowledge base'
                : 'Checking AI availability…'}
            </p>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusIndicator}`} />
        </div>

        {/* Context bar */}
        <div className="bg-pink-50 border-b border-pink-100 px-4 py-1.5 flex gap-4 text-xs flex-shrink-0">
          <span className="flex items-center gap-1 text-pink-700">
            <Shield size={11} /> Status: <strong>{safetyStatus}</strong>
          </span>
          {location && (
            <span className="flex items-center gap-1 text-pink-600">
              <MapPin size={11} />
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant' ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-gray-200'
              }`}>
                {msg.role === 'assistant'
                  ? <Sparkles size={14} className="text-white" />
                  : <User size={14} className="text-gray-600" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                msg.role === 'assistant'
                  ? 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-none'
                  : 'bg-pink-600 text-white rounded-tr-none'
              }`}>
                {renderText(msg.text)}
                <p className={`text-xs mt-1.5 ${msg.role === 'assistant' ? 'text-gray-400' : 'text-pink-200'}`}>
                  {msg.timestamp.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex gap-1.5 items-center">
                  {[0, 150, 300].map(d => (
                    <div key={d} className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        {showQuickPrompts && (
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-gray-500 font-medium">Quick Questions</p>
              <button onClick={() => setShowQuickPrompts(false)} className="text-gray-400">
                <ChevronDown size={14} />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => sendMessage(p)}
                  className="flex-shrink-0 text-xs bg-pink-50 text-pink-700 border border-pink-200 rounded-full px-3 py-1.5 font-medium hover:bg-pink-100 transition-colors">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex gap-2 items-end flex-shrink-0">
          <textarea
            rows={1}
            className="flex-1 resize-none border border-gray-200 rounded-2xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50 transition-all max-h-28 overflow-y-auto"
            placeholder="Ask Priya anything about safety…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
            className="w-10 h-10 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 rounded-full flex items-center justify-center flex-shrink-0 transition-colors active:scale-95">
            <Send size={16} className="text-white" />
          </button>
        </div>

        <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <p className="text-xs text-gray-400 text-center">
            {aiAvailable === true
              ? `🤖 Powered by AI · Set OPENAI_API_KEY or GEMINI_API_KEY on your backend server`
              : `📖 Offline mode · Set OPENAI_API_KEY on your backend to enable live AI`}
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
