import React from "react";
import "./Posts.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Post from "../Post/Post";

const ip = "40.127.8.41";
const token = localStorage.getItem("token");

const fetchUser = async (userId) => {
  try {
    const res = await axios.get(`https://${ip}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return { name: "Unknown", avatarUrl: null }; // بيانات افتراضية عند الفشل
  }
};

const fetchPosts = async (scope) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized: No Token Found");

  const res = await axios.get(`https://${ip}/api/posts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
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
};

const Posts = ({ scope }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", scope], // ✅ نفس المفتاح المستخدم في PostShare.jsx
    queryFn: () => fetchPosts(scope),
    staleTime: 5000,
    retry: false,
  });

  if (isLoading) return <p>Loading posts...</p>;
  if (error) return <p>Error loading posts: {error.message}</p>;

  return (
    <div className="Posts">
      {data
        ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((post, index) => (
          <Post data={post} id={index} key={post._id || index} />
        ))}
    </div>
  );
};

export default Posts;
