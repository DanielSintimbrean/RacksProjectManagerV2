import { Dialog } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  github: z.string(),
  discord: z.string(),
  email: z.string(),
});

export default function MyDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  console.log("isOpen", isOpen);
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50 m-10"
    >
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 m-10 flex items-center justify-center">
        <Dialog.Panel className="w-full max-w-md rounded bg-gray-900 p-10 text-center text-neutral-content">
          <Dialog.Title className={"m-5  font-mono  text-lg capitalize"}>
            Completar registro
          </Dialog.Title>
          <Dialog.Description className={"m-3"}>
            Completa tus datos para que puedas registrarte en racks community
            🎩.
          </Dialog.Description>

          <form className="" onSubmit={handleSubmit((d) => console.log(d))}>
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
      </div>
    </Dialog>
  );
}
