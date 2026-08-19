import { useEffect } from "react";
import { toast } from "sonner";

type Testimonial = { name: string; place: string; text: string; icon: string };

const TESTIMONIALS: Testimonial[] = [
  { name: "Neema J.", place: "Dar es Salaam", text: "Amelipwa TZS 68,000 kwa kuchati na mgeni kutoka Germany.", icon: "💬" },
  { name: "Baraka M.", place: "Mwanza", text: "Amepokea mkopo wa TZS 450,000 ndani ya dakika 10.", icon: "💰" },
  { name: "Salma H.", place: "Zanzibar", text: "Amepata kazi ya Hotel Housekeeping Dubai 🇦🇪.", icon: "🌍" },
  { name: "Emmanuel K.", place: "Arusha", text: "Amelipwa TZS 124,500 kwa mazungumzo ya wiki hii.", icon: "💬" },
  { name: "Fatuma S.", place: "Dodoma", text: "Mkopo wa biashara TZS 1,200,000 umeidhinishwa.", icon: "💰" },
  { name: "Joseph N.", place: "Mbeya", text: "Amesaini contract ya Farm Worker Canada 🇨🇦.", icon: "🌍" },
  { name: "Rehema A.", place: "Tanga", text: "Amelipwa TZS 92,000 baada ya kuchati na mteja UK.", icon: "💬" },
  { name: "Hamisi R.", place: "Morogoro", text: "Amepata mkopo wa bodaboda TZS 2,300,000.", icon: "💰" },
  { name: "Grace P.", place: "Moshi", text: "Amepata ajira ya Care Assistant UK 🇬🇧 na sponsorship.", icon: "🌍" },
  { name: "Ally T.", place: "Kigoma", text: "Amelipwa TZS 47,500 leo asubuhi kwa kuchat.", icon: "💬" },
];

export function TestimonialToasts() {
  useEffect(() => {
    let i = Math.floor(Math.random() * TESTIMONIALS.length);
    let timer: ReturnType<typeof setTimeout>;

    const show = () => {
      const t = TESTIMONIALS[i % TESTIMONIALS.length]!;
      i++;
      toast(`${t.icon} ${t.name} — ${t.place}`, {
        description: t.text,
        duration: 5000,
      });
      timer = setTimeout(show, 9000 + Math.random() * 6000);
    };

    timer = setTimeout(show, 3500);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
