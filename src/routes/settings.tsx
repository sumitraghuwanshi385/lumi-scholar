import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { School, BookOpen, GraduationCap, Brain, Bell } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: Settings,
  head: () => ({
    meta: [
      { title: "Settings — AurorIQ" },
      { name: "description", content: "Configure your school profile, subjects, grading scale and AI sensitivity." },
    ],
  }),
});

const SECTIONS = [
  { icon: School, title: "School profile", desc: "Name, logo, address and academic year" },
  { icon: BookOpen, title: "Subject management", desc: "Subjects, teachers and credit weights" },
  { icon: GraduationCap, title: "Grading scale", desc: "Letter grade boundaries and GPA mapping" },
  { icon: Brain, title: "AI sensitivity", desc: "How aggressively to flag at-risk students" },
  { icon: Bell, title: "Notifications", desc: "Channels, digest schedule and severity filters" },
];

function Settings() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl">
          <span className="text-gradient">Settings</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Configure how AurorIQ works for your school.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS.map((s, i) => (
          <button
            key={s.title}
            className="glass-glow rounded-3xl p-6 text-left hover-lift group"
          >
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white mb-4 ${
              ["gradient-violet", "gradient-electric", "gradient-coral", "gradient-emerald", "gradient-gold"][i % 5]
            }`}>
              <s.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-lg">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
          </button>
        ))}
      </div>

      <div className="glass-glow rounded-3xl p-8 mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          More configuration panels coming soon — connect Lovable Cloud to enable real persistence and roles.
        </p>
      </div>
    </AppLayout>
  );
}
