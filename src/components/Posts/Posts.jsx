import React from "react";
import "./Posts.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Post from "../Post/Post";
import { useLocation } from "react-router-dom";

const token = localStorage.getItem("token");

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
    return { name: "Unknown", avatarUrl: null }; // بيانات افتراضية عند الفشل
  }
};

const fetchPosts = async (scope, isProfilePage, userId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized: No Token Found");

  const url = isProfilePage
    ? `https://graduation.amiralsayed.me/api/posts/user/${userId}`
    : "https://graduation.amiralsayed.me/api/posts";

  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: isProfilePage
        ? {}
        : {
            page: 1,
            limit: 10,
            scope,
          },
    });

    const posts = res.data.data;

    // جلب بيانات المستخدم لكل منشور
    const postsWithUserData = await Promise.all(
      posts.map(async (post) => {
        const userId = post.author; // ✅ استخدام author بدلاً من userId
        const userData = await fetchUser(userId);
        return { ...post, user: userData };
      })
    );

    return postsWithUserData;
  } catch (error) {
    if (isProfilePage && error.response?.status === 404) {
      // المستخدم لسه معندوش بوستات
      return []; // ✅ رجّع Array فاضية بدال ما ترمي Error
    }
    throw error; // أي خطأ تاني نرميه عادي
  }
};

const Posts = ({ scope }) => {
  const location = useLocation();
  const userId = localStorage.getItem("userId"); // احصل على `userId` المخزن
  const isProfilePage = location.pathname.startsWith("/profile");

  const { data, isLoading, error } = useQuery({
    queryKey: isProfilePage ? ["userPosts", userId] : ["posts", scope], // ✅ نفس المفتاح المستخدم في PostShare.jsx
    queryFn: () => fetchPosts(scope, isProfilePage, userId),
    staleTime: 5000,
    retry: false,
  });

  if (isLoading) return <p>Loading posts...</p>;
  if (error) return <p>Error loading posts: {error.message}</p>;

  return (
    <div className="Posts">
      {isProfilePage && data.length === 0 ? (
        <div className="no-posts-message">
          <p>No Posts yet.</p>
        </div>
      ) : (
        data
          ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((post, index) => (
            <Post data={post} id={index} key={post._id || index} />
          ))
      )}
    </div>
  );
};

export default Posts;
