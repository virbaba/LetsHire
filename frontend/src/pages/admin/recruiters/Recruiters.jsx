import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trash,
  Eye,
  Briefcase,
  UserCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, MenuItem, Switch } from "@mui/material";
import { FaRegUser } from "react-icons/fa";
import Navbar from "@/components/admin/Navbar";
import {
  ADMIN_RECRUITER_DATA_API_END_POINT,
  RECRUITER_API_END_POINT,
} from "@/utils/ApiEndPoint";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import DeleteConfirmation from "@/components/shared/DeleteConfirmation";

const Recruiters = () => {
  // this file show the recruiter of particular company
  const { companyId } = useParams();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState({});
  const [dloading, dsetLoading] = useState({});
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const [recruiterList, setRecruiterList] = useState([]);
  const [recruiterSummary, setRecruiterSummary] = useState(null);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  const stats = [
    {
      title: "Total Recruiters",
      count: recruiterSummary?.totalRecruiters || 0,
      change: "+10%",
      icon: <FaRegUser size={30} />,
      color: "text-blue-500",
      bg: "bg-blue-100",
    },

    {
      title: "Active Recruiters",
      count: recruiterSummary?.activeRecruiters || 0,
      change: "+8%",
      icon: <UserCheck size={30} />,
      color: "text-yellow-500",
      bg: "bg-yellow-100",
    },
    {
      title: "Deactive Recruiter",
      count: recruiterSummary?.deactiveRecruiters || 0,
      change: "+5.2%",
      icon: <XCircle size={30} />,
      color: "text-red-500",
      bg: "bg-red-100",
    },
    {
      title: "Posted Jobs",
      count: recruiterSummary?.totalJobPosts || 0,
      change: "+5.2%",
      icon: <Briefcase size={30} />,
      color: "text-green-500",
      bg: "bg-green-100",
    },
  ];

  const toggleActive = async (recruiterId, isActive, isAdmin) => {
    try {
      setLoading((prevLoading) => ({ ...prevLoading, [recruiterId]: true }));
      const response = await axios.put(
        `${RECRUITER_API_END_POINT}/toggle-active`,
        {
          recruiterId,
          companyId,
          isActive,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        if (isAdmin) {
          fetchRecruiterList();
        } else {
          // For a single recruiter toggle: update the specific recruiter in the list
          setRecruiterList((prevList) =>
            prevList.map((recruiter) =>
              recruiter._id === recruiterId
                ? { ...recruiter, isActive }
                : recruiter
            )
          );
          // Adjust the summary: decrease active by one, increase deactive by one
          setRecruiterSummary((prevSummary) => ({
            ...prevSummary,
            activeRecruiters: isActive
              ? prevSummary.activeRecruiters + 1
              : prevSummary.activeRecruiters - 1,
            deactiveRecruiters: isActive
              ? prevSummary.deactiveRecruiters - 1
              : prevSummary.deactiveRecruiters + 1,
          }));
        }

        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error toggling recruiter:", error);
      toast.error(
        "There was an error toggling the recruiter. Please try again later."
      );
    } finally {
      setLoading((prevLoading) => ({ ...prevLoading, [recruiterId]: false }));
    }
  };

  const deleteRecruiter = async (recruiterId, userEmail) => {
    try {
      dsetLoading((prevLoading) => ({ ...prevLoading, [recruiterId]: true }));
      const response = await axios.delete(`${RECRUITER_API_END_POINT}/delete`, {
        data: { userEmail, companyId },
        withCredentials: true,
      });

      if (response.data.success) {
        fetchRecruiterList();
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting recruiter:", error);
      toast.error(
        "There was an error deleting the recruiter. Please try again later."
      );
    } finally {
      dsetLoading((prevLoading) => ({ ...prevLoading, [recruiterId]: false }));
    }
  };

  const onConfirmDelete = () => {
    setShowDeleteModal(false);
    deleteRecruiter(selectedRecruiter?._id, selectedRecruiter?.email);
  };

  const onCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const fetchRecruiterList = async () => {
    try {
      const response = await axios.get(
        `${ADMIN_RECRUITER_DATA_API_END_POINT}/recruiter-stats/${companyId}`
      );
      if (response.data.success) {
        setRecruiterList(response.data.recruiters);
        setRecruiterSummary(response.data.summary);
      }
    } catch (err) {
      console.log(`error in recruiter fetching ${err}`);
    }
  };

  useEffect(() => {
    fetchRecruiterList();
  }, []);

  const filteredRecruiters = recruiterList?.filter((recruiter) => {
    const matchesSearch =
      recruiter.fullname.toLowerCase().includes(search.toLowerCase()) ||
      recruiter.email.toLowerCase().includes(search.toLowerCase()) ||
      recruiter.phone.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = status === "All" || recruiter.isActive === status;

    return matchesSearch && matchesStatus;
  });

  const paginatedRecruiters = filteredRecruiters.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <>
      <Navbar linkName={"Recruiters"} />
      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="p-4 flex items-center justify-between bg-white shadow rounded-xl"
          >
            <div>
              <h3 className="text-lg font-semibold mt-2">{stat.title}</h3>
              <p className="text-2xl font-bold text-center">{stat.count}</p>
              {/* <span className="text-sm text-gray-500">{stat.change} from last month</span> */}
            </div>
            <div className={`p-2 rounded-full ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
          </Card>
        ))}
      </div>
      <div className="m-4 p-4 bg-white shadow rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Search by name, email, contact "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/3"
          />
          {/* Status select */}
          <Select
            value={status}
            onChange={(e) => {
              const value = e.target.value;
              setStatus(value);
            }}
            className="w-1/6 h-10"
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value={true}>Active</MenuItem>
            <MenuItem value={false}>Deactive</MenuItem>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recruiter Name</TableHead>
              <TableHead>Recruiter Contact</TableHead>
              <TableHead>Recruiter Position</TableHead>
              <TableHead>Posted Jobs</TableHead>
              <TableHead>Recruiter Status</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecruiters.map((recruiter) => (
              <TableRow key={recruiter._id}>
                <TableCell>
                  {recruiter.fullname + " "}{" "}
                  {recruiter.isAdmin && (
                    <span className="text-green-600 font-bold">Admin</span>
                  )}
                  <br />
                  {recruiter.email}
                </TableCell>
                <TableCell>{recruiter.phone}</TableCell>
                <TableCell>{recruiter.position}</TableCell>
                <TableCell>{recruiter.postedJobs}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      recruiter.isActive
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {recruiter.isActive ? "Active" : "Deactive"}
                  </span>
                </TableCell>

                <TableCell className="flex items-center gap-3">
                  <Eye
                    className="text-blue-500 cursor-pointer"
                    size={20}
                    onClick={() =>
                      navigate(`/admin/recruiter/details/${recruiter._id}`)
                    }
                  />

                  {/* Toggle for recruiter activeness */}
                  {loading[recruiter._id] ? (
                    "loading..."
                  ) : (
                    <Switch
                      checked={recruiter.isActive}
                      onChange={(e) =>
                        toggleActive(
                          recruiter._id,
                          !recruiter.isActive,
                          recruiter.isAdmin
                        )
                      }
                      color="primary"
                      size="20"
                      inputProps={{
                        "aria-label": "Toggle Recruiter Active Status",
                      }}
                    />
                  )}

                  {dloading[recruiter._id] ? (
                    "loading..."
                  ) : (
                    <Trash
                      className="text-red-500 cursor-pointer"
                      size={20}
                      onClick={() => {
                        setSelectedRecruiter(recruiter);
                        setShowDeleteModal(true);
                      }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-between items-center mt-4">
          <span>
            Showing{" "}
            {Math.min((page - 1) * itemsPerPage + 1, filteredRecruiters.length)}{" "}
            to {Math.min(page * itemsPerPage, filteredRecruiters.length)} of{" "}
            {filteredRecruiters.length} results
          </span>
          <div className="flex gap-2">
            <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            {[
              ...Array(Math.ceil(filteredRecruiters.length / itemsPerPage)),
            ].map((_, i) => (
              <Button
                key={i}
                onClick={() => setPage(i + 1)}
                className={page === i + 1 ? "bg-blue-700 text-white" : ""}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              disabled={
                page === Math.ceil(filteredRecruiters.length / itemsPerPage)
              }
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteConfirmation
          isOpen={showDeleteModal}
          onConfirm={onConfirmDelete}
          onCancel={onCancelDelete}
        />
      )}
    </>
  );
};

export default Recruiters;
