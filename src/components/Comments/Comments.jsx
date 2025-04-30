import "./Comments.css";
import React from "react";
import Profile from "../../img/pngtree-male-avatar-vector-icon-png-image_691612.jpg";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { MdMoreVert } from "react-icons/md";
import toast from "react-hot-toast";
import { FaPen, FaReply } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";

const BASE_URL = "https://graduation.amiralsayed.me/api/comments";
const token = localStorage.getItem("token");
function formatUsername(username) {
  if (!username) return ""; // تجنب الأخطاء عند تمرير قيمة فارغة

  // تحويل أول حرف في كل كلمة إلى حرف كبير
  let formattedUsername = username
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  // حذف الأرقام في نهاية النص فقط
  formattedUsername = formattedUsername.replace(/\d+$/, "");

  return formattedUsername;
}

const fetchUser = async (userId) => {
  try {
    const res = await axios.get(
      `https://graduation.amiralsayed.me/api/users/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
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

const postComment = async ({ postId, content, parentCommentId }) => {
  return axios.post(
    `${BASE_URL}/post/${postId}`,
    { content, parentCommentId },
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
  const replyInputRef = useRef(null);
  const writeRef = useRef(null);
  const [editMode, setEditMode] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [editContent, setEditContent] = useState("");
  const { userData } = useAuth();
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);

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

  useEffect(() => {
    if (replyTo === null) return;

    const handleClickOutside = (event) => {
      if (writeRef.current && !writeRef.current.contains(event.target)) {
        setReplyTo(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [replyTo]);

  useEffect(() => {
    if (replyTo !== null) {
      setNewComment(""); // 🔹 إعادة تعيين الإدخال عند تغيير `replyTo`
      setTimeout(() => {
        replyInputRef.current?.focus(); // 🔹 استخدام `?.` لتجنب الأخطاء في حال لم يكن `replyInputRef` جاهزًا
      }, 0);
    }
  }, [replyTo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

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
    onSuccess: (data, variables) => {
      const deletedCommentId = variables;
      const parentCommentId = data.comment?.parentCommentId;

      queryClient.setQueryData(["comments", postId], (oldData) => {
        // 1. إزالة الرد المحذوف من القائمة الرئيسية
        const updatedComments = oldData.filter(
          (comment) => comment._id !== deletedCommentId
        );

        // 2. إذا كان الرد تابعًا لتعليق رئيسي، نحدث مصفوفة replies
        if (parentCommentId) {
          return updatedComments.map((comment) => {
            if (comment._id === parentCommentId) {
              return {
                ...comment,
                replies: comment.replies.filter(
                  (id) => id !== deletedCommentId
                ),
              };
            }
            return comment;
          });
        }
        return updatedComments;
      });

      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
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

  const updateCommentReplies = async ({ commentId, replies }) => {
    return axios.put(
      `${BASE_URL}/${commentId}`,
      { replies },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  };

  const updateRepliesMutation = useMutation({
    mutationFn: updateCommentReplies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
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
    addCommentMutation.mutate({
      postId,
      content: newComment,
      parentCommentId: replyTo,
    });
  };

  const handleDeleteComment = (commentId, parentCommentId) => {
    deleteCommentMutation.mutate(commentId, {
      onSuccess: () => {
        queryClient.setQueryData(["comments", postId], (oldData) => {
          if (!oldData) return [];

          // حذف الرد من قائمة التعليقات
          const updatedComments = oldData.filter(
            (comment) => comment._id !== commentId
          );

          // تحديث replies في التعليق الرئيسي
          if (parentCommentId) {
            return updatedComments.map((comment) => {
              if (comment._id === parentCommentId) {
                return {
                  ...comment,
                  replies: comment.replies.filter((id) => id !== commentId), // إزالة الـ ID
                };
              }
              return comment;
            });
          }

          return updatedComments;
        });

        // تحديث replies في الـ API
        if (parentCommentId) {
          const parentComment = queryClient
            .getQueryData(["comments", postId])
            ?.find((c) => c._id === parentCommentId);

          if (parentComment) {
            const updatedReplies = parentComment.replies.filter(
              (id) => id !== commentId
            );
            updateRepliesMutation.mutate({
              commentId: parentCommentId,
              replies: updatedReplies,
            });
          }
        }

        toast.success("Comment deleted successfully");
      },
    });
  };

  const handleReact = (commentId, impressionType) => {
    reactMutation.mutate({ commentId, impressionType });
  };

  return (
    <div className="comments">
      <div className="write" ref={writeRef}>
        <img
          loading="lazy"
          src={
            userData && userData.avatarUrl
              ? `https://graduation.amiralsayed.me${userData.avatarUrl}`
              : Profile
          }
          alt="Profile"
        />
        <input
          ref={replyInputRef}
          key={replyTo}
          type="text"
          placeholder={
            replyTo !== null ? "Write a reply..." : "Write a comment..."
          }
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
        .filter((comment) => comment.parentCommentId === null)
        .map((comment) => (
          <div key={comment._id} className="comment">
            <img
              loading="lazy"
              src={
                comment.user.avatarUrl
                  ? `https://graduation.amiralsayed.me${comment.user.avatarUrl}`
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
                <div className="reply">
                  <div
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const newSet = new Set(expandedComments);
                      newSet.has(comment._id)
                        ? newSet.delete(comment._id)
                        : newSet.add(comment._id);
                      setExpandedComments(newSet);
                    }}
                  >
                    {comment.replies?.length > 0 && (
                      <>
                        <span style={{ marginRight: "5px" }}>
                          {comment.replies.length} Replies
                        </span>
                        <span
                          className={`arrow ${
                            expandedComments.has(comment._id) ? "up" : "down"
                          }`}
                        >
                          ▼
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      setReplyTo(comment._id);
                      e.stopPropagation();
                    }}
                  >
                    <FaReply />
                  </button>
                </div>
              </div>
              <div className="replies">
                {expandedComments.has(comment._id) &&
                  comments
                    .filter((reply) => reply.parentCommentId === comment._id)
                    .map((reply) => (
                      <div key={reply._id} className="comment">
                        <img
                          loading="lazy"
                          src={
                            comment.user.avatarUrl
                              ? `https://graduation.amiralsayed.me${reply.user.avatarUrl}`
                              : Profile
                          }
                          alt="User"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = Profile;
                          }}
                        />
                        <div className="info">
                          <span>
                            {formatUsername(reply.user.localUserName)}
                          </span>
                          {editMode === reply._id ? (
                            <div>
                              <textarea
                                ref={textareaRef}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="edit-input"
                                dir={isArabic(reply.content) ? "rtl" : "ltr"}
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
                                {updateCommentMutation.isPending
                                  ? "Saving..."
                                  : "Save"}
                              </button>
                              <button
                                className="cancel-btn"
                                onClick={() => setEditMode(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <p dir={isArabic(reply.content) ? "rtl" : "ltr"}>
                              {reply.content}
                            </p>
                          )}
                          <div className="details">
                            <button
                              onClick={() => handleReact(reply._id, "like")}
                            >
                              {reply.reactions?.some(
                                (r) => r.impressionType === "like"
                              ) ? (
                                <GoHeartFill className="icon-heart icon-fill" />
                              ) : (
                                <GoHeart className="icon-heart" />
                              )}
                            </button>
                            {reply.reactions?.length || 0}
                            <span className="date">
                              {new Date(reply.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="more">
                          <FaPen
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setEditMode(reply._id);
                              setEditContent(reply.content);
                            }}
                          />
                        </div>
                      </div>
                    ))}
              </div>
            </div>
            <div className="menu-container">
              <MdMoreVert
                className="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(
                    menuOpenId === comment._id ? null : comment._id
                  );
                }}
              />
              {menuOpenId === comment._id && (
                <div ref={menuRef} className="post-menu">
                  <div
                    className="menu-item"
                    onClick={() => {
                      setEditMode(comment._id);
                      setEditContent(comment.content);
                      setMenuOpenId(null);
                    }}
                  >
                    <FaPen className="icon" /> Edit
                  </div>
                  <div
                    className="menu-item"
                    onClick={() => {
                      setMenuOpenId(null);
                      handleDeleteComment(comment._id, comment.parentCommentId);
                    }}
                  >
                    <IoClose className="icon" /> Delete
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Comments;
