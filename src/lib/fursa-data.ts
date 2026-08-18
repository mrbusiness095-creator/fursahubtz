export const REGISTER_URL = "https://kozenasite.site/register?ref=Ricious";
export const SUPPORT_NUMBER = "0743871339";

export type Profile = {
  seed: string;
  name: string;
  country: string;
  flag: string;
  photo: string;
  online: boolean;
  rating: string;
  minutes: number;
  topic: string;
  amount: number;
};

const NAMES = [
  "Emma", "Sophie", "Lucas", "Marie", "Hannah", "Julia", "Noah", "Olivia",
  "Liam", "Chloe", "Anna", "David", "Isabella", "Mateo", "Elena", "Sara",
  "Thomas", "Laura", "Nathan", "Mia", "Leon", "Amelie", "Jack", "Nora",
  "Victor", "Clara", "Felix", "Grace", "Oscar", "Lena", "Adam", "Ruby",
  "Marco", "Alice", "Daniel", "Zoe", "Erik", "Nina", "Paul", "Ava",
];

const COUNTRIES: Array<{ country: string; flag: string }> = [
  { country: "France", flag: "🇫🇷" },
  { country: "Germany", flag: "🇩🇪" },
  { country: "Canada", flag: "🇨🇦" },
  { country: "United Kingdom", flag: "🇬🇧" },
  { country: "USA", flag: "🇺🇸" },
  { country: "Spain", flag: "🇪🇸" },
  { country: "Italy", flag: "🇮🇹" },
  { country: "Netherlands", flag: "🇳🇱" },
  { country: "Sweden", flag: "🇸🇪" },
  { country: "Norway", flag: "🇳🇴" },
  { country: "Australia", flag: "🇦🇺" },
  { country: "Belgium", flag: "🇧🇪" },
  { country: "Switzerland", flag: "🇨🇭" },
  { country: "Japan", flag: "🇯🇵" },
  { country: "Brazil", flag: "🇧🇷" },
  { country: "Portugal", flag: "🇵🇹" },
];

const TOPICS = [
  "Fashion & Cultural Clothes",
  "Swahili Basics",
  "African Food & Recipes",
  "Travel & Safari",
  "Music & Dance",
  "Family Life in Tanzania",
  "Business & Markets",
  "Zanzibar Beaches",
  "Traditional Weddings",
  "Sports & Football",
  "Art & Crafts",
  "Daily Life Conversation",
];

/** Deterministic string seed -> random generator */
export function rngFromSeed(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function profileFromSeed(seed: string): Profile {
  const r = rngFromSeed(seed);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(r() * arr.length)]!;
  const c = pick(COUNTRIES);
  const minutes = 10 + Math.floor(r() * 11) * 5;
  const amount = Math.round((minutes * (900 + r() * 500)) / 500) * 500;
  return {
    seed,
    name: pick(NAMES),
    country: c.country,
    flag: c.flag,
    photo: `https://i.pravatar.cc/240?img=${1 + Math.floor(r() * 70)}`,
    online: r() > 0.2,
    rating: (4.3 + r() * 0.7).toFixed(1),
    minutes,
    topic: pick(TOPICS),
    amount,
  };
}

export function generateProfiles(count = 12): Profile[] {
  return Array.from({ length: count }, () =>
    profileFromSeed(Math.random().toString(36).slice(2, 10)),
  );
}

export const money = (n: number) => `TZS ${n.toLocaleString("en-US")}`;

export type Loan = {
  id: string;
  title: string;
  amount: string;
  duration: string;
  fees: string;
  desc: string;
  icon: string;
};

export const LOANS: Loan[] = [
  {
    id: "haraka",
    title: "Mkopo wa Haraka",
    amount: "TZS 50,000 - 500,000",
    duration: "Siku 30",
    fees: "Riba 8% kwa mwezi",
    desc: "Pesa taslimu ndani ya dakika 10 baada ya kuidhinishwa.",
    icon: "⚡",
  },
  {
    id: "biashara",
    title: "Mkopo wa Biashara",
    amount: "TZS 500,000 - 5,000,000",
    duration: "Miezi 3 - 12",
    fees: "Riba 5% kwa mwezi",
    desc: "Kukuza biashara yako ndogo na ya kati.",
    icon: "🏪",
  },
  {
    id: "mshahara",
    title: "Mkopo wa Mshahara",
    amount: "TZS 200,000 - 3,000,000",
    duration: "Miezi 1 - 6",
    fees: "Riba 4.5% kwa mwezi",
    desc: "Kwa waajiriwa wenye mshahara wa kila mwezi.",
    icon: "💼",
  },
  {
    id: "kilimo",
    title: "Mkopo wa Kilimo",
    amount: "TZS 300,000 - 2,000,000",
    duration: "Msimu mmoja (miezi 6)",
    fees: "Riba 6% kwa mwezi",
    desc: "Pembejeo, mbegu na zana za kilimo.",
    icon: "🌾",
  },
  {
    id: "bodaboda",
    title: "Mkopo wa Bodaboda",
    amount: "TZS 1,000,000 - 4,500,000",
    duration: "Miezi 6 - 18",
    fees: "Riba 5.5% kwa mwezi",
    desc: "Nunua pikipiki na ulipe kidogo kidogo.",
    icon: "🏍️",
  },
  {
    id: "elimu",
    title: "Mkopo wa Ada",
    amount: "TZS 150,000 - 2,500,000",
    duration: "Muhula mmoja",
    fees: "Riba 4% kwa mwezi",
    desc: "Lipia ada ya shule au chuo kwa wakati.",
    icon: "🎓",
  },
];

export type Job = {
  id: string;
  title: string;
  country: string;
  flag: string;
  employer: string;
  salary: string;
  type: string;
  city: string;
  requirements: string[];
  description: string;
};

export const JOB_COUNTRIES = [
  { country: "UAE", flag: "🇦🇪" },
  { country: "Saudi Arabia", flag: "🇸🇦" },
  { country: "Qatar", flag: "🇶🇦" },
  { country: "Canada", flag: "🇨🇦" },
  { country: "UK", flag: "🇬🇧" },
  { country: "Germany", flag: "🇩🇪" },
  { country: "Australia", flag: "🇦🇺" },
  { country: "USA", flag: "🇺🇸" },
];

export const JOBS: Job[] = [
  {
    id: "uae-hotel",
    title: "Hotel Housekeeping Staff",
    country: "UAE",
    flag: "🇦🇪",
    employer: "Al Reem Hospitality Group",
    salary: "TZS 1,850,000 / mwezi",
    type: "Full Time · Contract ya miaka 2",
    city: "Dubai",
    requirements: ["Kiingereza cha kawaida", "Passport halali", "Umri 21-40"],
    description:
      "Kazi ya usafi na huduma kwa wageni katika hoteli ya nyota nne Dubai. Chakula na malazi hulipiwa na mwajiri.",
  },
  {
    id: "uae-security",
    title: "Security Guard",
    country: "UAE",
    flag: "🇦🇪",
    employer: "Emirates Secure Services",
    salary: "TZS 1,600,000 / mwezi",
    type: "Full Time",
    city: "Abu Dhabi",
    requirements: ["Afya njema", "Cheti cha kidato cha nne", "Passport halali"],
    description: "Ulinzi wa majengo ya biashara. Mafunzo hutolewa kabla ya kuanza kazi.",
  },
  {
    id: "saudi-driver",
    title: "Company Driver",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    employer: "Najd Logistics",
    salary: "TZS 2,100,000 / mwezi",
    type: "Full Time · Contract ya miaka 2",
    city: "Riyadh",
    requirements: ["Leseni daraja C", "Uzoefu wa miaka 2", "Kiingereza cha kawaida"],
    description: "Kuendesha magari ya kampuni na usafirishaji wa mizigo mijini.",
  },
  {
    id: "saudi-cleaner",
    title: "Facility Cleaner",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    employer: "Tawuniya Facilities",
    salary: "TZS 1,450,000 / mwezi",
    type: "Full Time",
    city: "Jeddah",
    requirements: ["Umri 20-45", "Passport halali"],
    description: "Usafi wa ofisi na maeneo ya wazi. Malazi bure.",
  },
  {
    id: "qatar-waiter",
    title: "Restaurant Waiter",
    country: "Qatar",
    flag: "🇶🇦",
    employer: "Doha Bay Restaurants",
    salary: "TZS 1,950,000 / mwezi",
    type: "Full Time",
    city: "Doha",
    requirements: ["Kiingereza kizuri", "Mwonekano mzuri", "Uzoefu wa mgahawa"],
    description: "Huduma kwa wateja katika mgahawa wa kimataifa. Tips za ziada.",
  },
  {
    id: "qatar-welder",
    title: "Welder / Fabricator",
    country: "Qatar",
    flag: "🇶🇦",
    employer: "Gulf Steel Works",
    salary: "TZS 2,600,000 / mwezi",
    type: "Full Time · Contract",
    city: "Al Wakrah",
    requirements: ["Cheti cha VETA", "Uzoefu wa miaka 3"],
    description: "Uchomeleaji vyuma katika miradi ya ujenzi wa viwanda.",
  },
  {
    id: "canada-farm",
    title: "Farm Worker",
    country: "Canada",
    flag: "🇨🇦",
    employer: "Maple Fields Agro",
    salary: "TZS 4,200,000 / mwezi",
    type: "Seasonal · Work Permit",
    city: "Ontario",
    requirements: ["Afya njema", "Kiingereza cha kawaida", "Passport halali"],
    description: "Kazi za shambani za kuvuna matunda na mboga. Usafiri hulipiwa.",
  },
  {
    id: "uk-care",
    title: "Care Assistant",
    country: "UK",
    flag: "🇬🇧",
    employer: "Brightwell Care Homes",
    salary: "TZS 5,100,000 / mwezi",
    type: "Full Time · Sponsorship",
    city: "Manchester",
    requirements: ["IELTS 5.0+", "Uzoefu wa uuguzi", "Cheti cha afya"],
    description: "Kuhudumia wazee katika nyumba za huduma. Visa sponsorship inatolewa.",
  },
  {
    id: "germany-nurse",
    title: "Registered Nurse",
    country: "Germany",
    flag: "🇩🇪",
    employer: "Berlin Klinikum",
    salary: "TZS 6,400,000 / mwezi",
    type: "Full Time · Permanent",
    city: "Berlin",
    requirements: ["Degree ya uuguzi", "Kijerumani B1", "Usajili wa taaluma"],
    description: "Huduma za uuguzi hospitalini. Mafunzo ya lugha hutolewa.",
  },
  {
    id: "australia-chef",
    title: "Commercial Chef",
    country: "Australia",
    flag: "🇦🇺",
    employer: "Sydney Harbour Kitchen",
    salary: "TZS 7,200,000 / mwezi",
    type: "Full Time · Sponsorship",
    city: "Sydney",
    requirements: ["Uzoefu wa miaka 4", "Kiingereza kizuri"],
    description: "Kupika vyakula vya kimataifa katika mgahawa wa hoteli kubwa.",
  },
  {
    id: "usa-warehouse",
    title: "Warehouse Associate",
    country: "USA",
    flag: "🇺🇸",
    employer: "NorthStar Distribution",
    salary: "TZS 6,000,000 / mwezi",
    type: "Full Time",
    city: "Texas",
    requirements: ["Kiingereza cha kawaida", "Nguvu za kimwili", "Visa halali"],
    description: "Kupanga na kupakia mizigo katika ghala kubwa la usambazaji.",
  },
  {
    id: "uk-cleaner",
    title: "Hotel Cleaner",
    country: "UK",
    flag: "🇬🇧",
    employer: "London Stay Hotels",
    salary: "TZS 4,600,000 / mwezi",
    type: "Full Time",
    city: "London",
    requirements: ["Kiingereza cha kawaida", "Passport halali"],
    description: "Usafi wa vyumba vya hoteli katikati ya jiji la London.",
  },
];
