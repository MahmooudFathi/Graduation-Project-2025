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

function ProfileModal({ modalOpened, setModalOpened }) {
  const overlayColor = useColorModeValue("gray.200", "gray.900");

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
            <FormLabel>First Name</FormLabel>
            <Input placeholder="First Name" />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Last Name</FormLabel>
            <Input placeholder="Last Name" />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Works at</FormLabel>
            <Input placeholder="Works at" />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Lives in</FormLabel>
            <Input placeholder="Lives in" />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Country</FormLabel>
            <Input placeholder="Country" />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Relationship Status</FormLabel>
            <Input placeholder="Relationship Status" />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Profile Image</FormLabel>
            <Input type="file" />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Cover Image</FormLabel>
            <Input type="file" />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3}>
            Update
          </Button>
          <Button onClick={() => setModalOpened(false)}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ProfileModal;
