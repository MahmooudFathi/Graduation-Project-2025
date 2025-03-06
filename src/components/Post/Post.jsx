import React, { useEffect, useRef, useState } from "react";
import "./Post.css";
import { MdVerified } from "react-icons/md";
import { TfiMoreAlt } from "react-icons/tfi";
import { GoHeartFill, GoHeart } from "react-icons/go";
import { FaRegCommentAlt } from "react-icons/fa";
import { TbShare3 } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import { HiOutlineSave } from "react-icons/hi";
import { FaPen } from "react-icons/fa6";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import ProfileImage from "../../img/pngtree-male-avatar-vector-icon-png-image_691612.jpg";
import { format } from "timeago.js";
import Comments from "../Comments/Comments";
import toast from "react-hot-toast";

const ip = "40.127.8.41";

const Post = ({ data }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [liked, setLiked] = useState(
    data.impressionsCount.love ||
      data.impressionsCount.like ||
      data.impressionsCount.care
  );

  const userId = "2d699535-4b88-4ac2-8f44-8a2c42d13e2f"; // استبدلها بمصدر userId الفعلي

  const [shared, setShared] = useState(data.shareList.includes(userId));
  const [shareCount, setShareCount] = useState(data.shareCount);
  const [shareList, setShareList] = useState(data.shareList || []);
  const [menuOpen, setMenuOpen] = useState(false); // حالة القائمة
  const [editMode, setEditMode] = useState(false);
  const [newCaption, setNewCaption] = useState(data.postCaption);
  const [isSaved, setIsSaved] = useState(data.saveList.includes(userId));
  const menuRef = useRef(null);
  const textareaRef = useRef(null); // ⬅️ مرجع للـ textarea
  const toastId = useRef(null);
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  const isArabic = (text) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

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

  // ✅ إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.closest(".menu-item")
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleUpdateClick = (event) => {
    event.stopPropagation();
    setMenuOpen(false); // ✅ إغلاق القائمة
    setEditMode(true); // ✅ تفعيل وضع التعديل
  };

  // 🔹 استخدم useEffect لضمان التركيز بعد تحديث الـ editMode
  useEffect(() => {
    if (editMode && textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length); // ⬅️ وضع المؤشر في النهاية
    }
  }, [editMode]);

  // دالة حذف البوست
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`https://${ip}/api/posts/${data._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]); // تحديث قائمة البوستات
    },
    onError: (error) => {
      console.error(
        "Error deleting post:",
        error.response?.data || error.message
      );
    },
  });

  // دالة إضافة / إزالة اللايك
  const likePostMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `https://${ip}/api/posts/${data._id}/reactions`,
        { reactionType: liked ? "hate" : "love" }, // إذا كان معجبًا، أرسل "hate" لإزالة اللايك
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      setLiked(!liked); // تغيير الحالة بدون انتظار إعادة تحميل
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      console.error(
        "Error toggling reaction:",
        error.response?.data || error.message
      );
    },
  });

  // ✅ دالة لمشاركة/إلغاء مشاركة المنشور
  const sharePostMutation = useMutation({
    mutationFn: async () => {
      const method = shared ? "DELETE" : "POST";
      const res = await axios({
        method,
        url: `https://${ip}/api/posts/${data._id}/shares`,
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: (response) => {
      setShared(!shared);
      setShareList(response.post.shareList);
      setShareCount(response.post.shareCount);
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      console.error(
        "Error toggling share:",
        error.response?.data || error.message
      );
    },
  });

  // ✅ دالة تحديث الكابشن
  const handleUpdateCaption = async () => {
    console.log("Updating caption...");
    console.log("New Caption:", newCaption);

    try {
      const response = await axios.put(
        `https://${ip}/api/posts/${data._id}/caption`,
        { newCaption },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response:", response.data);
      toast.success("Caption updated successfully! 🎉");
      setEditMode(false); // إغلاق وضع التعديل
      queryClient.invalidateQueries(["posts"]); // إعادة تحميل البيانات بعد التحديث
    } catch (error) {
      console.error(
        "Error updating caption:",
        error.response?.data || error.message
      );
    }
  };

  // ✅ دالة حفظ البوست
  const savePostMutation = useMutation({
    mutationFn: async () => {
      console.log("Saving post with ID:", data._id); // ✅ التأكد من ID المنشور
      setMenuOpen(false);

      const res = await axios.post(
        `https://${ip}/api/posts/${data._id}/saves`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.data;
    },
    onSuccess: (response) => {
      setIsSaved(response.post.saveList.includes(userId));

      // ✅ إغلاق القائمة بعد التحديث
      setTimeout(() => {
        setMenuOpen(false);
      }, 100);

      // ✅ إغلاق التنبيه السابق إن وُجد
      if (toastId.current) {
        toast.dismiss(toastId.current);
      }

      // ✅ إنشاء توست جديد وتخزين ID الخاص به
      toastId.current = toast.success(
        isSaved ? "Post removed from saved! ❌" : "Post saved successfully! 🎉",
        { autoClose: 2000 }
      );

      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      console.error(
        "Error toggling save:",
        error.response?.data || error.message
      );

      // ✅ إغلاق أي تنبيه خطأ سابق
      if (toastId.current) {
        toast.dismiss(toastId.current);
      }

      // ✅ عرض تنبيه الخطأ وتخزين الـ ID
      toastId.current = toast.error(
        `Error: ${error.response?.data?.message || "Something went wrong!"}`,
        { autoClose: 2000 }
      );
    },
  });

  return (
    <>
      <div className="Post">
        <img
          src={
            data.user.avatarUrl
              ? `https://${ip}${data.user.avatarUrl}`
              : ProfileImage
          }
          alt="Author"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = ProfileImage;
          }}
        />
        <div>
          <div className="name-detail">
            <div>
              <div>
                <b>{formatUsername(data.user.localUserName)}</b>
                <MdVerified />
              </div>
              <div className="menu-container">
                <TfiMoreAlt
                  className="icon"
                  onClick={() => {
                    setMenuOpen(!menuOpen);
                  }}
                  ref={menuRef}
                />
                {menuOpen && (
                  <div className="post-menu">
                    <div
                      className="menu-item"
                      onClick={() => savePostMutation.mutate()}
                    >
                      <HiOutlineSave className="icon" />
                      {isSaved ? "UnSave" : "Save"}
                    </div>
                    <div className="menu-item" onClick={handleUpdateClick}>
                      <FaPen className="icon" /> Edit
                    </div>
                  </div>
                )}
                <IoClose
                  className="icon"
                  onClick={() => deletePostMutation.mutate()}
                />
              </div>
            </div>
            <div className="p-date">{format(data.createdAt)}</div>
          </div>

          <div className="post-detail">
            {editMode ? (
              <div className="edit-mode">
                <textarea
                  ref={textareaRef}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="edit-input"
                  dir={isArabic(data.postCaption) ? "rtl" : "ltr"}
                />
                <button onClick={handleUpdateCaption} className="save-btn">
                  Save
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <span dir={isArabic(data.postCaption) ? "rtl" : "ltr"}>
                {data.postCaption}
              </span>
            )}
            <img src={`https://${ip}${data.media[0].url}`} alt="" />
          </div>

          <div className="postReact">
            <div>
              {data.impressionsCount.love ||
              data.impressionsCount.like ||
              data.impressionsCount.care ? (
                <GoHeartFill
                  className="icon-heart icon-fill"
                  onClick={() => likePostMutation.mutate()}
                />
              ) : (
                <GoHeart
                  className="icon-heart"
                  onClick={() => likePostMutation.mutate()}
                />
              )}
              <FaRegCommentAlt
                className="icon"
                onClick={() => setCommentOpen(!commentOpen)}
              />
              <TbShare3
                className={`icon ${shared ? "icon-fill" : ""}`}
                onClick={() => sharePostMutation.mutate()}
              />
              <span>{data.impressionsCount.love + data.shareCount}</span>
            </div>
            <div>{data.comments.length} Comments</div>
          </div>
          {commentOpen && <Comments postId={data._id} />}
        </div>
      </div>
    </>
  );
};

export default Post;
