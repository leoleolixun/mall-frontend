import type React from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
}

const authCopy = {
  badge: "Mall 会员中心",
  title: "登录 / 注册会员",
  subtitle: "开启专属购物体验",
  description: "同步购物车、管理收货地址、实时查看订单进度，还可领取会员专属优惠，让购物更方便。",
  benefits: ["购物车同步", "收货地址管理", "订单实时追踪", "会员专属优惠"]
};

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange }) => {
  const [visible, setVisible] = useState(false);

  return (
    <label className="password-field">
      <input
        placeholder="请输入密码"
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "隐藏密码" : "显示密码"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </label>
  );
};

export const AuthPage: React.FC<{
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string, nickname: string) => Promise<void>;
}> = ({ onLogin, onRegister }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (nextMode: "login" | "register"): void => {
    setMode(nextMode);
    setFormError("");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const normalizedUsername = username.trim();
    const normalizedNickname = nickname.trim();
    if (!normalizedUsername || !password.trim()) {
      setFormError("请输入用户名和密码");
      return;
    }
    if (mode === "register" && password.trim().length < 6) {
      setFormError("密码长度不能少于 6 位");
      return;
    }

    setFormError("");
    setSubmitting(true);
    if (mode === "login") {
      await onLogin(normalizedUsername, password);
    } else {
      await onRegister(normalizedUsername, password, normalizedNickname);
    }
    setSubmitting(false);
  };

  return (
  <div className="auth-layout">
    <section className="auth-visual">
      <span className="badge">{authCopy.badge}</span>
      <h1>{authCopy.title}</h1>
      <strong>{authCopy.subtitle}</strong>
      <p>{authCopy.description}</p>
      <div className="benefit-grid">
        {authCopy.benefits.map((item) => <span key={item}>{item}</span>)}
      </div>
    </section>
    <form className="panel login-card" onSubmit={(event) => void submit(event)}>
      <div className="auth-tabs">
        <button disabled={submitting} type="button" className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>账号登录</button>
        <button disabled={submitting} type="button" className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")}>快速注册</button>
      </div>
      {mode === "login" ? (
        <>
          <input placeholder="请输入用户名" value={username} onChange={(event) => setUsername(event.target.value)} />
          <PasswordInput value={password} onChange={setPassword} />
          {formError ? <p className="auth-form-error">{formError}</p> : null}
          <button className="primary-button solid" disabled={submitting} type="submit">{submitting ? "登录中" : "登录"}</button>
        </>
      ) : (
        <>
          <input placeholder="用户名 / 手机号" value={username} onChange={(event) => setUsername(event.target.value)} />
          <input placeholder="昵称" value={nickname} onChange={(event) => setNickname(event.target.value)} />
          <PasswordInput value={password} onChange={setPassword} />
          {formError ? <p className="auth-form-error">{formError}</p> : null}
          <button className="primary-button solid" disabled={submitting} type="submit">{submitting ? "创建中" : "创建账号"}</button>
          <button type="button" className="plain-button" disabled={submitting} onClick={() => switchMode("login")}>已有账号，去登录</button>
        </>
      )}
    </form>
  </div>
  );
};

export default AuthPage;
