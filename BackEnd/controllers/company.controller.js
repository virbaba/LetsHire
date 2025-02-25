import { Company } from "../models/company.model.js";
import { User } from "../models/user.model.js";
import { Recruiter } from "../models/recruiter.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { BlacklistedCompany } from "../models/blacklistedCompany.model.js";
import { JobSubscription } from "../models/jobSubscription.model.js";
import JobReport from "../models/jobReport.model.js";
import { isFloat32Array } from "util/types";

export const isUserAssociated = async (companyId, userId) => {
  try {
    // Find the company by its ID
    const company = await Company.findById(companyId);
    if (!company) {
      // If company is not found, you can either throw an error or return false.
      throw new Error("Company not found.");
    }

    // Check if the user is associated with the company.
    // company.userId is expected to be an array of objects where each object has a `user` field.
    const isAssociated = company.userId.some(
      (userObj) => userObj.user.toString() === userId
    );
    if (!isAssociated) {
      // The user is not associated with the company.
      return false; 
    }

    // Now, check if the recruiter (user) is active.
    const recruiter = await Recruiter.findById(userId);
    if (!recruiter) {
      throw new Error("Recruiter not found.");
    }

    // Return true only if the recruiter is active.
    return recruiter.isActive;
  } catch (err) {
    console.error("Error in recruiter validation:", err);
    return false;
  }
};

export const registerCompany = async (req, res) => {
  try {
    const {
      companyName,
      companyWebsite,
      industry,
      streetAddress,
      city,
      state,
      country,
      postalCode,
      email,
      phone,
      CIN,
      recruiterPosition,
      userEmail,
    } = req.body;
    const adminEmail = userEmail;
    // CIN validation function
    const isValidCIN = (cin) => {
      const cinRegex = /^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
      return cinRegex.test(cin);
    };

    if (!isValidCIN(CIN)) {
      
      return res.status(400).json({
        message: "Invalid CIN format.",
        success: false,
      });
    }

    console.log(CIN)

    // Check if any unique field exists in the BlacklistedCompany collection
    const isBlacklisted = await BlacklistedCompany.findOne({
      $or: [{ companyName }, { email }, { adminEmail }, { CIN }],
    });

    if (isBlacklisted) {
      
      return res.status(400).json({
        message: "Company Blacklisted",
        success: false,
      });
    }

    // Check if a company already exists with this email and CIN
    let company = await Company.findOne({ email, adminEmail, CIN });
    if (company) {
      return res.status(200).json({
        message: "Company already exists.",
        success: false,
      });
    }

    // Check if a recruiter exists with this email
    let recruiter = await Recruiter.findOne({ "emailId.email": userEmail });
    if (!recruiter) {
      return res.status(404).json({
        message: "Recruiter not found.",
        success: false,
      });
    }

    recruiter.position = recruiterPosition;
    recruiter.isCompanyCreated = true;
    await recruiter.save();

    let cloudResponse;
    const { businessFile } = req.files;
    if (businessFile && businessFile.length > 0) {
      // Convert file to a URI
      const fileUri = getDataUri(businessFile[0]);

      // Upload to Cloudinary
      cloudResponse = await cloudinary.uploader.upload(fileUri.content);
    }
    // Create a new company if it doesn't exist
    company = await Company.create({
      companyName,
      companyWebsite,
      industry,
      email,
      adminEmail: userEmail,
      phone,
      CIN,
      userId: [{ user: recruiter._id, isVerified: 0 }], // Add recruiter with `isVerified: false`
      address: {
        streetAddress,
        city,
        state,
        country,
        postalCode,
      },
      businessFile: cloudResponse ? cloudResponse.secure_url : undefined,
      bussinessFileName: businessFile ? businessFile.originalname : undefined,
    });

    return res.status(201).json({
      message: "Company registered successfully.",
      // company,
      // recruiter,
      success: true,
    });
  } catch (error) {
    console.error("Error in registering company:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

//get  company by id ...
export const getCompanyById = async (req, res) => {
  try {
    const { companyId } = req.body;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
        Success: false,
      });
    }
    return res.status(200).json({
      company,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const companyByUserId = async (req, res) => {
  const { userId } = req.body;

  try {
    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Query the company where userId matches
    const company = await Company.findOne({
      userId: { $elemMatch: { user: new mongoose.Types.ObjectId(userId) } },
    });

    if (company) {
      return res.status(200).json({ success: true, company });
    } else {
      return res.status(404).json({
        success: false,
        message: "Company not found for the given user ID.",
      });
    }
  } catch (err) {
    console.error(`Error in fetching company by user ID: ${err}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//update company
export const updateCompany = async (req, res) => {
  try {
    const { companyWebsite, address, industry, email, phone } = req.body;
    const companyId = req.params.id;
    const userId = req.id;

    if (!isUserAssociated(companyId, userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized", success: false });
    }

    const company = await Company.findById(companyId);
    // Update only provided fields
    if (companyWebsite !== undefined) company.companyWebsite = companyWebsite;
    if (address !== undefined) company.address = address;
    if (industry !== undefined) company.industry = industry;
    if (email !== undefined) company.email = email;
    if (phone !== undefined) company.phone = phone;

    // Save the updated company document
    const updatedCompany = await company.save();

    return res.status(200).json({
      company: updatedCompany,
      message: "Company information updated.",
      success: true,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return res.status(500).json({
      message: "An error occurred while updating the company.",
      success: false,
    });
  }
};

export const changeAdmin = async (req, res) => {
  const { email, companyId, adminEmail } = req.body;
  const userId = req.id;

  try {
    // Find the company by ID
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
        success: false,
      });
    }

    // Check if the userEmail is equal to the company's admin email
    if (email !== company.adminEmail) {
      return res.status(403).json({
        message: "You are not authorized to change the admin.",
        success: false,
      });
    }

    // Check if the userId exists in the company's userId array
    const userExists = company.userId.some(
      (user) => user.user.toString() === userId
    );

    if (!userExists) {
      return res.status(404).json({
        message: "You are not found in the company.",
        success: false,
      });
    }

    // Change the company's admin email
    company.adminEmail = adminEmail;
    await company.save();

    return res.status(200).json({
      message: "Admin email changed successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Error changing admin:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const getCurrentPlan = async (req, res) => {
  try {
    const companyId = req.params.id; // Get company ID from request parameters
    const userId = req.id;

    if (!isUserAssociated(companyId, userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized", success: false });
    }

    // Find the active subscription for the company
    const currentPlan = await JobSubscription.findOne({
      company: companyId,
      status: { $ne: "Hold" }, // Exclude plans with status "Hold"
    }).select("jobBoost expiryDate planName price status purchaseDate");
    // Select only required fields

    res.status(200).json({
      success: true,
      message: "Current active plan retrieved successfully",
      plan: currentPlan,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// This controller will help to get candiadate data
export const getCandidateData = async (req, res) => {
  try {
    const { jobTitle, experience, salaryBudget, companyId } = req.query;
    const userId = req.id;

    if (!isUserAssociated(companyId, userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized", success: false });
    }

    // Securely Validate jobTitle
    if (
      typeof jobTitle !== "string" ||
      jobTitle.trim().length === 0 ||
      jobTitle.length > 50
    ) {
      return res
        .status(400)
        .json({ message: "Invalid job title", success: false });
    }

    // Safe escape function (Prevents .replace() on non-strings)
    const escapeRegex = (str) => {
      if (typeof str !== "string") return "";
      return str.replace(/[-[\]{}()*+?.,\\^$|#\s><]/g, "\\$&");
    };

    const sanitizedJobTitle = escapeRegex(jobTitle.trim());

    const candidates = await User.find({
      "profile.experience.jobProfile": {
        $regex: new RegExp(`^${sanitizedJobTitle}$`, "i"),
      }, // Case-insensitive match
      "profile.experience.duration": experience,
      "profile.expectedCTC": salaryBudget,
      "profile.resume": { $exists: true, $ne: "" }, // Ensure resume exists
    }).select({
      fullname: 1,
      "profile.experience.jobProfile": 1,
      "profile.skills": 1,
      "profile.experience.duration": 1,
      "profile.expectedCTC": 1,
      "profile.resume": 1,
      "profile.profilePhoto": 1,
    });

    res.status(200).json({ success: true, candidates });
  } catch (error) {
    console.error("Error fetching candidate data:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const decreaseCandidateCredits = async (req, res) => {
  try {
    const companyId = req.params.id;
    const userId = req.id;

    if (!isUserAssociated(companyId, userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized", success: false });
    }
    const company = await Company.findById(companyId);
    // If creditedForCandidates is null, no need to decrease
    if (company.creditedForCandidates !== null) {
      if (company.creditedForCandidates > 0) {
        company.creditedForCandidates -= 1;
        await company.save();
      }
    }
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error decreasing candidate credits:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const getCompanyApplicants = async (req, res) => {
  try {
    const { companyId } = req.params; // Extract company const userId = req.id;
    const userId = req.id;

    if (!isUserAssociated(companyId, userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized", success: false });
    }

    // Find all job postings under this company
    const jobIds = await Job.find({ company: companyId }).distinct("_id");

    // Find applications for these jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("applicant") // Only populate applicant details
      .sort({ createdAt: -1 }); // Sort latest first

    res.status(200).json({
      success: true,
      totalApplications: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const reportJob = async (req, res) => {
  try {
    const { jobId, reportTitle, description } = req.body;
    const userId = req.id;

    if (!jobId || !userId || !reportTitle) {
      return res
        .status(400)
        .json({ message: "Job ID, User ID, and Report Title are required." });
    }

    if (
      reportTitle === "Other" &&
      (typeof description !== "string" || description.length > 300)
    ) {
      return res
        .status(400)
        .json({ message: "Descripton should be in 300 character." });
    }

    const newReport = new JobReport({
      userId,
      jobId,
      reportTitle,
      description: reportTitle === "Other" && !description ? null : description,
    });

    await newReport.save();
    res.status(201).json({
      success: true,
      message: "Report submitted successfully.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};
