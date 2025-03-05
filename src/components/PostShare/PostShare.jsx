import React, { useState, useRef } from "react";
import ProfileImage from "../../img/pngtree-male-avatar-vector-icon-png-image_691612.jpg";
import "./PostShare.css";
import { HiOutlinePhoto } from "react-icons/hi2";
import { PiPlayCircle } from "react-icons/pi";
import { BiLocationPlus } from "react-icons/bi";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../Context/AuthContext";

const ip = "40.127.8.41";

const PostShare = () => {
  const [postCaption, setPostCaption] = useState("");
  const [image, setImage] = useState(null);
  const imageRef = useRef();
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const token = localStorage.getItem("token");

  const mutation = useMutation({
    mutationFn: async (newPost) => {
      const formData = new FormData();
      formData.append("postCaption", newPost.postCaption);

      // ✅ إضافة الصورة فقط إذا كانت موجودة
      if (newPost.media) {
        formData.append("media", newPost.media);
      }

      // ✅ طباعة البيانات لمعرفة ماذا يتم إرساله
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await fetch(`https://${ip}/api/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error response from server:", errorData);
        throw new Error(errorData.message || "Failed to upload post");
      }

      return res.json();
    },
    onSuccess: () => {
      // ✅ تحديث قائمة البوستات بدون إعادة تحميل
      queryClient.invalidateQueries(["posts"]); // 🔄 إعادة جلب البيانات

      // ✅ إعادة تعيين الإدخال بعد النشر
      setPostCaption("");
      setImage(null);
    },
    onError: (error) => {
      console.error("Post upload failed:", error.message);
      alert("حدث خطأ أثناء النشر!");
    },
  });

  // ✅ تحديث الصورة عند التغيير
  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  // ✅ زر المشاركة
  const handleShare = () => {
    if (!postCaption.trim() && !image) {
      alert("يجب إدخال نص أو صورة!");
      return;
    }

    mutation.mutate({ postCaption, media: image || null });
  };

  return (
    <div className="PostShare">
      <img
        src={
          userData && userData.avatarUrl
            ? `https://${ip}${userData.avatarUrl}`
            : ProfileImage
        }
        alt="Profile"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = ProfileImage;
        }}
      />
      <div>
        <input
          type="text"
          placeholder="What's happening?"
          value={postCaption}
          onChange={(e) => setPostCaption(e.target.value)}
        />
        <div className="postOptions">
          <div
            className="option"
            style={{ color: "var(--photo)" }}
            onClick={() => imageRef.current.click()}
          >
            <HiOutlinePhoto className="icon" />
            Photo
          </div>
          <div className="option" style={{ color: "var(--video)" }}>
            <PiPlayCircle className="icon" />
            Video
          </div>
          <div className="option" style={{ color: "var(--location)" }}>
            <BiLocationPlus className="icon" />
            Location
          </div>
          <div className="option" style={{ color: "var(--schedule)" }}>
            <MdOutlineCalendarMonth className="icon" />
            Schedule
          </div>
          <button className="button ps-button" onClick={handleShare}>
            {mutation.isPending ? "Sharing..." : "Share"}
          </button>
          <div style={{ display: "none" }}>
            <input
              type="file"
              name="myImage"
              ref={imageRef}
              onChange={onImageChange}
            />
          </div>
        </div>
        {image && (
          <div className="previewImage">
            <AiOutlineClose onClick={() => setImage(null)} />
            <img src={URL.createObjectURL(image)} alt="Preview" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostShare;
