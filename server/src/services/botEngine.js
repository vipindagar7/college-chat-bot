// Smart rule-based chatbot engine
// No AI API needed — matches keywords from your own college data

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = join(__dirname, '../data/college-data.json');

const getData = () => JSON.parse(readFileSync(DATA_PATH, 'utf-8'));

// ─── Intent Patterns (order = priority) ──────────────────────────────────────
// IMPORTANT: more specific patterns first, generic ones last
// Each pattern must be at least 3 chars and reasonably specific

const INTENT_PATTERNS = [
  // Greeting
  { intent: 'greeting', patterns: ['hello', 'hi there', 'hey there', 'good morning', 'good afternoon', 'good evening', 'namaste', 'hii', 'helo', 'hai'] },

  // Specific courses — checked BEFORE generic "fee" / "apply" patterns
  { intent: 'course_btech_cs', patterns: ['btech cs', 'b.tech cs', 'b tech cs', 'btech computer', 'b.tech computer science', 'computer science engineering', 'cse', 'b.tech cse'] },
  { intent: 'course_btech_it', patterns: ['btech it', 'b.tech it', 'b tech it', 'information technology', 'btech information'] },
  { intent: 'course_bca',      patterns: ['bca'] },
  { intent: 'course_mca',      patterns: ['mca'] },
  { intent: 'course_mba',      patterns: ['mba', 'master of business', 'management course'] },
  { intent: 'course_bsc_ds',   patterns: ['data science', 'bsc data', 'b.sc data', 'bsc ds'] },

  // Scholarships — specific keywords, NOT "merit" alone (too generic)
  { intent: 'scholarships', patterns: ['scholarship', 'scholarships', 'fee waiver', 'fee concession', 'financial aid', 'stipend', 'sc st scholarship', 'obc scholarship', 'merit scholarship', 'sports scholarship', 'girl scholarship', 'single girl', 'alumni scholarship', 'discount on fee', 'fee discount', 'fee reduction', 'free seat'] },

  // Fees
  { intent: 'fees', patterns: ['fee structure', 'fee details', 'all fees', 'course fee', 'tuition fee', 'semester fee', 'annual fee', 'total fee', 'how much fee', 'what is the fee', 'fees for', 'fees of', 'cost of', 'charges', '₹', 'rupees', 'how much does'] },

  // Hostel
  { intent: 'hostel', patterns: ['hostel', 'accommodation', 'boys hostel', 'girls hostel', 'dormitory', 'mess facility', 'hostel fee', 'hostel charges', 'hostel room', 'stay in college', 'lodging'] },

  // Placements
  { intent: 'placements', patterns: ['placement', 'placements', 'campus placement', 'job placement', 'package', 'lpa', 'highest package', 'average package', 'placement rate', 'top recruiters', 'which companies', 'hiring companies', 'career'] },

  // Documents
  { intent: 'documents', patterns: ['documents required', 'documents needed', 'what documents', 'which documents', 'required documents', 'document list', 'marksheet', 'transfer certificate', 'migration certificate', 'aadhar', 'what to bring', 'papers required'] },

  // Admission process
  { intent: 'admission_process', patterns: ['how to apply', 'admission process', 'apply online', 'application process', 'admission procedure', 'admission steps', 'how do i join', 'how to get admission', 'enrollment process', 'registration process'] },

  // Important dates
  { intent: 'dates', patterns: ['important dates', 'last date', 'last date to apply', 'application deadline', 'when to apply', 'admission deadline', 'merit list date', 'when does admission', 'admission schedule', 'application open', 'application close'] },

  // Eligibility
  { intent: 'eligibility', patterns: ['eligibility', 'am i eligible', 'who can apply', 'minimum marks', 'minimum percentage', 'required percentage', 'qualification required', 'criteria for admission', '12th percentage', 'graduation marks'] },

  // Contact
  { intent: 'contact', patterns: ['contact', 'phone number', 'contact number', 'email address', 'office address', 'how to reach', 'helpline', 'admission office', 'where is college', 'college location'] },

  // Courses list
  { intent: 'courses_list', patterns: ['all courses', 'courses offered', 'list of courses', 'available programs', 'what programs', 'which programs', 'course list', 'programs offered', 'what courses', 'all programs'] },

  // Help
  { intent: 'help', patterns: ['help', 'what can you do', 'what do you know', 'options', 'show menu', 'guide me', 'i need help'] },

  // Talk to human
  { intent: 'human', patterns: ['talk to counselor', 'human counselor', 'real person', 'talk to someone', 'speak to staff', 'connect me', 'admission counselor'] },

  // Thanks
  { intent: 'thanks', patterns: ['thank you', 'thanks', 'thankyou', 'thank u', 'great thank', 'very helpful', 'got it thanks'] },

  // Bye
  { intent: 'bye', patterns: ['bye', 'goodbye', 'see you', 'take care', 'that is all'] },

  // Greeting fallback — only after all specific checks
  { intent: 'greeting', patterns: ['hi', 'hey', 'hello'] },

  // Generic fee fallback — only after specific course checks
  { intent: 'fees', patterns: ['fee', 'fees', 'how much', 'price'] },

  // Generic apply fallback
  { intent: 'admission_process', patterns: ['apply', 'admission', 'join', 'enroll'] },

  // Generic courses fallback
  { intent: 'courses_list', patterns: ['courses', 'programs', 'programme'] },
];

// ─── Intent Detector ──────────────────────────────────────────────────────────

const detectIntent = (message) => {
  const lower = message.toLowerCase().trim();

  // 1. Check FAQs — but ONLY if a keyword matches at least 4 chars
  //    (prevents short words like "hi", "is", "no" triggering FAQ)
  const data = getData();
  for (const faq of (data.faqs || [])) {
    for (const keyword of (faq.keywords || [])) {
      const kw = keyword.toLowerCase().trim();
      if (kw.length >= 4 && lower.includes(kw)) {
        return { intent: `faq_${faq.id}`, faq };
      }
    }
  }

  // 2. Match intent patterns (longer patterns first within each intent)
  for (const { intent, patterns } of INTENT_PATTERNS) {
    // Sort patterns by length descending so longer/more specific ones match first
    const sorted = [...patterns].sort((a, b) => b.length - a.length);
    for (const pattern of sorted) {
      if (lower.includes(pattern.toLowerCase())) {
        return { intent };
      }
    }
  }

  return { intent: 'unknown' };
};

// ─── Response Builder ─────────────────────────────────────────────────────────

export const getBotResponse = (message) => {
  const data = getData();
  const { intent, faq } = detectIntent(message);

  if (intent?.startsWith('faq_') && faq) {
    return { text: faq.answer, type: 'text' };
  }

  switch (intent) {
    case 'greeting':
      return {
        text: `Hello! 😊 Welcome to **${data.college.name}**.\n\nI can help you with:\n• 📚 Courses & Fees\n• 🎓 Scholarships\n• 🏠 Hostel\n• 💼 Placements\n• 📋 Admission Process\n• 📅 Important Dates\n\nWhat would you like to know?`,
        type: 'text',
      };

    case 'courses_list':
      return {
        text: `📚 We offer **${data.courses.length} programs**:\n\n${data.courses.map(c => `• **${c.shortName}** — ₹${Number(c.annualFee).toLocaleString('en-IN')}/yr | ${c.duration}`).join('\n')}\n\nAsk me about any specific course for full details!`,
        type: 'text',
      };

    case 'fees':
      return {
        text: `💰 **Fee Structure (Annual):**\n\n${data.courses.map(c => `• **${c.shortName}**: ₹${Number(c.annualFee).toLocaleString('en-IN')}/year`).join('\n')}\n\n✅ Fees payable in **2 installments per semester**\n🏦 Education loans via SBI, HDFC & Axis Bank\n\nAsk me about a specific course for details!`,
        type: 'text',
      };

    // ── Scholarships — fixed ──
    case 'scholarships': {
      const s = data.scholarships || [];
      if (!s.length) return { text: 'No scholarship data found. Please contact the admission office.', type: 'text' };
      return {
        text: `🎓 **Available Scholarships:**\n\n${s.map((sc, i) => `**${i + 1}. ${sc.name}**\n   📋 Criteria: ${sc.criteria}\n   💰 Benefit: ${sc.benefit}${sc.renewable ? '\n   ♻️ Renewable every year' : ''}`).join('\n\n')}\n\n📞 Contact admission office to apply: **${data.college.phone}**`,
        type: 'text',
      };
    }

    case 'hostel': {
      const h = data.hostel;
      return {
        text: `🏠 **Hostel Facilities:**\n\n🔵 **Boys Hostel**\n   Seats: ${h.boys.seats} \n   Facilities: ${h.boys.facilities.join(', ')}\n\n🔴 **Girls Hostel**\n   Seats: ${h.girls.seats} \n   Facilities: ${h.girls.facilities.join(', ')}\n\n🍽️ Mess: ${h.messCharges}\n📌 ${h.note}`,
        type: 'text',
      };
    }

    case 'placements': {
      const p = data.placements;
      return {
        text: `💼 **Placement Statistics:**\n\n• 📊 Placement Rate: **${p.placementRate}**\n• 💰 Average Package: **${p.averagePackage}**\n• 🏆 Highest Package: **${p.highestPackage}**\n• 🏢 Companies: **${p.companies}+**\n• 👨‍🎓 Students Placed: **${p.placedStudents}**\n\n**Top Recruiters:**\n${p.topRecruiters.map(r => `• ${r}`).join('\n')}`,
        type: 'text',
      };
    }

    case 'documents':
      return {
        text: `📋 **Documents Required for Admission:**\n\n${(data.documentsRequired || []).map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\n💡 Bring originals + 2 photocopies of each document.`,
        type: 'text',
      };

    case 'admission_process':
      return {
        text: `📝 **Admission Process — Step by Step:**\n\n${(data.admissionProcess || []).map((s, i) => `**Step ${i + 1}:** ${s}`).join('\n')}\n\n🌐 Apply at: **${data.college.website}**`,
        type: 'text',
      };

    case 'dates': {
      const d = data.importantDates || {};
      return {
        text: `📅 **Important Admission Dates:**\n\n• 🟢 Applications Open: **${d.applicationStart || 'TBA'}**\n• 🔴 Last Date to Apply: **${d.applicationEnd || 'TBA'}**\n• 📋 First Merit List: **${d.firstMeritList || 'TBA'}**\n• ⏰ Admission Deadline: **${d.admissionDeadline || 'TBA'}**\n• 🏫 Classes Begin: **${d.classesBegin || 'TBA'}**`,
        type: 'text',
      };
    }

    case 'eligibility':
      return {
        text: `✅ **Eligibility Criteria:**\n\n${data.courses.map(c => `• **${c.shortName}**: ${c.eligibility}`).join('\n')}\n\nNeed eligibility for a specific course? Just ask!`,
        type: 'text',
      };

    case 'contact':
      return {
        text: `📞 **Contact Us:**\n\n• 📱 Phone: **${data.college.phone}**\n• 📧 Email: **${data.college.email}**\n• 🏛️ Address: ${data.college.address}\n• 🌐 Website: ${data.college.website}\n\n⏰ Office Hours: Mon–Sat, 9 AM to 5 PM`,
        type: 'text',
      };

    case 'course_bca':      return courseDetail(data.courses.find(x => x.id === 'bca'), data);
    case 'course_btech_cs': return courseDetail(data.courses.find(x => x.id === 'btech-cs'), data);
    case 'course_btech_it': return courseDetail(data.courses.find(x => x.id === 'btech-it'), data);
    case 'course_mca':      return courseDetail(data.courses.find(x => x.id === 'mca'), data);
    case 'course_mba':      return courseDetail(data.courses.find(x => x.id === 'mba'), data);
    case 'course_bsc_ds':   return courseDetail(data.courses.find(x => x.id === 'bsc-ds'), data);

    case 'help':
      return {
        text: `🤖 **I can answer questions about:**\n\n• Type **"courses"** — all programs & fees\n• Type **"scholarship"** — available scholarships\n• Type **"hostel"** — accommodation details\n• Type **"placements"** — job stats & companies\n• Type **"documents required"** — what to bring\n• Type **"how to apply"** — admission steps\n• Type **"important dates"** — deadlines\n• Type **"eligibility"** — who can apply\n• Type **"contact"** — phone & email\n\nOr just ask naturally: "What is the BCA fee?"`,
        type: 'text',
      };

    case 'human':
      return {
        text: `👩‍💼 **Talk to an Admission Counselor:**\n\n📱 Call: **${data.college.phone}**\n📧 Email: **${data.college.email}**\n\n⏰ Available: Monday–Saturday, 9 AM to 5 PM\n\n📍 Visit us at: ${data.college.address}`,
        type: 'text',
      };

    case 'thanks':
      return { text: `You're welcome! 😊 Is there anything else I can help you with?`, type: 'text' };

    case 'bye':
      return { text: `Goodbye! 👋 Best of luck with your admission to **${data.college.name}**! Feel free to come back anytime. 🎓`, type: 'text' };

    default:
      return {
        text: `🤔 I'm not sure about that. Here are some things I can help with:\n\n• **"scholarship"** — available scholarships & criteria\n• **"BCA fee"** — course fee details\n• **"hostel"** — accommodation\n• **"placements"** — job stats\n• **"how to apply"** — admission steps\n• **"contact"** — reach us\n\nOr call us directly: **${data.college.phone}**`,
        type: 'text',
      };
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const courseDetail = (c, data) => {
  if (!c) return { text: `Course not found. Type **"courses"** to see all available programs.`, type: 'text' };
  return {
    text: `📚 **${c.name}**\n\n• ⏱️ Duration: **${c.duration}**\n• 💰 Annual Fee: **₹${Number(c.annualFee).toLocaleString('en-IN')}**\n• 🪑 Seats: **${c.seats}**\n• ✅ Eligibility: ${c.eligibility}\n\n📖 ${c.description}\n\nWant to know about **scholarships** or **how to apply**?`,
    type: 'text',
  };
};

// ─── Data Editor API ──────────────────────────────────────────────────────────

export const getCollegeData = () => getData();

export const updateCollegeData = (newData) => {
  writeFileSync(DATA_PATH, JSON.stringify(newData, null, 2), 'utf-8');
};

export const addFaq = (faq) => {
  const data = getData();
  faq.id = `faq${Date.now()}`;
  data.faqs.push(faq);
  updateCollegeData(data);
  return faq;
};

export const updateFaq = (id, updatedFaq) => {
  const data = getData();
  const idx = data.faqs.findIndex(f => f.id === id);
  if (idx === -1) throw new Error('FAQ not found');
  data.faqs[idx] = { ...data.faqs[idx], ...updatedFaq };
  updateCollegeData(data);
  return data.faqs[idx];
};

export const deleteFaq = (id) => {
  const data = getData();
  data.faqs = data.faqs.filter(f => f.id !== id);
  updateCollegeData(data);
};
