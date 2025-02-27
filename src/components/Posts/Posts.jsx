import React from "react";
import "./Posts.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Post from "../Post/Post";

const fetchPosts = async () => {
  const token = localStorage.getItem("token");// ✅ جلب التوكن المخزن
  if (!token) throw new Error("Unauthorized: No Token Found");

  const res = await axios.get("http://graduation.amiralsayed.me/api/posts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page: 2,
      limit: 10,
    },
  });

  return res.data; // ✅ يرجع بيانات البوستات
};

const Posts = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"], // ✅ نفس المفتاح المستخدم في PostShare.jsx
    queryFn: fetchPosts,
    staleTime: 5000,
    retry: false,
  });

  if (isLoading) return <p>Loading posts...</p>;
  if (error) return <p>Error loading posts: {error.message}</p>;

  return (
    <div className="Posts">
      {data?.data?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((post, index) => (
        <Post data={post} id={index} key={post._id || index} />
      ))}
    </div>
  );
};

export default Posts;
