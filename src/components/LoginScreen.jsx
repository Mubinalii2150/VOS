import { useState } from "react";

export default function LoginScreen({ login }) {
  const [pass, setPass] = useState("");

  const submit = () => {
    login();
  };

  return (
    <div className="login-screen">
      <img src="/wallpaper.jpg" className="login-wall" alt=""  />

      <div className="login-card">
         <img src="/phoenix.svg" className="lock-logo" alt=""  /> 
        <h2>Mubin</h2>
        <p>VOS</p>

        <input
          type="password"
          placeholder="Enter password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        <button onClick={submit}>Sign In</button>
      </div>
    </div>
  );
}