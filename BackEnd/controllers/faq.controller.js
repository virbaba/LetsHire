export const getAnswer = async (req, res) => {
  const { question } = req.body;

  // Predefined Q&A
  const faqs = {
    "how to create a company?": [
      "1. First, create a Recruiter Account.",
      "2. Create a Company using 'Create New'.",
      "3. Your company will be verified by LetsHire soon.",
    ],

    "how to post a job?": [
      "1. First, create a Recruiter Account.",
      "2. Create a Company using 'Create New'.",
      "3. Your company will be verified by LetsHire.",
      "4. After verification, go to 'Create New' and select 'Post Job'.",
      "5. Fill the job posting form and post the job",
    ],

    "how to apply for a job?": [
      "1. Search for a job.",
      "2. Click 'Apply Now'.",
      "3. Submit your resume.",
    ],
  };

  const answer =
    faqs[question.toLowerCase()] || "Sorry, I don't have an answer for that.";
  return res.status(200).json({ success: true, answer });
};
