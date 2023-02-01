import { Dialog, Listbox, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment } from "react";
import { useForm } from "react-hook-form";
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
  const { register, handleSubmit, getValues, setValue } = useForm<SchemaType>({
    resolver: zodResolver(schema),
  });

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

              <form className="" onSubmit={handleSubmit((d) => console.log(d))}>
                <Listbox
                  value={getValues("avatar")}
                  onChange={(v) => setValue("avatar", v)}
                >
                  <Listbox.Button>
                    Mr.Crypto #{getValues("avatar")?.id}
                  </Listbox.Button>
                  <Listbox.Options>
                    {data?.data?.map((mrc) => (
                      <Listbox.Option key={mrc.id} value={mrc}>
                        Mr.Crypto #{mrc.id}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Listbox>
                <input
                  className="input-primary input my-3"
                  placeholder="Nombre"
                  {...register("name")}
                />
                <input
                  className="input-primary input my-3"
                  placeholder="Email"
                  {...register("email")}
                />
                <input
                  className="input-primary input my-3"
                  placeholder="Github"
                  {...register("github")}
                />
                <input
                  className="input-primary input my-3"
                  placeholder="Discord"
                  {...register("discord")}
                />
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
