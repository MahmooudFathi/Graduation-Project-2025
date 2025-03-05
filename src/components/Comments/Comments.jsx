import "./Comments.css";
import React from "react";
import Profile from "../../img/pngtree-male-avatar-vector-icon-png-image_691612.jpg";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { FaPen } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";

const ip = "40.127.8.41";
const BASE_URL = `https://${ip}/api/comments`;
const token = localStorage.getItem("token");
function formatUsername(username) {
  if (!username) return ""; // تجنب الأخطاء عند تمرير قيمة فارغة

  // تحويل أول حرف (سواء كان رقمًا أو حرفًا) إلى كبير
  let formattedUsername =
      username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();

  // حذف الأرقام في نهاية النص فقط
  formattedUsername = formattedUsername.replace(/\d+$/, "");

  return formattedUsername;
}


const fetchUser = async (userId) => {
  try {
    const res = await axios.get(`https://${ip}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return { name: "Unknown", avatarUrl: null }; // قيمة افتراضية في حالة الخطأ
  }
};

const fetchComments = async ({ queryKey }) => {
  try {
    const [, postId] = queryKey;
    const res = await axios.get(`${BASE_URL}/post/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const comments = res.data;

    // جلب بيانات المستخدم لكل تعليق
    const commentsWithUserData = await Promise.all(
      comments.map(async (comment) => {
        const userData = await fetchUser(comment.userId);
        return { ...comment, user: userData };
      })
    );

    return commentsWithUserData;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

const postComment = async ({ postId, content }) => {
  return axios.post(
    `${BASE_URL}/post/${postId}`,
    { content, parentCommentId: null },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};

const deleteComment = async (commentId) => {
  return axios.delete(`${BASE_URL}/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const updateComment = async ({ commentId, content }) => {
  return axios.put(
    `${BASE_URL}/${commentId}`,
    { content },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};

const reactToComment = async ({ commentId, impressionType }) => {
  return axios.post(
    `${BASE_URL}/${commentId}/reactions`,
    { impressionType },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};

const isArabic = (text) => {
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

const Comments = ({ postId }) => {
  const queryClient = useQueryClient();
  const textareaRef = useRef(null);
  const [editMode, setEditMode] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [editContent, setEditContent] = useState("");
  const { userData } = useAuth();

  const { data: comments = [], isPending } = useQuery({
    queryKey: ["comments", postId],
    queryFn: fetchComments,
    enabled: !!postId,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (editMode !== null && textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [editMode]);

  const addCommentMutation = useMutation({
    mutationFn: postComment,
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Comment added successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add comment");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Comment deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Comment updated successfully");
      setEditMode(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update comment");
    },
  });

  const reactMutation = useMutation({
    mutationFn: reactToComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate({ postId, content: newComment });
  };

  const handleDeleteComment = (commentId) => {
    deleteCommentMutation.mutate(commentId);
  };

  const handleReact = (commentId, impressionType) => {
    reactMutation.mutate({ commentId, impressionType });
  };

  return (
    <div className="comments">
      <div className="write">
        <img
          src={
            userData && userData.avatarUrl
              ? `https://${ip}${userData.avatarUrl}`
              : Profile
          }
          alt="Profile"
        />
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          onClick={handleSendComment}
          className="button pc-button"
          disabled={addCommentMutation.isPending}
        >
          {addCommentMutation.isPending ? "Sending..." : "Send"}
        </button>
      </div>
      {isPending && <p>Loading comments...</p>}
      {comments.length === 0 && (
        <p>No comments found. Be the first to comment! 📝</p>
      )}
      {comments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((comment) => (
          <div key={comment._id} className="comment">
            <img
              src={
                comment.user.avatarUrl
                  ? `https://${ip}${comment.user.avatarUrl}`
                  : Profile
              }
              alt="User"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = Profile;
              }}
            />
            <div className="info">
              <span>{formatUsername(comment.user.localUserName)}</span>
              {editMode === comment._id ? (
                <div>
                  <textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="edit-input"
                    dir={isArabic(comment.content) ? "rtl" : "ltr"}
                  />
                  <button
                    className="save-btn"
                    onClick={() =>
                      updateCommentMutation.mutate({
                        commentId: editMode,
                        content: editContent,
                      })
                    }
                    disabled={updateCommentMutation.isPending}
                  >
                    {updateCommentMutation.isPending ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setEditMode(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p dir={isArabic(comment.content) ? "rtl" : "ltr"}>
                  {comment.content}
                </p>
              )}
              <div className="details">
                <button onClick={() => handleReact(comment._id, "like")}>
                  {comment.reactions?.some(
                    (r) => r.impressionType === "like"
                  ) ? (
                    <GoHeartFill className="icon-heart icon-fill" />
                  ) : (
                    <GoHeart className="icon-heart" />
                  )}
                </button>
                {comment.reactions?.length || 0}
                <span className="date">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="more">
              <FaPen
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setEditMode(comment._id);
                  setEditContent(comment.content);
                }}
              />
              <IoClose
                style={{ cursor: "pointer" }}
                onClick={() => handleDeleteComment(comment._id)}
              />
            </div>
          </div>
        ))}
    </div>
  );
};

export default Comments;
