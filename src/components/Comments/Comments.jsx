import "./Comments.css";
import Profile from "../../img/profileImg.jpg";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { FaPen } from "react-icons/fa";

const BASE_URL = "http://graduation.amiralsayed.me/api/comments";
const token = localStorage.getItem("token");

const fetchComments = async ({ queryKey }) => {
  try {
    const [, postId] = queryKey;
    console.log("Fetching comments for postId:", postId);

    const res = await axios.get(`${BASE_URL}/post/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn("No comments found, returning an empty array.");
      return [];
    }
    console.error(
      "Error fetching comments:",
      error.response?.data || error.message
    );
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
        <img src={Profile} alt="Profile" />
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
            <img src={comment.profilePicture || Profile} alt="User" />
            <div className="info">
              <span>{comment.userId}</span>
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
