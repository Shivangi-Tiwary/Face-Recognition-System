import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/dashboard.scss";

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div className="stats">
          <div className="card">
            <h4>Total Users</h4>
            <p>120</p>
          </div>

          <div className="card">
            <h4>Faces Stored</h4>
            <p>350</p>
          </div>

          <div className="card">
            <h4>Recognitions Today</h4>
            <p>45</p>
          </div>
        </div>

        <div className="activity">
          <h3>Recent Recognition Activity</h3>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Jyot Sheth</td>
                <td>12-01-2026</td>
                <td>09:10 AM</td>
                <td>Recognized</td>
              </tr>
              <tr>
                <td>Unknown</td>
                <td>12-01-2026</td>
                <td>09:15 AM</td>
                <td>Not Recognized</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
