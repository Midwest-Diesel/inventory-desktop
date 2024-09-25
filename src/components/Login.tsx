import { getUser, loginUser } from "@/scripts/controllers/userController";
import Button from "./Library/Button";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { Layout } from "./Layout";
import { FormEvent, useState } from "react";
import Input from "./Library/Input";
import Error from "./Errors/Error";


export default function Login() {
  const [userData, setUserData] = useAtom<User>(userAtom);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_PASSWORD || '');
  const [loginBtnVisible, setLoginBtnVisible] = useState(true);
  const [error, setError] = useState('');

  const handleGetUser = async () => {
    const res = await getUser();
    setUserData(res);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const error = await loginUser({ username, password });
    setError(error);
    if (error) return;
    localStorage.setItem('username', username);
    setLoginBtnVisible(false);
    await handleGetUser();
    location.reload();
  };


  return (
    <Layout>
      <div className="login">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <Input
            label="Username"
            value={username}
            onChange={(e: any) => setUsername(e.target.value)}
            data-cy="username"
            required
          />
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            data-cy="password"
            required
          />
          { loginBtnVisible && <Button type="submit" variant={['fit', 'center']} data-cy="login-btn">Submit</Button> }
        </form>
        <Error msg={error} />
      </div>
    </Layout>
  );
}
