import { Company } from "../../models/company.model.js";
import { Recruiter } from "../../models/recruiter.model.js";

export const getRecrutierStats = async (req, res) => {
  try {
    const totalRecruiters = await Recruiter.countDocuments();
    const totalActiveRecruiters = await Recruiter.countDocuments({
      isActive: true,
    });
    const totalDeactiveRecruiters = await Recruiter.countDocuments({
      isActive: false,
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalRecruiters,
        totalActiveRecruiters,
        totalDeactiveRecruiters,
      },
    });
  } catch (err) {
    console.error("Error fetching recruiter stats:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

export const getRecruitersList = async (req, res) => {
  try {
    // Get companyId from the route parameters
    const { companyId } = req.params;

    // Find the company by its ID
    const company = await Company.findById(companyId);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    // Extract the recruiter IDs from the company's userId array.
    // Assuming the structure is: userId: [ { user: ObjectId }, ... ]
    const recruiterIds = company.userId.map((u) => u.user);

    // Aggregate recruiters matching the company recruiter IDs
    const recruitersAggregation = await Recruiter.aggregate([
      // Match recruiters whose _id is in the extracted list
      {
        $match: { _id: { $in: recruiterIds } },
      },
      // Lookup jobs created by each recruiter
      {
        $lookup: {
          from: "jobs", // Make sure this matches the actual collection name for jobs
          localField: "_id",
          foreignField: "created_by", // In the Job model, this field indicates the creator recruiter
          as: "jobs",
        },
      },
      // Add a field for the number of posted jobs
      {
        $addFields: {
          postedJobs: { $size: "$jobs" },
        },
      },
      // Project the desired fields
      {
        $project: {
          fullname: 1,
          email: "$emailId.email", // Flatten the nested email field
          phone: "$phoneNumber.number", // Flatten the nested phone number
          position: 1,
          postedJobs: 1,
          isActive: 1, // Recruiter status (active/inactive)
        },
      },
    ]);

    // Map each recruiter to include an "isAdmin" flag based on comparison with company's adminEmail.
    const recruitersWithAdmin = recruitersAggregation.map((recruiter) => ({
      ...recruiter,
      isAdmin: recruiter.email === company.adminEmail,
    }));

    // Compute summary information from the updated recruiters
    const totalRecruiters = recruitersWithAdmin.length;
    const activeRecruiters = recruitersWithAdmin.filter(
      (r) => r.isActive
    ).length;
    const deactiveRecruiters = recruitersWithAdmin.filter(
      (r) => !r.isActive
    ).length;
    const totalJobPosts = recruitersWithAdmin.reduce(
      (sum, r) => sum + (r.postedJobs || 0),
      0
    );

    return res.status(200).json({
      success: true,
      recruiters: recruitersWithAdmin,
      summary: {
        totalRecruiters,
        activeRecruiters,
        deactiveRecruiters,
        totalJobPosts,
      },
    });
  } catch (error) {
    console.error("Error fetching recruiter list:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllRecruitersList = async (req, res) => {
  try {
    const recruitersAggregation = await Recruiter.aggregate([
      // Lookup the company details where this recruiter is referenced in the company's userId array
      {
        $lookup: {
          from: "companies",
          let: { recruiterId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$recruiterId", "$userId.user"],
                },
              },
            },
            // Project the fields you need from the company, including adminEmail
            {
              $project: {
                companyName: 1,
                adminEmail: 1,
              },
            },
          ],
          as: "companyDetails",
        },
      },
      // Unwind the companyDetails array (if a recruiter belongs to one company)
      {
        $unwind: {
          path: "$companyDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup jobs created by each recruiter
      {
        $lookup: {
          from: "jobs", // Ensure this matches the actual collection name for jobs
          localField: "_id",
          foreignField: "created_by",
          as: "jobs",
        },
      },
      // Add a field counting the number of posted jobs
      {
        $addFields: {
          postedJobs: { $size: "$jobs" },
        },
      },
      // Project the desired fields for output and include adminEmail from companyDetails
      {
        $project: {
          fullname: 1,
          email: "$emailId.email", // flatten the nested email field
          phone: "$phoneNumber.number", // flatten the nested phone number
          position: 1,
          postedJobs: 1,
          isActive: 1,
          companyName: "$companyDetails.companyName",
          companyId: "$companyDetails._id",
          adminEmail: "$companyDetails.adminEmail",
        },
      },
    ]);

    // Map each recruiter to add an "isAdmin" flag based on comparison with company's adminEmail
    const recruitersWithAdmin = recruitersAggregation.map((recruiter) => ({
      ...recruiter,
      isAdmin: recruiter.email === recruiter.adminEmail,
    }));

    return res.status(200).json({
      success: true,
      recruiters: recruitersWithAdmin,
    });
  } catch (error) {
    console.error("Error fetching all recruiters list:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getRecruiter = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId format to prevent errors
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    // Fetch the user details (excluding sensitive fields like password)
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
