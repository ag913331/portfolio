// Single source of truth for résumé content. Display formatting lives in commands.ts;
// this file holds only structured data.

export const PROFILE = {
  name: "Alexandro Georgiev",
  role: "Fullstack & DevOps Engineer",
  status: "Online",
  kernel: "v5.15.0-generic",
};

export const WHOAMI = {
  intro: [
    "Hello, I'm Alexandro Georgiev. I'm a software engineer passionate about automation, system reliability, and cross-functional problem-solving.",
    "With a foundation in backend scripting and a strong grasp of DevOps culture and tools, I specialize in: Python Automation | DevOps Engineer | Fullstack Developer (React & Next.js).",
  ],
  groups: [
    {
      title: "Python Automation & DevOps",
      bullets: [
        "Designed and deployed scalable CI/CD pipelines using Jenkins, Docker, Groovy, and Git",
        "Automated OS provisioning and upgrades across hundreds of servers with Python/Bash, Redfish API, and Airflow",
        "Implemented logging, backup, and monitoring solutions that improved operational stability and resolution times",
        "Worked hands-on with Linux kernel tuning, IPMI tooling, and image building (Cubic)",
      ],
    },
    {
      title: "Cloud & Infrastructure",
      bullets: [
        "Built infrastructure and automation on both AWS and GCP (Cloud Run, Cloud Build, IAM, S3)",
        "Worked with Google Cloud services and cloud automation patterns in production",
        "Employed Ansible and Airflow for orchestrated deployments and task scheduling",
      ],
    },
    {
      title: "Fullstack Development",
      bullets: [
        "Built and maintained front-end and internal tools using React, Next.js, and TanStack Query",
        "Developed backend APIs with Node.js, Prisma, and PostgreSQL",
        "Created customer-facing applications and internal dashboards, optimizing UX and performance",
      ],
    },
    {
      title: "Team & Delivery Focus",
      bullets: [
        "Comfortable in Agile teams: sprint planning, documentation, cross-departmental communication",
        "Known for debugging under pressure, delivering reliable infrastructure, and bridging Dev and Ops teams",
      ],
    },
  ],
  outro:
    "I'm especially passionate about reducing manual toil through automation and helping teams ship faster, safer, and with confidence.",
};

export type Contact = { label: string; value: string };

export const CONTACTS: Contact[] = [
  { label: "GitHub", value: "https://github.com/ag913331" },
  { label: "LinkedIn", value: "www.linkedin.com/in/alexandro-georgiev-711b631b5" },
  { label: "Email", value: "contact@georgievalexandro.com" },
];

export type Certification = {
  title: string;
  issuedBy: string;
  date: string;
  /** A URL, or plain text like "on paper". */
  credential: string;
};

export const CERTIFICATIONS: Certification[] = [
  {
    title: "Oracle Database 12c: SQL Fundamentals",
    issuedBy: "Technical University of Varna",
    date: "May 2018",
    credential: "on paper",
  },
  {
    title: "JavaScript Algorithms and Data Structures",
    issuedBy: "freeCodeCamp",
    date: "Jan 2020",
    credential: "https://www.freecodecamp.org/certification/r3d/javascript-algorithms-and-data-structures",
  },
  {
    title: "Scientific Computing with Python",
    issuedBy: "freeCodeCamp",
    date: "March 2022",
    credential: "https://www.freecodecamp.org/certification/r3d/scientific-computing-with-python-v7",
  },
  {
    title: "AWS Certified Cloud Practitioner Certificate of Completion",
    issuedBy: "ExamPro",
    date: "Jul 2024",
    credential: "https://app.exampro.co/student/achievements/validate/certificate/HMQ04CENAWqbbhrBwatQHw2642e",
  },
  {
    title: "AWS Certified Cloud Practitioner",
    issuedBy: "Amazon Web Services (AWS)",
    date: "Aug 2024",
    credential: "https://www.credly.com/badges/a97ccb15-c399-48bd-8766-cdc5ce17fd8c/public_url",
  },
];

export type Education = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  period: string;
};

export const EDUCATION: Education[] = [
  {
    institution: "High School of Mathematics 'Dr Petar Beron' - Varna",
    degree: "High School Diploma",
    fieldOfStudy: "Mathematics and Internet Technologies",
    period: "2011 - 2016",
  },
  {
    institution: "Technical University of Varna",
    degree: "Bachelor's degree",
    fieldOfStudy: "Software and Internet Technologies",
    period: "2016 - 2020",
  },
  {
    institution: "Technical University of Varna",
    degree: "Master's degree",
    fieldOfStudy: "Computer Software Engineering",
    period: "2020 - 2022",
  },
];

export type Experience = {
  role: string;
  type: string;
  period: string;
  /** Marks the role as ongoing; drives the highlighted "current" period styling. */
  current?: boolean;
  company: string;
  location: string;
  description: string[];
};

export const EXPERIENCE: Experience[] = [
  {
    role: "Frontend Developer",
    type: "Full-time",
    period: "Aug 2018 - Aug 2020",
    company: "BROKER INS ONLINE",
    location: "Varna, Bulgaria",
    description: [
      "Created dashboards and APIs for modeling and managing insurance products",
      "Built customer-facing and internal tools using React and Node.js",
      "Collaborated with business stakeholders to define and deliver features",
      "Enhanced performance and responsiveness through testing and optimization",
    ],
  },
  {
    role: "Fullstack Developer",
    type: "Full-time",
    period: "Aug 2020 - Jan 2022",
    company: "InsInCloud",
    location: "Varna, Bulgaria",
    description: [
      "Built reusable UI components using React and Vue",
      "Integrated RESTful APIs and managed global state with Redux",
      "Employed Jest and Mocha for test coverage and quality assurance",
      "Automated repetitive dev tasks with Python, Bash, and CI/CD pipelines",
      "Collaborated in Agile teams, improving development cycles and delivery speed",
    ],
  },
  {
    role: "DevOps & Automation Engineer",
    type: "Full-time",
    period: "Feb 2022 - Apr 2024",
    company: "MB Consulting",
    location: "Remote",
    description: [
      "Automated OS transition of production servers from CentOS to Ubuntu",
      "Developed unattended installation images with Cubic, Redfish API, and Bash",
      "Streamlined CI/CD pipelines using Jenkins, Groovy, and Docker",
      "Automated testing and recovery processes to enhance uptime and reliability",
      "Built incident response tools and improved logging/monitoring systems",
      "Promoted DevOps culture by bridging Dev, Ops, and QA teams",
    ],
  },
  {
    role: "Fullstack & Cloud DevOps Engineer",
    type: "Full-time",
    period: "Nov 2024 - May 2026",
    company: "NG Coding",
    location: "Varna, Bulgaria",
    description: [
      "Developed frontend apps using React, Next.js, and TanStack React Query",
      "Built backend APIs with Node.js and Prisma, integrating PostgreSQL",
      "Implemented CI/CD pipelines using Google Cloud (Cloud Run, Cloud Build, IAM)",
      "Automated deployments and testing via GitHub Actions",
      "Contributed to sprint planning, documentation, and DevOps processes",
    ],
  },
  {
    role: "Freelance Fullstack & DevOps Engineer",
    type: "Freelance",
    period: "May 2026 - Current",
    current: true,
    company: "Self-employed",
    location: "Remote",
    description: ["Partnering with clients on full-stack product development and DevOps automation."],
  },
];

export type Language = { name: string; level: string };

export const LANGUAGES: Language[] = [
  { name: "Bulgarian", level: "Native or bilingual proficiency" },
  { name: "English", level: "Full professional proficiency" },
  { name: "Romanian", level: "Native or bilingual proficiency" },
  { name: "Russian", level: "Professional working proficiency" },
];

export type SkillGroup = { title: string; items: string[] };

export const SKILLS: SkillGroup[] = [
  {
    title: "Programming & Problem-Solving",
    items: ["Programming | Problem-Solving", "Effective Communication"],
  },
  {
    title: "Programming Languages",
    items: ["Python", "JavaScript", "Bash", "PHP"],
  },
  {
    title: "Frontend",
    items: [
      "React",
      "Next.js",
      "Vue",
      "UI Frameworks: Material-UI / Ant Design / Bootstrap",
      "Custom UI library development",
    ],
  },
  {
    title: "Backend & Data",
    items: [
      "Node.js",
      "REST APIs",
      "Prisma ORM",
      "PostgreSQL",
      "Microservice design & development",
      "System & application integration",
    ],
  },
  {
    title: "DevOps, Cloud & CI/CD",
    items: [
      "Continuous Integration & Continuous Delivery (CI/CD)",
      "GitHub Actions",
      "Jenkins",
      "Groovy scripts",
      "Git",
      "Docker | Docker Compose",
      "Podman | Podman Compose",
      "Google Cloud Platform (GCP)",
    ],
  },
  {
    title: "Automation, Ops & Reliability",
    items: [
      "Linux + Bash scripting",
      "Linux system administration & kernel tuning",
      "Service maintenance and monitoring",
      "Service monitoring and logging",
      "Unattended server installation",
    ],
  },
  {
    title: "IaC & Orchestration",
    items: ["Ansible", "Airflow"],
  },
  {
    title: "Testing & Quality Assurance",
    items: ["PyTest | PyUnit", "Jest"],
  },
  {
    title: "Hardware / BMC & Provisioning Tooling",
    items: ["Redfish API", "Supermicro IPMI | HP IPMI", "Cubic (create/modify installation images)"],
  },
  {
    title: "Tooling",
    items: ["CLI tools: Vim, Linux commands"],
  },
  {
    title: "Delivery",
    items: ["Full-stack software development", "Project management (planning, execution, risk management)"],
  },
];

export type PublicProject = { name: string; description: string; repo: string };

export const PUBLIC_PROJECTS: PublicProject[] = [
  {
    name: "Autobot",
    description: "manage services from your phone",
    repo: "https://github.com/ag913331/prod_autobot",
  },
  {
    name: "GitHub User Activity CLI",
    description: "fetches and displays both public and private GitHub activity for a specific user",
    repo: "https://github.com/ag913331/github-user-activity",
  }
];

/** Titles must match the keys of PRIVATE_PROJECT_DESCRIPTIONS in constants.ts. */
export const PRIVATE_PROJECTS: { title: string }[] = [
  { title: "Construction Management SaaS Platform" },
  { title: "Insurance Product Modeling Platform" },
  { title: "Automated Server OS Upgrade" },
];
