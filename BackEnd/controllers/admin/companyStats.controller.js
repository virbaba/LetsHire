import { Company } from "../../models/company.model.js";

export const companyStats = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const totalActiveCompanies = await Company.countDocuments({
      isActive: true,
    });
    const totalDeactiveCompanies = await Company.countDocuments({
      isActive: false,
    });

    return res.status(200).json({
      success: true,
      stats:{totalCompanies,
      totalActiveCompanies,
      totalDeactiveCompanies,}
    });
  } catch (err) {
    console.error("Error fetching company stats:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

export const companyList = async (req, res) => {
  try {
    // Fetch all companies with only the selected fields
    const companies = await Company.find(
      {},
      "companyName email adminEmail phone isActive"
    );

    // Send the response with a success status
    res.status(200).json({ success: true, companies });
  } catch (err) {
    console.error("Error retrieving company list:", err);
    res
      .status(500)
      .json({ error: "Server error: Unable to retrieve company list" });
  }
};
