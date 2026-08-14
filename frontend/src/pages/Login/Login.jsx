import LoginHero from "./Components/LoginHero";
import LoginForm from "./Components/LoginForm";

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
