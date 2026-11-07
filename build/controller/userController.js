"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResumeDoc = exports.updateProfile = exports.getProfile = exports.deleteEducation = exports.updateEducation = exports.addEducation = exports.getAllEducation = exports.deleteSkill = exports.addSkill = exports.getAllSkills = exports.deleteExperience = exports.updateExperience = exports.addExperience = exports.getAllExperience = exports.logoutUser = exports.loginAdmin = exports.registerAdmin = exports.addMultipleImage = exports.deleteProject = exports.updateProject = exports.addProject = exports.getProjectsDetails = exports.getAllProAdmin = exports.getAllProjects = exports.deleteMessage = exports.getAllMessages = exports.formData = exports.sendEmails = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const User_1 = __importDefault(require("../model/User"));
const Project_1 = __importDefault(require("../model/Project"));
const Experience_1 = __importDefault(require("../model/Experience"));
const Skill_1 = __importDefault(require("../model/Skill"));
const Education_1 = __importDefault(require("../model/Education"));
const Profile_1 = __importDefault(require("../model/Profile"));
const login_1 = __importDefault(require("../model/login"));
const email_1 = __importDefault(require("../utils/email"));
const upload_1 = require("../utils/upload");
// ==================== CONTACT & INQUIRIES ====================
const sendEmails = async (req, res, next) => {
    try {
        const { name, lastname, email, subject, message } = req.body;
        // Save to DB so inquiry appears in CMS Inbox
        await User_1.default.create({ name, lastname, email, subject, message });
        // Send notification and auto-reply
        await (0, email_1.default)({ name, lastname, email, subject, message });
        res.status(200).json({ message: "Email send success" });
    }
    catch (error) {
        next(error);
    }
};
exports.sendEmails = sendEmails;
const formData = async (req, res, next) => {
    try {
        await User_1.default.create(req.body);
        res.status(200).json({ message: "formData added Success" });
    }
    catch (error) {
        next(error);
    }
};
exports.formData = formData;
const getAllMessages = async (_req, res, next) => {
    try {
        const result = await User_1.default.find().sort({ createdAt: -1 }).lean();
        res.status(200).json({ message: "Messages fetched successfully", result });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllMessages = getAllMessages;
const deleteMessage = async (req, res, next) => {
    try {
        await User_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Message deleted successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMessage = deleteMessage;
// ==================== PROJECTS ====================
const getAllProjects = async (_req, res, next) => {
    try {
        const result = await Project_1.default.find().sort({ order: 1, createdAt: -1 }).lean();
        res.status(200).json({ message: "projects data fetched", result });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllProjects = getAllProjects;
exports.getAllProAdmin = exports.getAllProjects;
const getProjectsDetails = async (req, res, next) => {
    try {
        const result = await Project_1.default.findById(req.params.id).lean();
        if (!result) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        res.status(200).json({ message: "projects data fetched", result });
    }
    catch (error) {
        next(error);
    }
};
exports.getProjectsDetails = getProjectsDetails;
const addProject = (req, res, next) => {
    (0, upload_1.uploadGallery)(req, res, async (err) => {
        if (err) {
            res.status(400).json({ message: err.message || "Failed to upload project media" });
            return;
        }
        try {
            const { name, desc, link, github, tags, featured } = req.body;
            const files = req.files;
            const uploadedImages = files && files.length > 0 ? await (0, upload_1.uploadMultipleFiles)(files) : [];
            const parsedTags = Array.isArray(tags)
                ? tags
                : tags
                    ? tags.split(",").map((t) => t.trim()).filter(Boolean)
                    : [];
            const result = await Project_1.default.create({
                name,
                desc,
                link,
                github: github || "",
                tags: parsedTags,
                featured: featured === "true" || featured === true,
                mulImage: uploadedImages,
            });
            res.status(201).json({ message: "project add success", result });
        }
        catch (error) {
            next(error);
        }
    });
};
exports.addProject = addProject;
const updateProject = (req, res, next) => {
    (0, upload_1.uploadGallery)(req, res, async (err) => {
        if (err) {
            res.status(400).json({ message: err.message || "Failed to update project media" });
            return;
        }
        try {
            const { id } = req.params;
            const project = await Project_1.default.findById(id);
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
                            await promises_1.default.unlink(path_1.default.join(process.cwd(), "projectMultiImages", item));
                        }
                        catch {
                            // Ignore missing disk files
                        }
                    }
                }
                updatedImages = updatedImages.filter((img) => !toRemove.includes(img));
            }
            // Append newly uploaded images
            const files = req.files;
            if (files && files.length > 0) {
                const newImages = await (0, upload_1.uploadMultipleFiles)(files);
                updatedImages.push(...newImages);
            }
            const parsedTags = Array.isArray(tags)
                ? tags
                : tags
                    ? tags.split(",").map((t) => t.trim()).filter(Boolean)
                    : project.tags;
            const result = await Project_1.default.findByIdAndUpdate(id, {
                name: name ?? project.name,
                desc: desc ?? project.desc,
                link: link ?? project.link,
                github: github !== undefined ? github : project.github,
                tags: parsedTags,
                featured: featured !== undefined ? featured === "true" || featured === true : project.featured,
                mulImage: updatedImages,
            }, { new: true });
            res.status(200).json({ message: "user update success", result });
        }
        catch (error) {
            next(error);
        }
    });
};
exports.updateProject = updateProject;
const deleteProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await Project_1.default.findById(id);
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        // Clean up local disk files if applicable
        if (project.mulImage && project.mulImage.length > 0) {
            for (const item of project.mulImage) {
                if (!item.startsWith("http")) {
                    try {
                        await promises_1.default.unlink(path_1.default.join(process.cwd(), "projectMultiImages", item));
                    }
                    catch {
                        // Ignore missing local files
                    }
                }
            }
        }
        await Project_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: "image delete success" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProject = deleteProject;
const addMultipleImage = (req, res, next) => {
    (0, upload_1.uploadGallery)(req, res, async (err) => {
        if (err) {
            res.status(400).json({ message: err.message || "Failed to upload files" });
            return;
        }
        try {
            const files = req.files;
            const uploaded = files && files.length > 0 ? await (0, upload_1.uploadMultipleFiles)(files) : [];
            const result = await Project_1.default.create({ name: req.body.name, mulImage: uploaded });
            res.status(201).json({ message: "images Added success", result });
        }
        catch (error) {
            next(error);
        }
    });
};
exports.addMultipleImage = addMultipleImage;
// ==================== AUTH ====================
const registerAdmin = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const hashPass = await bcryptjs_1.default.hash(password, 10);
        const result = await login_1.default.create({ name, email, password: hashPass });
        res.status(201).json({ message: "login Register Success", result: { _id: result._id, email: result.email, name: result.name } });
    }
    catch (error) {
        next(error);
    }
};
exports.registerAdmin = registerAdmin;
const loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await login_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "invalid email" });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "invalid password" });
            return;
        }
        const secret = process.env.JWT_KEY || "secretkey";
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, secret, { expiresIn: "1d" });
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
    }
    catch (error) {
        next(error);
    }
};
exports.loginAdmin = loginAdmin;
const logoutUser = async (_req, res) => {
    res.clearCookie("auth");
    res.status(201).json({ message: "User Logout " });
};
exports.logoutUser = logoutUser;
// ==================== EXPERIENCE ====================
const getAllExperience = async (_req, res, next) => {
    try {
        const result = await Experience_1.default.find().sort({ order: 1, createdAt: -1 }).lean();
        res.status(200).json({ message: "Experience fetched successfully", result });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllExperience = getAllExperience;
const addExperience = async (req, res, next) => {
    try {
        const { role, company, period, location, highlights, tech, order } = req.body;
        const result = await Experience_1.default.create({
            role,
            company,
            period,
            location: location || "Remote / India",
            highlights: Array.isArray(highlights) ? highlights : highlights ? highlights.split(",").map((s) => s.trim()) : [],
            tech: Array.isArray(tech) ? tech : tech ? tech.split(",").map((s) => s.trim()) : [],
            order: order ? Number(order) : 0,
        });
        res.status(201).json({ message: "Experience created successfully", result });
    }
    catch (error) {
        next(error);
    }
};
exports.addExperience = addExperience;
const updateExperience = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role, company, period, location, highlights, tech, order } = req.body;
        const result = await Experience_1.default.findByIdAndUpdate(id, {
            role,
            company,
            period,
            location,
            highlights: Array.isArray(highlights) ? highlights : highlights ? highlights.split(",").map((s) => s.trim()) : [],
            tech: Array.isArray(tech) ? tech : tech ? tech.split(",").map((s) => s.trim()) : [],
            order: order ? Number(order) : 0,
        }, { new: true });
        res.status(200).json({ message: "Experience updated successfully", result });
    }
    catch (error) {
        next(error);
    }
};
exports.updateExperience = updateExperience;
const deleteExperience = async (req, res, next) => {
    try {
        await Experience_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Experience deleted successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteExperience = deleteExperience;
// ==================== SKILLS ====================
const getAllSkills = async (_req, res, next) => {
    try {
        const result = await Skill_1.default.find().sort({ order: 1, createdAt: 1 }).lean();
        res.status(200).json({ message: "Skills fetched successfully", result });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllSkills = getAllSkills;
const addSkill = async (req, res, next) => {
    try {
        const { name, category, image, order } = req.body;
        const result = await Skill_1.default.create({
            name,
            category: category || "frontend",
            image,
            order: order ? Number(order) : 0,
        });
        res.status(201).json({ message: "Skill created successfully", result });
    }
    catch (error) {
        next(error);
    }
};
exports.addSkill = addSkill;
const deleteSkill = async (req, res, next) => {
    try {
        await Skill_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Skill deleted successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSkill = deleteSkill;
// ==================== EDUCATION ====================
const getAllEducation = async (_req, res, next) => {
    try {
        const result = await Education_1.default.find().sort({ order: 1, createdAt: -1 }).lean();
        res.status(200).json({ message: "Education fetched successfully", result });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllEducation = getAllEducation;
const addEducation = async (req, res, next) => {
    try {
        const { year, degree, institution, description, order } = req.body;
        const result = await Education_1.default.create({
            year,
            degree,
            institution,
            description,
            order: order ? Number(order) : 0,
        });
        res.status(201).json({ message: "Education created successfully", result });
    }
    catch (error) {
        next(error);
    }
};
exports.addEducation = addEducation;
const updateEducation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { year, degree, institution, description, order } = req.body;
        const result = await Education_1.default.findByIdAndUpdate(id, { year, degree, institution, description, order: order ? Number(order) : 0 }, { new: true });
        res.status(200).json({ message: "Education updated successfully", result });
    }
    catch (error) {
        next(error);
    }
};
exports.updateEducation = updateEducation;
const deleteEducation = async (req, res, next) => {
    try {
        await Education_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Education deleted successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteEducation = deleteEducation;
// ==================== PROFILE & CV ====================
const getProfile = async (_req, res, next) => {
    try {
        let profile = await Profile_1.default.findOne().lean();
        if (!profile) {
            profile = (await Profile_1.default.create({})).toObject();
        }
        res.status(200).json({ message: "Profile fetched successfully", result: profile });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    try {
        let profile = await Profile_1.default.findOne();
        if (!profile) {
            profile = await Profile_1.default.create(req.body);
        }
        else {
            profile = await Profile_1.default.findByIdAndUpdate(profile._id, req.body, { new: true });
        }
        res.status(200).json({ message: "Profile updated successfully", result: profile });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const uploadResumeDoc = (req, res, next) => {
    (0, upload_1.uploadResume)(req, res, async (err) => {
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
            const resumeUrl = await (0, upload_1.uploadFileToStorage)(req.file, "portfolio/resumes");
            let profile = await Profile_1.default.findOne();
            if (!profile) {
                profile = await Profile_1.default.create({ resumeUrl });
            }
            else {
                profile = await Profile_1.default.findByIdAndUpdate(profile._id, { resumeUrl }, { new: true });
            }
            res.status(200).json({ message: "Resume uploaded successfully", resumeUrl });
        }
        catch (error) {
            next(error);
        }
    });
};
exports.uploadResumeDoc = uploadResumeDoc;
