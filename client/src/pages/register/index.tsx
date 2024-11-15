import useWindowSize from '../../hooks/use-window-size';
import TextField from '../../components/atoms/text-field/text-field';
import { KeyboardEvent, useContext, useState } from 'react';
import { ToastContext } from '../../contexts/toast-context';
import Logo from '../../components/atoms/logo';
import validator from 'validator';
import Spinner from '../../components/atoms/spinner';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import AuthService from '../../services/auth-service';

const Register = () => {
  const { widthStr, heightStr } = useWindowSize();
  const [email, setEmail] = useState('');
  const [emailErrors, setEmailErrors] = useState<Array<string>>([]);
  const [loading, setLoading] = useState(false);
  const [password1, setPassword1] = useState('');
  const [password1Errors, setPassword1Errors] = useState<Array<string>>([]);
  const [password2, setPassword2] = useState('');
  const [password2Errors, setPassword2Errors] = useState<Array<string>>([]);
  const navigate = useNavigate();
  const { addToast, error } = useContext(ToastContext);

  const validate = () => {
    setEmailErrors([]);
    setPassword1Errors([]);
    setPassword2Errors([]);
    let isValid = true;

    if (!validator.isEmail(email)) {
      setEmailErrors(['Must enter a valid email.']);
      isValid = false;
    }
    if (!(password1.length >= 8 && password1.length <= 25)) {
      setPassword1Errors((prev) => [
        ...prev,
        'Password must be between 1 and 25 characters.',
      ]);
      isValid = false;
    }
    if (!/\d/.test(password1)) {
      setPassword1Errors((prev) => [
        ...prev,
        'Password must contain at least 1 number.',
      ]);
      isValid = false;
    }
    if (password1 !== password2) {
      setPassword2Errors(['Passwords do not match.']);
      isValid = false;
    }

    return isValid;
  };

  const register = async () => {
    if (!validate()) return;

    try {
      await AuthService.register({
        email,
        password1,
        password2,
      });

      addToast({
        title: `Successfully registered ${email}!`,
        body: 'Please check your inbox to verify your email address',
        color: 'success',
      });
      navigate('/login');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const { response } = err as AxiosError;
        const errors = (response as any).data.errors;
        const emailFieldErrors = errors
          .filter((error: any) => error.param === 'email')
          .map((error: any) => error.msg);
        const password1FieldErrors = errors
          .filter((error: any) => error.param === 'password1')
          .map((error: any) => error.msg);
        const passsword2FieldErrors = errors
          .filter((error: any) => error.param === 'password2')
          .map((error: any) => error.msg);

        if (emailFieldErrors) setEmailErrors(emailFieldErrors);
        if (password1FieldErrors) setPassword1Errors(password1FieldErrors);
        if (passsword2FieldErrors) setPassword2Errors(passsword2FieldErrors);

        if (!emailErrors && !password1FieldErrors && !passsword2FieldErrors) {
          error('An unknown error has occurred. Please try again');
        }
      } else {
        error('An unknown error has occurred. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOnKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter') register();
  };

  const handleOnInputEmail = (value: string) => {
    setEmailErrors([]);
    setEmail(value);
  };

  const handleOnInputPassword1 = (value: string) => {
    setPassword1Errors([]);
    setPassword1(value);
  };

  const handleOnInputPassword2 = (value: string) => {
    setPassword2Errors([]);
    setPassword2(value);
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
          <h1 className="font-semibold text-2xl tracking-tight">Sign up</h1>
          <p className="font-medium text-gray-600 dark:text-gray-400">for a Docs account</p>
        </div>

        <div className="space-y-5">
          <TextField
            value={email}
            onInput={handleOnInputEmail}
            label="Email"
            color="secondary"
            errors={emailErrors}
          />
          <TextField
            value={password1}
            onInput={handleOnInputPassword1}
            label="Password"
            type="password"
            color="secondary"
            errors={password1Errors}
          />
          <TextField
            value={password2}
            onInput={handleOnInputPassword2}
            label="Confirm Password"
            type="password"
            color="secondary"
            errors={password2Errors}
          />
          <Link
            to="/login"
            className="text-sm hover:underline font-medium text-[#008000] dark:text-[#008000] inline-block transition-colors duration-200"
          >
            Sign in instead
          </Link>
        </div>

        <button
          onClick={register}
          disabled={loading}
          className="w-full bg-[#008000] text-white font-medium px-4 py-3 rounded-lg
            hover:bg-[#006400] transition-all duration-200 
            focus:outline-none focus:ring-2 focus:ring-[#008000] focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transform hover:scale-[1.02]
            flex justify-center items-center space-x-2"
        >
          <span className={`${loading && 'opacity-0'}`}>Register</span>
          {loading && <Spinner size="sm" />}
        </button>
      </div>
    </div>

    <div className="flex justify-center space-x-6 mt-6">
      {/* <button className="text-sm font-medium text-[#008000] hover:text-[#006400] 
        transition-colors duration-200 hover:underline">
        Terms
      </button>
      <button className="text-sm font-medium text-[#008000] hover:text-[#006400]
        transition-colors duration-200 hover:underline">
        Privacy Policy
      </button> */}
      <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
        Terms
      </button>
      <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
        Privacy Policy
      </button>

    </div>
  </div>
</div>
  );
};

export default Register;