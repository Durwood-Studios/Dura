export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  lessonIds: string[];
  tutorialSlugs: string[];
  prerequisites: string[];
  roles: { roleId: string; importance: "core" | "valuable" | "bonus" }[];
  standards: { body: string; reference: string }[];
  bloomLevel: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";
}

export interface Role {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  levels: {
    junior: { required: string[]; valuable: string[] };
    mid: { required: string[]; valuable: string[] };
    senior: { required: string[]; valuable: string[] };
  };
  portfolio: { title: string; tutorialSlug: string; skill: string }[];
  standards: {
    name: string;
    body: string;
    url: string;
    description: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    level: "entry" | "professional" | "expert";
    url: string;
  }[];
  skills: {
    category: string;
    items: { skill: string; skillId?: string }[];
  }[];
  dayInTheLife: string;
  salaryRange: {
    low: number;
    high: number;
    currency: string;
    source: string;
    year: number;
  };
  demandLevel: "high" | "very-high" | "extreme";
  goals: string[];
  prerequisites: string[];
  leadsTo: string[];
}

export interface TrackGoal {
  id: string;
  question: string;
  description: string;
  roleIds: string[];
  icon: string;
}
