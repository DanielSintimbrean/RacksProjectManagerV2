import { Listbox } from "@headlessui/react";
import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "../componests/Layout";
import { useSession } from "../hooks/useSession";
import { trpc } from "../utils/trpc";

const ProfilePage: NextPage = () => {
  const trpcUtils = trpc.useContext();
  const router = useRouter();

  const session = useSession();
  const [newName, setNewName] = useState("");

  const [newMrc, setNewMrc] = useState({ id: 0, image: "" });

  const { data: mrcImages } = trpc.mrCrypto.getMrcNftImages.useQuery();

  const { mutateAsync: changeAvatar } = trpc.profile.changeAvatar.useMutation({
    onSuccess: () => trpcUtils.auth.getSession.invalidate(),
  });

  const { mutateAsync: changeNameAsync } = trpc.profile.changeName.useMutation({
    onSuccess: () => {
      trpcUtils.auth.getSession.invalidate();
    },
  });

  if (!session.authenticated && !session.loading) {
    router.push("/");
  }

  if (!session.authenticated) {
    return <Layout>Loading...</Layout>;
  }

  return (
    <Layout>
      <div className="flex flex-col items-center gap-12">
        <div className="container flex w-screen flex-col items-center justify-center gap-12 px-4 py-16 text-white">
          <h1 className="flex text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Profile
          </h1>
          <h2 className="text-3xl">
            Hello 👋 <b className="uppercase">{session.user.name}</b>!
          </h2>
        </div>
        <div>
          <form
            className="form-control flex flex-col items-center gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              changeNameAsync({ newName });
            }}
          >
            <input
              className="input m-2"
              type="text"
              name="name"
              id="name"
              placeholder="New Name"
              onChange={(e) => setNewName(e.target.value)}
            />
            <button type="submit" className="text-white">
              Change Name
            </button>
          </form>
          <label className="label">
            <span className="label-text">Mr.Crypto</span>
          </label>
          <div className="form-control relative mt-1 gap-4">
            <div className="grid place-items-center">
              <div className="avatar">
                <div className="mask mask-hexagon w-20">
                  <Image
                    src={
                      newMrc.image || session.user.avatar || "/unrevealed.png"
                    }
                    className=""
                    alt="profile picture"
                    fill={true}
                  />
                </div>
              </div>
            </div>
            <Listbox value={newMrc} onChange={(nm) => setNewMrc(nm)}>
              <Listbox.Button className={"input-primary input"}>
                Mr.Crypto #{newMrc.id}
              </Listbox.Button>
              <Listbox.Options
                className={
                  "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                }
              >
                {mrcImages?.data?.map((mrc) => (
                  <Listbox.Option
                    key={mrc.id}
                    value={mrc}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                      }`
                    }
                  >
                    Mr.Crypto #{mrc.id}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
            <button
              className="btn-primary btn"
              onClick={() => changeAvatar({ newAvatar: newMrc.image })}
            >
              Change Mr.Crypto
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-4 text-center text-white"></div>
        <div className="flex flex-row justify-center gap-4 p-48">
          {mrcImages &&
            mrcImages.data.map((mrc, i) => (
              <Image
                key={i}
                src={mrc.image}
                width={250}
                height={250}
                alt={"MRC"}
              />
            ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
