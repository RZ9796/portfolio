import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import User from "../model/User";
import Project from "../model/Project";
import Experience from "../model/Experience";
import Skill from "../model/Skill";
import Education from "../model/Education";
import Profile from "../model/Profile";
import Login from "../model/login";
import sendEmail from "../utils/email";
import {
  uploadGallery,
  uploadResume,
  uploadFileToStorage,
  uploadMultipleFiles,
} from "../utils/upload";

// ==================== CONTACT & INQUIRIES ====================
export const sendEmails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, lastname, email, subject, message } = req.body;

    // Save to DB so inquiry appears in CMS Inbox
    await User.create({ name, lastname, email, subject, message });

    // Send notification and auto-reply
    await sendEmail({ name, lastname, email, subject, message });

    res.status(200).json({ message: "Email send success" });
  } catch (error) {
    next(error);
  }
};

export const formData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await User.create(req.body);
    res.status(200).json({ message: "formData added Success" });
  } catch (error) {
    next(error);
  }
};

export const getAllMessages = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await User.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ message: "Messages fetched successfully", result });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ==================== PROJECTS ====================
export const getAllProjects = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await Project.find().sort({ order: 1, createdAt: -1 }).lean();
    res.status(200).json({ message: "projects data fetched", result });
  } catch (error) {
    next(error);
  }
};

export const getAllProAdmin = getAllProjects;

export const getProjectsDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await Project.findById(req.params.id).lean();
    if (!result) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.status(200).json({ message: "projects data fetched", result });
  } catch (error) {
    next(error);
  }
};

export const addProject = (req: Request, res: Response, next: NextFunction): void => {
  uploadGallery(req, res, async (err) => {
    if (err) {
      res.status(400).json({ message: err.message || "Failed to upload project media" });
      return;
    }
    try {
      const { name, desc, link, github, tags, featured } = req.body;
      const files = req.files as Express.Multer.File[] | undefined;
      const uploadedImages = files && files.length > 0 ? await uploadMultipleFiles(files) : [];

      const parsedTags = Array.isArray(tags)
        ? tags
        : tags
        ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [];

      const result = await Project.create({
        name,
        desc,
        link,
        github: github || "",
        tags: parsedTags,
        featured: featured === "true" || featured === true,
        mulImage: uploadedImages,
      });

      res.status(201).json({ message: "project add success", result });
    } catch (error) {
      next(error);
    }
  });
};

export const updateProject = (req: Request, res: Response, next: NextFunction): void => {
  uploadGallery(req, res, async (err) => {
    if (err) {
      res.status(400).json({ message: err.message || "Failed to update project media" });
      return;
    }
    try {
      const { id } = req.params;
      const project = await Project.findById(id);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }

      const { removeItems, name, desc, link, github, tags, featured } = req.body;

      let updatedImages = [...(project.mulImage || [])];

      // Remove deselected images
      if (removeItems) {
        const toRemove = Array.isArray(removeItems) ? removeItems : [removeItems];
        for (const item of toRemove) {
          if (!item.startsWith("http")) {
            try {
              await fs.unlink(path.join(process.cwd(), "projectMultiImages", item));
            } catch {
              // Ignore missing disk files
            }
          }
        }
        updatedImages = updatedImages.filter((img) => !toRemove.includes(img));
      }

      // Append newly uploaded images
      const files = req.files as Express.Multer.File[] | undefined;
      if (files && files.length > 0) {
        const newImages = await uploadMultipleFiles(files);
        updatedImages.push(...newImages);
      }

      const parsedTags = Array.isArray(tags)
        ? tags
        : tags
        ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : project.tags;

      const result = await Project.findByIdAndUpdate(
        id,
        {
          name: name ?? project.name,
          desc: desc ?? project.desc,
          link: link ?? project.link,
          github: github !== undefined ? github : project.github,
          tags: parsedTags,
          featured: featured !== undefined ? featured === "true" || featured === true : project.featured,
          mulImage: updatedImages,
        },
        { new: true }
      );

      res.status(200).json({ message: "user update success", result });
    } catch (error) {
      next(error);
    }
  });
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Clean up local disk files if applicable
    if (project.mulImage && project.mulImage.length > 0) {
      for (const item of project.mulImage) {
        if (!item.startsWith("http")) {
          try {
            await fs.unlink(path.join(process.cwd(), "projectMultiImages", item));
          } catch {
            // Ignore missing local files
          }
        }
      }
    }

    await Project.findByIdAndDelete(id);
    res.status(200).json({ message: "image delete success" });
  } catch (error) {
    next(error);
  }
};

export const addMultipleImage = (req: Request, res: Response, next: NextFunction): void => {
  uploadGallery(req, res, async (err) => {
    if (err) {
      res.status(400).json({ message: err.message || "Failed to upload files" });
      return;
    }
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      const uploaded = files && files.length > 0 ? await uploadMultipleFiles(files) : [];
      const result = await Project.create({ name: req.body.name, mulImage: uploaded });
      res.status(201).json({ message: "images Added success", result });
    } catch (error) {
      next(error);
    }
  });
};

// ==================== AUTH ====================
export const registerAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const hashPass = await bcrypt.hash(password, 10);
    const result = await Login.create({ name, email, password: hashPass });
    res.status(201).json({ message: "login Register Success", result: { _id: result._id, email: result.email, name: result.name } });
  } catch (error) {
    next(error);
  }
};

export const loginAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await Login.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "invalid email" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "invalid password" });
      return;
    }

    const secret = process.env.JWT_KEY || "secretkey";
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "1d" });

    res.cookie("auth", token, {
      maxAge: 3600000 * 24,
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(201).json({
      message: "User Login Success",
      result: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie("auth");
  res.status(201).json({ message: "User Logout " });
};

// ==================== EXPERIENCE ====================
export const getAllExperience = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await Experience.find().sort({ order: 1, createdAt: -1 }).lean();
    res.status(200).json({ message: "Experience fetched successfully", result });
  } catch (error) {
    next(error);
  }
};

export const addExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, company, period, location, highlights, tech, order } = req.body;
    const result = await Experience.create({
      role,
      company,
      period,
      location: location || "Remote / India",
      highlights: Array.isArray(highlights) ? highlights : highlights ? highlights.split(",").map((s: string) => s.trim()) : [],
      tech: Array.isArray(tech) ? tech : tech ? tech.split(",").map((s: string) => s.trim()) : [],
      order: order ? Number(order) : 0,
    });
    res.status(201).json({ message: "Experience created successfully", result });
  } catch (error) {
    next(error);
  }
};

export const updateExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, company, period, location, highlights, tech, order } = req.body;
    const result = await Experience.findByIdAndUpdate(
      id,
      {
        role,
        company,
        period,
        location,
        highlights: Array.isArray(highlights) ? highlights : highlights ? highlights.split(",").map((s: string) => s.trim()) : [],
        tech: Array.isArray(tech) ? tech : tech ? tech.split(",").map((s: string) => s.trim()) : [],
        order: order ? Number(order) : 0,
      },
      { new: true }
    );
    res.status(200).json({ message: "Experience updated successfully", result });
  } catch (error) {
    next(error);
  }
};

export const deleteExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Experience.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Experience deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ==================== SKILLS ====================
export const getAllSkills = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await Skill.find().sort({ order: 1, createdAt: 1 }).lean();
    res.status(200).json({ message: "Skills fetched successfully", result });
  } catch (error) {
    next(error);
  }
};

export const addSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, category, image, order } = req.body;
    const result = await Skill.create({
      name,
      category: category || "frontend",
      image,
      order: order ? Number(order) : 0,
    });
    res.status(201).json({ message: "Skill created successfully", result });
  } catch (error) {
    next(error);
  }
};

export const deleteSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Skill deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ==================== EDUCATION ====================
export const getAllEducation = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await Education.find().sort({ order: 1, createdAt: -1 }).lean();
    res.status(200).json({ message: "Education fetched successfully", result });
  } catch (error) {
    next(error);
  }
};

export const addEducation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { year, degree, institution, description, order } = req.body;
    const result = await Education.create({
      year,
      degree,
      institution,
      description,
      order: order ? Number(order) : 0,
    });
    res.status(201).json({ message: "Education created successfully", result });
  } catch (error) {
    next(error);
  }
};

export const updateEducation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { year, degree, institution, description, order } = req.body;
    const result = await Education.findByIdAndUpdate(
      id,
      { year, degree, institution, description, order: order ? Number(order) : 0 },
      { new: true }
    );
    res.status(200).json({ message: "Education updated successfully", result });
  } catch (error) {
    next(error);
  }
};

export const deleteEducation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Education.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Education deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ==================== PROFILE & CV ====================
export const getProfile = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let profile = await Profile.findOne().lean();
    if (!profile) {
      profile = (await Profile.create({})).toObject();
    }
    res.status(200).json({ message: "Profile fetched successfully", result: profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create(req.body);
    } else {
      profile = await Profile.findByIdAndUpdate(profile._id, req.body, { new: true });
    }
    res.status(200).json({ message: "Profile updated successfully", result: profile });
  } catch (error) {
    next(error);
  }
};

export const uploadResumeDoc = (req: Request, res: Response, next: NextFunction): void => {
  uploadResume(req, res, async (err) => {
    if (err) {
      res.status(400).json({ message: err.message || "Failed to upload resume" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: "No file provided" });
      return;
    }

    try {
      // Permanent Cloudinary URL or local filename
      const resumeUrl = await uploadFileToStorage(req.file, "portfolio/resumes");

      let profile = await Profile.findOne();
      if (!profile) {
        profile = await Profile.create({ resumeUrl });
      } else {
        profile = await Profile.findByIdAndUpdate(profile._id, { resumeUrl }, { new: true });
      }

      res.status(200).json({ message: "Resume uploaded successfully", resumeUrl });
    } catch (error) {
      next(error);
    }
  });
};

