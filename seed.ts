import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Project from "./model/Project";
import Experience from "./model/Experience";
import Skill from "./model/Skill";
import Education from "./model/Education";
import Profile from "./model/Profile";
import Login from "./model/login";

const seedDatabase = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/portfolio";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB successfully!");

    // 1. Seed Admin User
    const existingAdmin = await Login.findOne({ email: "admin123@gmail.com" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Rzalte@123", 10);
      await Login.create({
        email: "admin123@gmail.com",
        password: hashedPassword,
        name: "Rushikesh Zalte",
      });
      console.log("✓ Admin user created: admin123@gmail.com");
    } else {
      console.log("✓ Admin user already exists: admin123@gmail.com");
    }

    // 2. Seed Profile
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({
        name: "Rushikesh Zalte",
        tagline: "<Rushikesh/>",
        bio: "A Full Stack & Frontend Developer specializing in React, Node.js, and modern web architectures. Crafting fast, scalable, and intuitive digital experiences.",
        subTitle: "Software Developer · MCA",
        availableStatus: "Available for Work & Full-time Roles",
        isAvailable: true,
        resumeUrl: "/documents/Rushikesh_Resume.pdf",
        leetcodeUrl: "https://leetcode.com/RZ_9796",
        linkedinUrl: "https://www.linkedin.com/in/rushikesh-zalte-ab23a2248/",
        githubUrl: "https://github.com/RZ9796",
      });
      console.log("✓ Profile data created");
    } else {
      console.log("✓ Profile data already exists");
    }

    // 3. Seed Projects
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.create([
        {
          name: "Full-Stack Shoe Commerce Platform",
          desc: "A production-grade e-commerce application featuring interactive product discovery, secure checkout workflow with Stripe, cart state synchronization using Redux Toolkit, and an administrative dashboard.",
          link: "https://github.com/RZ9796",
          github: "https://github.com/RZ9796",
          tags: ["React", "Node.js", "Express", "MongoDB", "Redux Toolkit", "Tailwind CSS"],
          mulImage: ["shoemap.png"],
          featured: true,
          order: 1,
        },
        {
          name: "Next.js Modern Digital Platform",
          desc: "A performant web application built with Next.js and TypeScript, highlighting server-rendered components, dynamic routing, SEO optimization, and smooth visual micro-interactions.",
          link: "https://github.com/RZ9796",
          github: "https://github.com/RZ9796",
          tags: ["Next.js", "TypeScript", "React", "Tailwind CSS", "Framer Motion"],
          mulImage: ["NextWebsite.png"],
          featured: true,
          order: 2,
        },
      ]);
      console.log("✓ Initial Projects seeded");
    } else {
      console.log(`✓ Projects already exist (${projectCount} found)`);
    }

    // 4. Seed Experience
    const expCount = await Experience.countDocuments();
    if (expCount === 0) {
      await Experience.create([
        {
          role: "Full-Stack Developer (MERN)",
          company: "Independent & Open Source Projects",
          period: "2023 - Present",
          location: "Remote / Aurangabad, India",
          highlights: [
            "Architected and deployed full-stack web applications utilizing React, Node.js, Express, and MongoDB with secure JWT auth workflows.",
            "Engineered responsive, accessible frontends using Tailwind CSS, Redux Toolkit, and Framer Motion with sub-second page loads.",
            "Integrated third-party APIs including Stripe payment gateways, Nodemailer SMTP services, and cloud database clusters.",
            "Optimized asset delivery, Core Web Vitals, and responsive layouts across mobile, tablet, and desktop viewports.",
          ],
          tech: ["React", "Node.js", "Express", "MongoDB", "Redux Toolkit", "Tailwind CSS", "REST APIs"],
          order: 1,
        },
        {
          role: "Frontend Developer Intern",
          company: "Web Solutions & Tech Training",
          period: "2022 - 2023",
          location: "Aurangabad, India",
          highlights: [
            "Collaborated on building dynamic, user-centric interfaces and responsive landing pages from Figma mockups.",
            "Developed reusable component libraries with React, implementing form validation with Formik and Yup.",
            "Participated in code reviews, bug fixes, state management refactoring, and cross-browser testing.",
          ],
          tech: ["JavaScript (ES6+)", "React", "HTML5/CSS3", "Bootstrap", "Git", "Figma"],
          order: 2,
        },
      ]);
      console.log("✓ Work Experience seeded");
    } else {
      console.log(`✓ Experience already exists (${expCount} found)`);
    }

    // 5. Seed Education
    const eduCount = await Education.countDocuments();
    if (eduCount === 0) {
      await Education.create([
        {
          year: "2022 - 2024",
          degree: "Master of Computer Applications (MCA)",
          institution: "IMSIT, Aurangabad",
          description: "Advanced coursework in Software Engineering, Full-Stack Web Technologies, Database Systems, and Object-Oriented Architecture.",
          order: 1,
        },
        {
          year: "2019 - 2022",
          degree: "Bachelor of Computer Science (BCS)",
          institution: "Vivekanand Institute of Management Studies & Information Technology, Aurangabad",
          description: "Core computer science fundamentals, data structures, algorithms, operating systems, and web programming.",
          order: 2,
        },
        {
          year: "2017 - 2019",
          degree: "Higher Secondary Certificate (HSC - Science)",
          institution: "Vivekanand Arts, Commerce & Science College, Aurangabad",
          description: "Science stream with strong emphasis on Mathematics, Physics, and Computer Science basics.",
          order: 3,
        },
        {
          year: "2017",
          degree: "Secondary School Certificate (SSC)",
          institution: "Shri Saraswati Bhuvan Prashala, Aurangabad",
          description: "Foundational academic education with focus on analytical reasoning and sciences.",
          order: 4,
        },
      ]);
      console.log("✓ Education history seeded");
    } else {
      console.log(`✓ Education already exists (${eduCount} found)`);
    }

    // 6. Seed Skills
    const skillCount = await Skill.countDocuments();
    if (skillCount === 0) {
      const skillsToSeed = [
        { name: "HTML5", category: "frontend" as const, image: "/html.png", order: 1 },
        { name: "CSS3", category: "frontend" as const, image: "/css.png", order: 2 },
        { name: "JavaScript", category: "frontend" as const, image: "/js.png", order: 3 },
        { name: "TypeScript", category: "frontend" as const, image: "/ts.png", order: 4 },
        { name: "React", category: "frontend" as const, image: "/react.png", order: 5 },
        { name: "Next.js", category: "frontend" as const, image: "/next.png", order: 6 },
        { name: "Redux Toolkit", category: "frontend" as const, image: "/redux.png", order: 7 },
        { name: "React Query", category: "frontend" as const, image: "/reactquery.png", order: 8 },
        { name: "Tailwind CSS", category: "frontend" as const, image: "/tailwind.png", order: 9 },
        { name: "Framer Motion", category: "frontend" as const, image: "/framer.png", order: 10 },
        { name: "Angular", category: "frontend" as const, image: "/angular.png", order: 11 },
        { name: "Stripe", category: "frontend" as const, image: "/stripe.webp", order: 12 },
        { name: "Node.js", category: "backend" as const, image: "/node-js.png", order: 13 },
        { name: "Express.js", category: "backend" as const, image: "/express.png", order: 14 },
        { name: "MongoDB", category: "backend" as const, image: "/mongodb.png", order: 15 },
        { name: "PostgreSQL", category: "backend" as const, image: "/postger.png", order: 16 },
        { name: "MySQL", category: "backend" as const, image: "/mysql.png", order: 17 },
        { name: "GraphQL", category: "backend" as const, image: "/graphql.png", order: 18 },
        { name: "Firebase", category: "backend" as const, image: "/Firebase.png", order: 19 },
        { name: "React Native", category: "fullstack" as const, image: "/ReactNative.png", order: 20 },
        { name: "Docker", category: "fullstack" as const, image: "/docker.webp", order: 21 },
        { name: "Prisma", category: "fullstack" as const, image: "/prisma.webp", order: 22 },
      ];

      await Skill.create(skillsToSeed);
      console.log("✓ 22 Skills & Tools seeded");
    } else {
      console.log(`✓ Skills already exist (${skillCount} found)`);
    }

    console.log("\n==========================================");
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("==========================================");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedDatabase();

