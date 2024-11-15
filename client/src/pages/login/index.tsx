import useWindowSize from '../../hooks/use-window-size';
import TextField from '../../components/atoms/text-field/text-field';
import { KeyboardEvent, useContext, useState } from 'react';
import { ToastContext } from '../../contexts/toast-context';
import Logo from '../../components/atoms/logo';
import validator from 'validator';
import Spinner from '../../components/atoms/spinner';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/use-auth';
import AuthService from '../../services/auth-service';
import axios, { AxiosError } from 'axios';

const Login = () => {
  const { widthStr, heightStr } = useWindowSize();
  const [email, setEmail] = useState('');
  const [emailErrors, setEmailErrors] = useState<Array<string>>([]);
  const [password, setPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Array<string>>([]);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    setEmailErrors([]);
    setPasswordErrors([]);
    let isValid = true;

    if (!validator.isEmail(email)) {
      setEmailErrors(['Must enter a valid email.']);
      isValid = false;
    }
    if (!password.length) {
      setPasswordErrors(['Must enter a password.']);
      isValid = false;
    }

    return isValid;
  };

  const loginUser = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await AuthService.login({ email, password });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        response.data.data;
      login(newAccessToken, newRefreshToken);
      success('Successfully logged in!');
      navigate('/document/create');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const { response } = err as AxiosError;
        if (response?.data.errors.length > 0) {
          error(response?.data.errors[0].msg);
        } else {
          error('Incorrect username or password.');
        }
      } else {
        error('An unknown error has occured. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOnKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter') loginUser();
  };

  const handleOnInputEmail = (value: string) => {
    setEmailErrors([]);
    setEmail(value);
  };

  const handleOnInputPassword = (value: string) => {
    setPasswordErrors([]);
    setPassword(value);
  };

  return (
    <div
  onKeyPress={handleOnKeyPress}
  className="min-h-screen w-full flex flex-col justify-center items-center p-6 bg-gray-100 dark:bg-slate-900 text-primary"
  style={{ width: widthStr, height: heightStr }}
>
  <div className="w-full max-w-md transform transition-all duration-200 hover:scale-[1.01]">
    <div className="bg-white dark:bg-slate-800 rounded-lg border-primary shadow-lg border dark:border-0 dark:shadow-xl p-8">
      <div className="flex flex-col space-y-6">
        <div className="w-full text-center flex flex-col justify-center items-center space-y-3">
          <Logo/>
          <h1 className="font-semibold text-2xl tracking-tight">Sign in</h1>
          <p className="font-medium text-gray-600 dark:text-gray-400">to continue to Docs</p>
        </div>

        <div className="space-y-5">
          <TextField
            value={email}
            onInput={handleOnInputEmail}
            label="Email"
            color="secondary"
            errors={emailErrors}
          />
          <Link
            tabIndex={-1}
            to="/register"
            className="text-sm hover:underline font-medium text-[#008000] dark:text-[#008000] inline-block transition-colors duration-200"
          >
            Need an account?
          </Link>
          <TextField
            value={password}
            onInput={handleOnInputPassword}
            label="Password"
            type="password"
            color="secondary"
            errors={passwordErrors}
          />
          <button
            tabIndex={-1}
            className="text-sm hover:underline font-medium text-[#008000] dark:text-[#008000] inline-block transition-colors duration-200"
          >
            Forgot Password?
          </button>
        </div>

        <button
          onClick={loginUser}
          disabled={loading}
          className="w-full bg-[#008000] text-white font-medium px-4 py-3 rounded-lg
            hover:bg-[#008000] transition-colors duration-200 
            focus:outline-none focus:ring-2 focus:ring-[#008000] focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            flex justify-center items-center space-x-2"
        >
          <span className={`${loading && 'opacity-0'}`}>Sign In</span>
          {loading && <Spinner size="sm" />}
        </button>
      </div>
    </div>

    <div className="flex justify-center space-x-6 mt-6 text-sm">
      <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
        Terms
      </button>
      <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
        Privacy Policy
      </button>
    </div>
  </div>
</div>
  );
};

export default Login;