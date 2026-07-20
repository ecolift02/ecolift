import LoginHero from "./components/LoginHero";
import LoginForm from "./components/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Visual */}
      <LoginHero />

      {/* Right Form */}
      <LoginForm />
    </div>
  );
};

export default Login;
