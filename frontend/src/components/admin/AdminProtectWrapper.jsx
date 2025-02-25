import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminProtectWrapper = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) navigate("/admin/login");
    else {
      if (user?.role !== "Owner" && user?.role !== "admin")
        navigate("/page/not/found");
    }
  }, [user]);

  return <>{children}</>;
};

export default AdminProtectWrapper;
