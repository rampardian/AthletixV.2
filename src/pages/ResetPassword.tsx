import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/utilities/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import {validatePassword, cn} from "@/utilities/utils";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isReset, setIsReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);


  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    const { criteria } = validatePassword(newPassword);
    setPasswordCriteria(criteria);
    setPassword(newPassword);
    // Check if passwords match when password changes
    if (confirmPassword) {
      setPasswordsMatch(newPassword === confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    // Check if passwords match
    if (newConfirmPassword) {
      setPasswordsMatch(password === newConfirmPassword);
    } else {
      setPasswordsMatch(null);
    }
  };

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const { isValid } = validatePassword(password);
    if (!isValid) {
      toast.error("Password does not meet requirements");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) toast.error(error.message);
    else {
      toast.success("Password has been reset successfully!");
      setIsReset(true);
    }
  };

  if (isReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center mb-4">
              <span className="text-3xl font-bold">ATHLETIX</span>
            </Link>
            <p className="text-muted-foreground">
              Your password has been updated successfully.
            </p>
          </div>

          <Card className="w-full max-w-md">
            <CardContent className="text-center space-y-4 py-8">
              <p className="text-sm text-muted-foreground">
                You can now sign in using your new password.
              </p>
              <Link to="/login" className="w-full">
                <Button className="w-full">Back to Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center mb-4">
            <span className="text-3xl font-bold">ATHLETIX</span>
          </Link>
          <p className="text-muted-foreground">
            Set your new password to access your account again
          </p>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter and confirm your new password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    className={cn(
                      "pr-10",
                      password && !passwordCriteria.minLength && !passwordCriteria.hasUppercase && !passwordCriteria.hasLowercase && !passwordCriteria.hasNumber && !passwordCriteria.hasSpecialChar && "border-red-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="text-sm mt-1 space-y-1">
                    <p
                      className={cn(
                        "font-medium",
                        passwordCriteria.minLength &&
                        passwordCriteria.hasUppercase &&
                        passwordCriteria.hasLowercase &&
                        passwordCriteria.hasNumber &&
                        passwordCriteria.hasSpecialChar
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {passwordCriteria.minLength &&
                      passwordCriteria.hasUppercase &&
                      passwordCriteria.hasLowercase &&
                      passwordCriteria.hasNumber &&
                      passwordCriteria.hasSpecialChar
                        ? "✓ Strong password"
                        : "Password must include:"}
                    </p>
                    {!(passwordCriteria.minLength &&
                      passwordCriteria.hasUppercase &&
                      passwordCriteria.hasLowercase &&
                      passwordCriteria.hasNumber &&
                      passwordCriteria.hasSpecialChar) && (
                      <ul className="text-xs text-gray-600 space-y-0.5 ml-4">
                        <li className={cn(passwordCriteria.minLength ? "text-green-600" : "text-red-600")}>
                          {passwordCriteria.minLength ? "✓" : "✗"} At least 8 characters
                        </li>
                        <li className={cn(passwordCriteria.hasUppercase ? "text-green-600" : "text-red-600")}>
                          {passwordCriteria.hasUppercase ? "✓" : "✗"} One uppercase letter
                        </li>
                        <li className={cn(passwordCriteria.hasLowercase ? "text-green-600" : "text-red-600")}>
                          {passwordCriteria.hasLowercase ? "✓" : "✗"} One lowercase letter
                        </li>
                        <li className={cn(passwordCriteria.hasNumber ? "text-green-600" : "text-red-600")}>
                          {passwordCriteria.hasNumber ? "✓" : "✗"} One number
                        </li>
                        <li className={cn(passwordCriteria.hasSpecialChar ? "text-green-600" : "text-red-600")}>
                          {passwordCriteria.hasSpecialChar ? "✓" : "✗"} One special character
                        </li>
                      </ul>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    className={cn(
                      "pr-10",
                      passwordsMatch === false && "border-red-500",
                      passwordsMatch === true && "border-green-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && passwordsMatch !== null && (
                  <div className="flex items-center gap-2 text-sm mt-1">
                    {passwordsMatch ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-medium">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full">
                Reset Password
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Link to="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
