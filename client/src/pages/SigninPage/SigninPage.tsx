import SigninForm from "@/components/SigninnForm/SigninForm";
import SigninMountains from "@/components/SigninMountains/SigninMountains";

export default function SigninPage() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <SigninMountains />
      <div className="relative z-10">
        <SigninForm />
      </div>
    </div>
  );
}
