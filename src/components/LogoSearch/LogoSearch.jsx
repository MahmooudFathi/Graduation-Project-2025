import React, { useEffect, useRef, useState } from "react";
import ProfileImage from "../../img/pngtree-male-avatar-vector-icon-png-image_691612.jpg";
import { CiSearch } from "react-icons/ci";
import { useQuery } from "@tanstack/react-query";
import "./LogoSearch.css";
import { Link } from "react-router-dom";

const LogoSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // تطبيق Debounce على مصطلح البحث
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchTerm.trim()) {
        setDebouncedSearchTerm(searchTerm);
        setShowResults(true);
      } else {
        setDebouncedSearchTerm("");
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  // دالة لتنفيذ البحث
  const fetchUsers = async (query) => {
    if (!query) return { data: [] };

    const token = localStorage.getItem("token") || "";
    const response = await fetch(
      `https://graduation.amiralsayed.me/api/users/search?q=${encodeURIComponent(
        query
      )}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to search users");
    }

    return result;
  };

  // استخدام Tanstack React Query للبحث
  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["searchUsers", debouncedSearchTerm],
    queryFn: () => fetchUsers(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 0,
    staleTime: 1000 * 60, // البيانات تظل صالحة لمدة دقيقة
    keepPreviousData: true, // الاحتفاظ بالنتائج السابقة أثناء تحميل النتائج الجديدة
  });

  // التعامل مع النقرات خارج مكون البحث لإغلاق النتائج
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // دالة لمعالجة تغيير قيمة البحث
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  return (
    <div className="LogoSearch" ref={searchRef}>
      <div className="Search">
        <input
          type="text"
          aria-label="Search users"
          placeholder="#Explore"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => {
            if (searchTerm.trim().length > 0) {
              setShowResults(true);
            }
          }}
        />
        <div
          className="s-icon"
          role="button"
          tabIndex={0}
          onClick={() => {
            document.querySelector(".Search input").focus();
          }}
        >
          <CiSearch className="icon" />
        </div>
        {showResults && (
          <div className="search-results">
            {isLoading ? (
              <div className="search-loading">Searching...</div>
            ) : error ? (
              <div className="search-error">
                Error: {error.message || "Please try again later"}
              </div>
            ) : searchResults?.data?.length > 0 ? (
              <>
                {searchResults.data.map((user) => (
                  <Link to={`/user/${user.centralUsrId}`} key={user._id}>
                    <div className="search-result-item">
                      <img
                        loading="lazy"
                        src={
                          user.avatarUrl
                            ? `https://graduation.amiralsayed.me${user.avatarUrl}`
                            : ProfileImage
                        }
                        alt={user.localUserName}
                        className="search-avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = ProfileImage;
                        }}
                      />
                      <div className="user-info">
                        <div className="user-name">{user.localUserName}</div>
                        <div className="user-username">@{user.userName}</div>
                        {user.bio && <div className="user-bio">{user.bio}</div>}
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="see-all-results">See all results</div>
              </>
            ) : (
              <div className="no-results">No users found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoSearch;
