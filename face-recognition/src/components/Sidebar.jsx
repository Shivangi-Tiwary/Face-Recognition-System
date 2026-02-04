import "../styles/sidebar.scss";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="logo">FaceSys</h2>
      <ul>
        <li>Dashboard</li>
        <li>Face Recognition</li>
        <li>Users</li>
        <li>Attendance</li>
        <li>Settings</li>
      </ul>
    </div>
  );
};

export default Sidebar;
