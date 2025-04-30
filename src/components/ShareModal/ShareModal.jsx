import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";
import PostShare from "../PostShare/PostShare";

function ShareModal({ modalShareOpened, setModalShareOpened }) {
  const overlayColor = useColorModeValue("gray.200", "gray.900");

  return (
    <Modal isOpen={modalShareOpened} onClose={() => setModalShareOpened(false)} size="lg">
      <ModalOverlay
        bg={overlayColor}
        opacity="0.55"
        backdropFilter="blur(3px)"
      />
      <ModalContent p={4} borderRadius="md">
        <ModalCloseButton />
        <PostShare />
      </ModalContent>
    </Modal>
  );
}

export default ShareModal;
