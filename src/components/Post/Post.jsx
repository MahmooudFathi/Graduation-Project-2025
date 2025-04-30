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
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const Post = ({ data }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [liked, setLiked] = useState(
    data.impressionsCount.love ||
      data.impressionsCount.like ||
      data.impressionsCount.care
  );

  const userId = localStorage.getItem("userId");

  const [shared, setShared] = useState(data.shareList.includes(userId));
  const [shareCount, setShareCount] = useState(data.shareCount);
  const [shareList, setShareList] = useState(data.shareList || []);
  const [menuOpen, setMenuOpen] = useState(false); // حالة القائمة
  const [editMode, setEditMode] = useState(false);
  const [newCaption, setNewCaption] = useState(data.postCaption);
  const [isSaved, setIsSaved] = useState(data.saveList.includes(userId));
  const [previewImageIndex, setPreviewImageIndex] = useState(null);
  const menuRef = useRef(null);
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const toastId = useRef(null);
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  const isArabic = (text) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  function formatUsername(username) {
    if (!username) return "";
    let formattedUsername = username
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
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

  // ⬅️ مستمع جديد لإغلاق المعاينة عند الضغط خارج الصورة
  useEffect(() => {
    const handleClickOutsidePreview = (event) => {
      if (
        previewImageIndex !== null &&
        previewRef.current &&
        !previewRef.current.contains(event.target) &&
        !event.target.closest(".previewArrow") && // تجاهل النقر على الأسهم
        !event.target.closest(".closePreview") // تجاهل النقر على زر الإغلاق
      ) {
        closeImagePreview();
      }
    };

    document.addEventListener("mousedown", handleClickOutsidePreview);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsidePreview);
    };
  }, [previewImageIndex]);

  const handleUpdateClick = (event) => {
    event.stopPropagation();
    setMenuOpen(false);
    setEditMode(true);
  };

  useEffect(() => {
    if (editMode && textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [editMode]);

  // دالة حذف البوست
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(
        `https://graduation.amiralsayed.me/api/posts/${data._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]); // تحديث قائمة البوستات
      toast.success("Post deleted successfully! 🎉");
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
        `https://graduation.amiralsayed.me/api/posts/${data._id}/reactions`,
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
        url: `https://graduation.amiralsayed.me/api/posts/${data._id}/shares`,
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
        `https://graduation.amiralsayed.me/api/posts/${data._id}/caption`,
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { // !e.shiftKey لمنع الإرسال عند الضغط على Shift + Enter
      e.preventDefault(); // منع الانتقال إلى سطر جديد
      handleUpdateCaption(); // استدعاء دالة الحفظ
    }
  };

  // ✅ دالة حفظ البوست
  const savePostMutation = useMutation({
    mutationFn: async () => {
      setMenuOpen(false);
      const res = await axios.post(
        `https://graduation.amiralsayed.me/api/posts/${data._id}/saves`,
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
      setTimeout(() => {
        setMenuOpen(false);
      }, 100);
      if (toastId.current) {
        toast.dismiss(toastId.current);
      }
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
  // دالة لفتح المعاينة عند الضغط على الصورة
  const openImagePreview = (index) => {
    setPreviewImageIndex(index);
  };

  // دالة لإغلاق المعاينة
  const closeImagePreview = () => {
    setPreviewImageIndex(null);
  };

  // دالة للتنقل إلى الصورة التالية
  const nextImage = () => {
    if (previewImageIndex < data.media.length - 1) {
      setPreviewImageIndex(previewImageIndex + 1);
    }
  };

  // دالة للتنقل إلى الصورة السابقة
  const prevImage = () => {
    if (previewImageIndex > 0) {
      setPreviewImageIndex(previewImageIndex - 1);
    }
  };
  return (
    <>
      <div className="Post">
        <img
          loading="lazy"
          src={
            data.user.avatarUrl
              ? `https://graduation.amiralsayed.me${data.user.avatarUrl}`
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
                <b>
                  {data.user?.localUserName
                    ? formatUsername(data.user.localUserName)
                    : "Loading..."}
                </b>
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
                  onKeyDown={handleKeyDown}
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
            {data.media && data.media.length > 0 && (
              <div className="postImages">
                {data.media.map((mediaItem, index) => (
                  <img
                    key={index}
                    loading="lazy"
                    src={`https://graduation.amiralsayed.me${mediaItem.url}`}
                    alt={`Post media ${index}`}
                    className="postImage"
                    onClick={() => openImagePreview(index)}
                  />
                ))}
              </div>
            )}
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
      {previewImageIndex !== null && (
        <div className="imagePreviewModal">
          <div className="imagePreviewContent" ref={previewRef}>
            <IoClose className="closePreview" onClick={closeImagePreview} />
            {data.media.length > 1 && (
              <>
                <IoIosArrowBack
                  className={`previewArrow ${
                    previewImageIndex === 0 ? "disabled" : ""
                  }`}
                  onClick={prevImage}
                />
                <IoIosArrowForward
                  className={`previewArrow ${
                    previewImageIndex === data.media.length - 1
                      ? "disabled"
                      : ""
                  }`}
                  onClick={nextImage}
                />
              </>
            )}
            <img
              src={`https://graduation.amiralsayed.me${data.media[previewImageIndex].url}`}
              alt="Preview"
              className="previewImageFull"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Post;
