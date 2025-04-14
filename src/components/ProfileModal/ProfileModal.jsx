import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  useColorModeValue,
  Textarea,
} from "@chakra-ui/react";
import React, { useState, useRef } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ProfileModal({ modalOpened, setModalOpened }) {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState(user?.userName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const overlayColor = useColorModeValue("gray.200", "gray.900");

  const updateUsernameMutation = useMutation({
    mutationFn: async (newUsername) => {
      const response = await axios.put(
        "https://graduation.amiralsayed.me/api/users/me",
        { userName: newUsername },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setUser((prev) => ({ ...prev, userName: data.userName }));
      queryClient.invalidateQueries(["user"]);
      toast.success("Username updated successfully! 🎉");
    },
    onError: (error) => {
      toast.error(
        `Error: ${error.response?.data?.message || "Failed to update username"}`
      );
    },
  });

  const updateBioMutation = useMutation({
    mutationFn: async (newBio) => {
      const response = await axios.put(
        "https://graduation.amiralsayed.me/api/users/me/bio",
        { newBio },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setUser((prev) => ({ ...prev, bio: data.bio }));
      queryClient.invalidateQueries(["user"]);
      toast.success("Bio updated successfully! 📝");
    },
    onError: (error) => {
      toast.error(
        `Error: ${error.response?.data?.message || "Failed to update bio"}`
      );
    },
  });

  // ✅ ميوتيشن لتحديث الصورة الشخصية
  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarFile) => {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await axios.put(
        "https://graduation.amiralsayed.me/api/users/me/avatar",
        formData,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setUser((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));
      queryClient.invalidateQueries(["user"]);
      toast.success("Avatar updated successfully! 🎉");
    },
    onError: (error) => {
      toast.error(
        `Error: ${error.response?.data?.message || "Failed to update avatar"}`
      );
    },
  });

  // ✅ ميوتيشن لتحديث الصورة الخلفية
  const updateCoverMutation = useMutation({
    mutationFn: async (coverFile) => {
      const formData = new FormData();
      formData.append("cover", coverFile);

      const response = await axios.put(
        "https://graduation.amiralsayed.me/api/users/me/cover",
        formData,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setUser((prev) => ({ ...prev, coverUrl: data.coverUrl }));
      queryClient.invalidateQueries(["user"]);
      toast.success("Cover updated successfully! 🎉");
    },
    onError: (error) => {
      toast.error(
        `Error: ${error.response?.data?.message || "Failed to update cover"}`
      );
    },
  });

  // دالة تحديث البيانات معًا (اسم المستخدم + الصورة)
  const handleUpdate = async () => {
    let promises = [];

    if (username.trim() && username !== user.userName) {
      promises.push(updateUsernameMutation.mutateAsync(username));
    }

    if (bio.trim() && bio !== user.bio) {
      promises.push(updateBioMutation.mutateAsync(bio));
    }

    const avatarFile = avatarInputRef.current?.files[0];
    if (avatarFile) {
      promises.push(updateAvatarMutation.mutateAsync(avatarFile));
    }

    const coverFile = coverInputRef.current?.files[0];
    if (coverFile) {
      promises.push(updateCoverMutation.mutateAsync(coverFile));
    }

    // تشغيل التحديثات معًا
    if (promises.length > 0) {
      try {
        await Promise.all(promises);
        setModalOpened(false); // إغلاق المودال بعد التحديث الناجح
        navigate("/profile");
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    } else {
      toast.info("No changes detected.");
    }
  };

  return (
    <Modal isOpen={modalOpened} onClose={() => setModalOpened(false)} size="lg">
      <ModalOverlay
        bg={overlayColor}
        opacity="0.55"
        backdropFilter="blur(3px)"
      />
      <ModalContent p={4} borderRadius="md">
        <ModalHeader>Your Info</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>User Name</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="User Name"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Bio</FormLabel>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something about yourself..."
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Profile Image</FormLabel>
            <Input type="file" ref={avatarInputRef} accept="image/*" />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Cover Image</FormLabel>
            <Input type="file" ref={coverInputRef} accept="image/*" />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleUpdate}
            isLoading={
              updateUsernameMutation.isLoading ||
              updateAvatarMutation.isLoading ||
              updateCoverMutation.isLoading
            }
          >
            {" "}
            Update{" "}
          </Button>
          <Button onClick={() => setModalOpened(false)}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ProfileModal;
