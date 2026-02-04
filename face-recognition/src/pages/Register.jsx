import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.scss";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    enrollment: "",
    email: "",
    department: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Temporarily store data
    localStorage.setItem("studentData", JSON.stringify(formData));

    navigate("/camera"); // 👉 Go to camera page
  };

  return (
    <div className="register-container">
      <form className="register-card" onSubmit={handleSubmit}>
        <h2>Student Registration</h2>
        <p className="subtitle">
          Attendance Management using Face Recognition
        </p>

        <div className="input-group">
          <label>Student Name</label>
          <input name="name" onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Enrollment Number</label>
          <input name="enrollment" onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input type="email" name="email" onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Department</label>
          <select name="department" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
          </select>
        </div>

        <button type="submit">Proceed to Face Capture</button>
      </form>
    </div>
  );
};

export default Register;
