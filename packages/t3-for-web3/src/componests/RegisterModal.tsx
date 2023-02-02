import { Dialog, Listbox, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Fragment } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { trpc } from "../utils/trpc";

const schema = z.object({
  name: z.string(),
  github: z.string(),
  discord: z.string(),
  email: z.string(),
  avatar: z.object({ id: z.string(), image: z.string() }),
});

type SchemaType = z.infer<typeof schema>;

export default function MyDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { register, handleSubmit, getValues, setValue, control } =
    useForm<SchemaType>({
      resolver: zodResolver(schema),
    });

  const watch = useWatch({
    control,
    defaultValue: { avatar: { id: "", image: "/unrevealed.gif" } },
  });

  const id = watch.avatar?.id;
  const image = watch.avatar?.image;

  const { data } = trpc.mrCrypto.getMrcNftImages.useQuery();

  console.log("isOpen", isOpen);
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50 m-10"
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* The backdrop, rendered as a fixed sibling to the panel container */}
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 m-10 flex items-center justify-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded bg-gray-900 p-10 text-center text-neutral-content">
              <Dialog.Title className={"m-5  font-mono  text-lg capitalize"}>
                Completar registro
              </Dialog.Title>
              <Dialog.Description className={"m-3"}>
                Completa tus datos para que puedas registrarte en racks
                community 🎩.
              </Dialog.Description>

              <div className="avatar">
                <div className="mask mask-hexagon w-20">
                  <Image
                    src={image || "/unrevealed.gif"}
                    className=""
                    alt="profile picture"
                    fill={true}
                  />
                </div>
              </div>

              <form
                className="form-control mx-3 gap-3"
                onSubmit={handleSubmit((d) => console.log(d))}
              >
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Mr.Crypto</span>
                  </label>
                  <Listbox
                    value={getValues("avatar")}
                    onChange={(v) => setValue("avatar", v)}
                  >
                    <Listbox.Button className={"input-primary input"}>
                      Mr.Crypto #{id}
                    </Listbox.Button>
                    <Listbox.Options
                      className={
                        "absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                      }
                    >
                      {data?.data?.map((mrc) => (
                        <Listbox.Option
                          key={mrc.id}
                          value={mrc}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active
                                ? "bg-amber-100 text-amber-900"
                                : "text-gray-900"
                            }`
                          }
                        >
                          Mr.Crypto #{mrc.id}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Listbox>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nombre</span>
                  </label>
                  <input
                    className="input-primary input"
                    placeholder="Nombre"
                    {...register("name")}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    className="input-primary input"
                    placeholder="Email"
                    {...register("email")}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">GitHub</span>
                  </label>
                  <input
                    className="input-primary input"
                    placeholder="Github"
                    {...register("github")}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Discord</span>
                  </label>
                  <input
                    className="input-primary input"
                    placeholder="Discord"
                    {...register("discord")}
                  />
                </div>
                <div className="flex flex-row justify-between p-5">
                  <button
                    className="btn-error btn"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn-accent btn" type="submit">
                    Completar registro
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
