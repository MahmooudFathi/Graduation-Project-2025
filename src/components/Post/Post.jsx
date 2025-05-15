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
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { Link } from "react-router-dom";

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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const menuRef = useRef(null);
  const textareaRef = useRef(null);
  const toastId = useRef(null);
  const lightboxRef = useRef(null);
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

  useEffect(() => {
    const handleClickOutsideLightbox = (event) => {
      if (
        isLightboxOpen &&
        lightboxRef.current &&
        !lightboxRef.current.contains(event.target) &&
        !event.target.closest(".closeLightbox")
      ) {
        setIsLightboxOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideLightbox);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideLightbox);
    };
  }, [isLightboxOpen]);

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
    if (e.key === "Enter" && !e.shiftKey) {
      // !e.shiftKey لمنع الإرسال عند الضغط على Shift + Enter
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
  // فتح Lightbox عند الضغط على صورة
  const openLightbox = (index) => {
    setStartIndex(index);
    setIsLightboxOpen(true);
  };

  // تحويل الصور لصيغة react-image-gallery
  const galleryImages = data.media.map((mediaItem) => ({
    original: `https://graduation.amiralsayed.me${mediaItem.url}`,
    thumbnail: `https://graduation.amiralsayed.me${mediaItem.url}`,
  }));

  // تحديد الصور اللي هتتعرض (٣ بس)
  const displayedImages = data.media.slice(0, 3);
  const extraImagesCount = data.media.length > 3 ? data.media.length - 3 : 0;

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
                <Link to={`/user/${data.user.centralUsrId}`}>
                  <b>
                    {data.user?.localUserName
                      ? formatUsername(data.user.localUserName)
                      : "Loading..."}
                  </b>
                </Link>
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
                {displayedImages.map((mediaItem, index) => (
                  <div
                    key={index}
                    className="relative postImageContainer"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      loading="lazy"
                      src={`https://graduation.amiralsayed.me${mediaItem.url}`}
                      alt={`Post media ${index}`}
                      className="postImage"
                    />
                    {index === 2 && extraImagesCount > 0 && (
                      <div className="extraImagesOverlay">
                        <span className="extraImagesText">
                          +{extraImagesCount}
                        </span>
                      </div>
                    )}
                  </div>
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
      {isLightboxOpen && (
        <div className="lightboxModal">
          <button
            className="closeLightbox"
            onClick={() => setIsLightboxOpen(false)}
          >
            ✕
          </button>
          <div className="lightboxContent" ref={lightboxRef}>
            <ImageGallery
              items={galleryImages}
              startIndex={startIndex}
              showThumbnails={true}
              showPlayButton={false}
              showFullscreenButton={false}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Post;
