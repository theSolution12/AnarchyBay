import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { resendVerificationEmail } from "@/services/auth/auth.service";

export default function VerifyEmailPage() {
  const location = useLocation();
  const emailFromState = location.state?.email || "";
  const fromLogin = location.state?.fromLogin || false;
  
  const [email, setEmail] = useState(emailFromState);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setResending(true);
    try {
      await resendVerificationEmail(email);
      setResent(true);
      toast.success("Verification email sent! Check your inbox.");
    } catch (error) {
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="absolute inset-0 pattern-dots opacity-20" />
      
      <div className="absolute top-10 right-10 w-24 h-24 bg-[var(--mint)] border-3 border-black rotate-12 hidden lg:block" />
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-[var(--yellow-400)] border-3 border-black -rotate-6 hidden lg:block" />

      <div className="w-full max-w-md relative">
        <Link to="/" className="flex items-center gap-3 mb-8 justify-center group">
          <img 
            src="/favicon_io/android-chrome-192x192.png" 
            alt="AnarchyBay" 
            className="w-12 h-12 border-3 border-black group-hover:rotate-6 transition-transform"
          />
          <span className="font-black text-3xl">AnarchyBay</span>
        </Link>

        <div className="bg-white border-3 border-black shadow-[8px_8px_0px_var(--black)] p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-[var(--mint)] border-3 border-black flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black mb-2">
              {fromLogin ? "Email Not Verified" : "Verify Your Email"}
            </h1>
            <p className="text-gray-600">
              {fromLogin 
                ? "Your email address hasn't been verified yet. Please check your inbox and click the verification link."
                : "We've sent a verification link to your email address. Please check your inbox and click the link to verify your account."
              }
            </p>
          </div>

          {emailFromState && (
            <div className="mb-6 p-4 bg-[var(--pink-50)] border-3 border-black">
              <p className="text-sm font-bold text-center">
                Email sent to: <span className="text-[var(--pink-600)]">{emailFromState}</span>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300">
              <h3 className="font-bold text-sm uppercase mb-2">What to do next:</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex gap-2">
                  <span className="font-bold text-[var(--pink-500)]">1.</span>
                  Check your email inbox (and spam folder)
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-[var(--pink-500)]">2.</span>
                  Click the verification link in the email
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-[var(--pink-500)]">3.</span>
                  You'll be redirected back to login
                </li>
              </ol>
            </div>

            <div className="border-t-3 border-black pt-4">
              <p className="text-sm text-gray-500 mb-3 text-center">Didn't receive the email?</p>
              
              {!emailFromState && (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 font-medium bg-white border-3 border-black focus:outline-none focus:shadow-[4px_4px_0px_var(--black)] transition-all mb-3"
                />
              )}
              
              <button
                onClick={handleResend}
                disabled={resending || resent}
                className="w-full py-3 font-bold uppercase bg-[var(--yellow-400)] border-3 border-black shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_var(--black)] transition-all disabled:opacity-50"
              >
                {resending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : resent ? (
                  "Email Sent!"
                ) : (
                  "Resend Verification Email"
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200 flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/login" 
              className="text-center px-4 py-2 font-bold text-[var(--pink-600)] hover:underline"
            >
              Back to Login
            </Link>
            <Link 
              to="/signup" 
              className="text-center px-4 py-2 font-bold text-gray-600 hover:underline"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}