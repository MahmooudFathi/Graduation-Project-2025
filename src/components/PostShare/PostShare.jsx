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

const PostShare = ({ scope }) => {
  const [postCaption, setPostCaption] = useState("");
  const [images, setImages] = useState([]);
  const imageRef = useRef();
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const token = localStorage.getItem("token");

  const mutation = useMutation({
    mutationFn: async (newPost) => {
      const formData = new FormData();
      formData.append("postCaption", newPost.postCaption);

      // ✅ إضافة الصورة فقط إذا كانت موجودة
      if (newPost.media && newPost.media.length > 0) {
        newPost.media.forEach((file) => {
          formData.append("media", file);
        });
      }

      if (newPost.scope) {
        formData.append("scope", newPost.scope);
      }

      const res = await fetch("https://graduation.amiralsayed.me/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to upload post");
      }

      return res.json();
    },
    onSuccess: () => {
      // ✅ تحديث قائمة البوستات بدون إعادة تحميل
      queryClient.invalidateQueries(["posts"]);
      queryClient.invalidateQueries(["userPosts", userData._id]);
      // ✅ إعادة تعيين الإدخال بعد النشر
      setPostCaption("");
      setImages([]);
    },
    onError: (error) => {
      console.error("Post upload failed:", error.message);
      alert("حدث خطأ أثناء النشر!");
    },
  });

  // ✅ تحديث الصورة عند التغيير
  const onImageChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      if (images.length + selectedFiles.length > 5) {
        alert("يمكنك رفع 5 صور كحد أقصى!");
        return;
      }
      setImages([...images, ...selectedFiles]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // ✅ زر المشاركة
  const handleShare = () => {
    if (!postCaption.trim() && !images.length === 0) {
      alert("يجب إدخال نص أو صورة!");
      return;
    }
    mutation.mutate({ postCaption, media: images, scope });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleShare();
    }
  };

  return (
    <div className="PostShare">
      <img
        loading="lazy"
        src={
          userData && userData.avatarUrl
            ? `https://graduation.amiralsayed.me${userData.avatarUrl}`
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
          onKeyDown={handleKeyDown}
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
              multiple
              accept="image/*"
              onChange={onImageChange}
            />
          </div>
        </div>
        {images.length > 0 && (
          <div className="previewImages">
            {images.map((img, index) => (
              <div key={index} className="previewImage">
                <AiOutlineClose onClick={() => removeImage(index)} />
                <img
                  loading="lazy"
                  src={URL.createObjectURL(img)}
                  alt={`Preview ${index}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostShare;
