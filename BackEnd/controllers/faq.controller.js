export const getAnswer = async (req, res) => {
  const { question } = req.body;

  // Predefined Q&A
  const faqs = {
    "How to create a company?":
      "1. First create Recruiter Account.\n2. Create Company by Create New Options and your company will verify by LetsHire soon.",
    "How to post a job?":
      '1. First create Recruiter Account.\n2.Create Company by Create New Options and your company will verify by LetsHire.\n3.After verification go to Create New option and "Post Job". You and your team can post 5 free jobs',
    "How to apply for a job?":
      "Search for a job, click 'Apply Now', and submit your resume.",
  };

  const answer =
    faqs[question.toLowerCase()] || "Sorry, I don't have an answer for that.";
  res.json({ success: true, answer });
};
