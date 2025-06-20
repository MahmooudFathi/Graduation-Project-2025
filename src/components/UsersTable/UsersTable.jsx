import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../Context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import ProfileImage from "../../img/pngtree-male-avatar-vector-icon-png-image_691612.jpg";
import "./UsersTable.css";

const UsersTable = () => {
  const { usersData, user } = useAuth();
  const [roleSelections, setRoleSelections] = useState({});
  const queryClient = useQueryClient();

  const updateUserRole = async ({ token, userId, newRole }) => {
    try {
      const response = await axios.post(
        "https://graduation.amiralsayed.me/api/users/changeRole",
        {
          idToChange: userId,
          newRole,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update role");
    }
  };

  const mutation = useMutation({
    mutationFn: ({ userId, newRole }) =>
      updateUserRole({ token: user.token, userId, newRole }),
    onSuccess: (_, variables) => {
      toast.success(`User role updated to ${variables.newRole}`);
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleRoleChange = (userId, newRole) => {
    setRoleSelections((prev) => ({
      ...prev,
      [userId]: newRole,
    }));
  };

  const handleChangeClick = (userId) => {
    const newRole =
      roleSelections[userId] || usersData.find((u) => u._id === userId)?.role;
    if (!newRole) return;
    mutation.mutate({ userId, newRole });
  };

  return (
    <div className="usersTable">
      <h2>All Users</h2>
      <div className="tableWrapper">
        <table>
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Local Username</th>
              <th>Email</th>
              <th>Bio</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {usersData?.map((user) => (
              <tr key={user._id}>
                <td data-label="Avatar">
                  <img
                    loading="lazy"
                    src={
                      user.avatarUrl
                        ? `https://graduation.amiralsayed.me${user.avatarUrl}`
                        : ProfileImage
                    }
                    alt="avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = ProfileImage;
                    }}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                    }}
                  />
                </td>
                <td data-label="Local Username">{user.localUserName}</td>
                <td data-label="ُEmail">{user.email}</td>
                <td data-label="Bio">{user.bio}</td>
                <td data-label="Role">
                  <select
                    value={roleSelections[user._id] || user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superAdmin">SuperAdmin</option>
                  </select>
                </td>
                <td data-label="Action">
                  <button
                    onClick={() => handleChangeClick(user._id)}
                    disabled={mutation.isLoading}
                  >
                    {mutation.isLoading &&
                    mutation.variables?.userId === user._id
                      ? "Updating..."
                      : "Change"}
                  </button>
                  <button
                    onClick={() => handleChangeClick(user._id)}
                    disabled={mutation.isLoading}
                  >
                    {mutation.isLoading &&
                    mutation.variables?.userId === user._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
