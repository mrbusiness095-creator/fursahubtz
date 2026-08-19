import { useEffect } from "react";
import { toast } from "sonner";

type Testimonial = {
  name: string;
  place: string;
  text: string;
  icon: string;
  avatar: string;
};

const TESTIMONIALS: Testimonial[] = [
  { name: "Neema J.", place: "Dar es Salaam", text: "Amelipwa TZS 68,000 kwa kuchati na mgeni kutoka Germany.", icon: "💬", avatar: "https://i.pravatar.cc/150?img=1" },
  { name: "Baraka M.", place: "Mwanza", text: "Amepokea mkopo wa TZS 450,000 ndani ya dakika 10.", icon: "💰", avatar: "https://i.pravatar.cc/150?img=3" },
  { name: "Salma H.", place: "Zanzibar", text: "Amepata kazi ya Hotel Housekeeping Dubai 🇦🇪.", icon: "🌍", avatar: "https://i.pravatar.cc/150?img=5" },
  { name: "Emmanuel K.", place: "Arusha", text: "Amelipwa TZS 124,500 kwa mazungumzo ya wiki hii.", icon: "💬", avatar: "https://i.pravatar.cc/150?img=8" },
  { name: "Fatuma S.", place: "Dodoma", text: "Mkopo wa biashara TZS 1,200,000 umeidhinishwa.", icon: "💰", avatar: "https://i.pravatar.cc/150?img=10" },
  { name: "Joseph N.", place: "Mbeya", text: "Amesaini contract ya Farm Worker Canada 🇨🇦.", icon: "🌍", avatar: "https://i.pravatar.cc/150?img=11" },
  { name: "Rehema A.", place: "Tanga", text: "Amelipwa TZS 92,000 baada ya kuchati na mteja UK.", icon: "💬", avatar: "https://i.pravatar.cc/150?img=12" },
  { name: "Hamisi R.", place: "Morogoro", text: "Amepata mkopo wa bodaboda TZS 2,300,000.", icon: "💰", avatar: "https://i.pravatar.cc/150?img=13" },
  { name: "Grace P.", place: "Moshi", text: "Amepata ajira ya Care Assistant UK 🇬🇧 na sponsorship.", icon: "🌍", avatar: "https://i.pravatar.cc/150?img=15" },
  { name: "Ally T.", place: "Kigoma", text: "Amelipwa TZS 47,500 leo asubuhi kwa kuchat.", icon: "💬", avatar: "https://i.pravatar.cc/150?img=17" },
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
        icon: (
          <img
            src={t.avatar}
            alt={t.name}
            className="h-8 w-8 rounded-full border border-border object-cover shadow-sm"
            loading="eager"
          />
        ),
        className: "rounded-2xl border border-border shadow-float",
      });
      timer = setTimeout(show, 9000 + Math.random() * 6000);
    };

    timer = setTimeout(show, 3500);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
