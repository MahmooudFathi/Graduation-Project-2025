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
} from "@chakra-ui/react";
import React, { useState, useRef } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";

function ProfileModal({ modalOpened, setModalOpened }) {
  const ip = "40.127.8.41";
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState(user?.userName || "");
  const avatarInputRef = useRef(null);
  const queryClient = useQueryClient();
  const overlayColor = useColorModeValue("gray.200", "gray.900");

  const updateUsernameMutation = useMutation({
    mutationFn: async (newUsername) => {
      const response = await axios.put(
        `http://${ip}/api/users/me`,
        { userName: newUsername },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setUser((prev) => ({ ...prev, userName: data.user.userName }));
      queryClient.invalidateQueries(["user"]);
      toast.success("Username updated successfully! 🎉");
    },
    onError: (error) => {
      toast.error(
        `Error: ${error.response?.data?.message || "Failed to update username"}`
      );
    },
  });

  // ✅ ميوتيشن لتحديث الصورة الشخصية
  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarFile) => {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await axios.put(
        `http://${ip}/api/users/me/avatar`,
        formData,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setUser((prev) => ({ ...prev, avatarUrl: data.user.avatarUrl }));
      queryClient.invalidateQueries(["user"]);
      toast.success("Avatar updated successfully! 🎉");
    },
    onError: (error) => {
      toast.error(
        `Error: ${error.response?.data?.message || "Failed to update avatar"}`
      );
    },
  });

  // دالة تحديث البيانات معًا (اسم المستخدم + الصورة)
  const handleUpdate = async () => {
    let promises = [];

    if (username.trim() && username !== user.userName) {
      promises.push(updateUsernameMutation.mutateAsync(username));
    }

    const file = avatarInputRef.current?.files[0];
    if (file) {
      promises.push(updateAvatarMutation.mutateAsync(file));
    }

    // تشغيل التحديثات معًا
    if (promises.length > 0) {
      try {
        await Promise.all(promises);
        setModalOpened(false); // إغلاق المودال بعد التحديث الناجح
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
            <Input placeholder="Your Bio" />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Profile Image</FormLabel>
            <Input type="file" ref={avatarInputRef} />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Cover Image</FormLabel>
            <Input type="file" />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleUpdate}
            isLoading={updateUsernameMutation.isLoading || updateAvatarMutation.isLoading}
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
