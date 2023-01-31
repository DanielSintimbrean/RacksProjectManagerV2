import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useAuth } from "../hooks/useAuth";
import { useSession } from "../hooks/useSession";
import { useRegisterContributor } from "../hooks/wagmi/useRegisterContributor";
import RegisterModal from "./RegisterModal";

export default function Header() {
  const session = useSession();
  const authenticated = session.authenticated;
  const { isDisconnected, address } = useAccount();
  const { logout, isLoggingOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Need to use isLoggingOut to avoid to much re-renders when logging out.
  if (
    authenticated &&
    !isLoggingOut &&
    (isDisconnected || session.user.address !== address)
  ) {
    logout();
  }

  const { registerContributor } = useRegisterContributor();

  return (
    <header className="mx-5 flex min-h-[10vh] flex-row items-center justify-between rounded-b-xl bg-gradient-to-br from-neutral to-neutral-focus text-red-50">
      <div className="m-5">
        <ConnectButton showBalance={false} accountStatus={"address"} />
      </div>
      <nav className="">
        <ul className="m-5 flex flex-row gap-5">
          {authenticated && session.user.registered == "false" && (
            <button
              className="btn-primary btn"
              onClick={() => registerContributor && registerContributor()}
            >
              Regístrate como member
            </button>
          )}
          {authenticated && session.user.registered == "pending" && (
            <button
              className="btn-secondary btn"
              onClick={() => setIsOpen(true)}
            >
              Completa el registro
            </button>
          )}
          <li className="">
            <Link href="/">Home</Link>
          </li>
          <li className="">
            <Link href={authenticated ? "/profile" : "/"}>Profile</Link>
          </li>
        </ul>
      </nav>
      <RegisterModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </header>
  );
}
