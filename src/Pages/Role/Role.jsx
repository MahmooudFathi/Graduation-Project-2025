import Navbar from "../../components/Navbar/Navbar";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import UsersTable from "../../components/UsersTable/UsersTable";
import "./Role.css";

const Role = () => {
  
  return (
    <>
      <Navbar />
      <div className="Role">
        <div className="ProfileSideRole">
          <ProfileCard location="homepage" />
        </div>
        <UsersTable />
      </div>
    </>
  );
};

export default Role;
