import { getSignUpUrl, getSignInUrl } from "@workos-inc/authkit-nextjs";
import Link from "next/link";

export default async function SignUpPage() {
  const signUpUrl = await getSignUpUrl();
  const signInUrl = await getSignInUrl();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="text-3xl font-bold">Create an account</h2>
          <p className="mt-2 text-muted-foreground">
            Start building your digital cookbook
          </p>
        </div>

        <div className="space-y-4">
          <a
            href={signUpUrl}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign up with WorkOS
          </a>

          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
