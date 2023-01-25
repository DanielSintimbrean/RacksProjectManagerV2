# T3 for Web3

## T3 for Web3

Ejemplo de una aplicación full stack para web3 usado T3 Stack.

### Sobre el repositorio

La idea es crear un template donde tengas todo configurado para que la aplicación tenga:

* Un inicio de sesión con la cartera de MetaMask
* Typescript everywhere: tener inferencia de tipos a partir del abi del smartcontract tanto para wagmi como para ethers.
* Aprovechar todo lo que ofrece [create-t3](https://create.t3.gg) para una aplicación full-stack.

### Tecnologías usadas

[![Next](https://img.shields.io/badge/next.js-000000?style=for-the-badge\&logo=nextdotjs\&logoColor=white)](https://nextjs.org/) [![Tailwind](https://img.shields.io/badge/tailwind-0A1123?style=for-the-badge\&logo=TailwindCSS\&logoColor=38BDF8)](https://tailwindcss.com/) [![Prisma](https://img.shields.io/badge/prisma-1a202c?style=for-the-badge\&logo=prisma\&logoColor=white)](https://www.prisma.io/) [![Typescript](https://img.shields.io/badge/typescript-007ACC?style=for-the-badge\&logo=typescript\&logoColor=white)](https://www.typescriptlang.org/) [![tRPC](https://img.shields.io/badge/trpc-398CCB?style=for-the-badge\&logo=trpc\&logoColor=white)](https://trpc.io/)

&#x20;[![Ethers](https://img.shields.io/badge/ethers-063752?style=for-the-badge\&logo=ethereum\&logoColor=white)](https://docs.ethers.org/v5/) [![Siwe](README/SIWE.svg)](https://login.xyz/) [![Wagmi](README/WAGMI.svg)](https://wagmi.sh/)

### Empezar

* Clonar e instalar dependencias

```
git clone https://github.com/DanielSintimbrean/t3-for-web3.git
cd t3-for-web3
pnpm i
```

* Creamos fichero de variables de entorno y generamos la base de datos sqlite

```
cp .env.example .env
pnpm prisma db push
```

* Levantar el proyecto

```
pnpm dev
```

### ¿Cómo se ha creado?

#### Create T3 App

Se ha comenzado con el comando de `create-t3` (en mi caso lo hago con [pnpm](https://pnpm.io/))

```
pnpm create t3-app@latest
```

* Seleccionamos `Typescript`

y luego

* Seleccionamos todas las tecnología exceptuado NextAuth

![expect-nextauth](README/selectall-expect-nextauth.png)

* Le damos a que sí a todo lo demás

#### Instalar `iron-session`, `wagmi` , `ethers` y `siwe`

```
pnpm add iron-session wagmi ethers siwe@beta
```

#### Configurar `iron-session`

Creamos un fichero con el tipo de IronSession en [`src/types/iron-session/index.d.ts`](src/types/iron-session/index.d.ts) con lo siguiente:

```typescript
// src/types/iron-session/index.d.ts
import "iron-session";
import type { SiweMessage } from "siwe";

declare module "iron-session" {
  interface IronSessionData {
    nonce?: string;
    siwe?: SiweMessage;
    issuedAt?: string;
    expirationTime?: string;
    user?: {
      address: string;
      name: string;
    };
  }
}

```

Para integrar la session de iron-session con trpc, vamos modificar [src/server/trpc/context.ts](src/server/trpc/context.ts)

Así en los "métodos" de trpc tendremos el `ctx` la session de quien está realizando la petición a nuestro backend

```typescript
import { type inferAsyncReturnType } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { IronSession } from "iron-session";
import { getIronSession } from "iron-session";
import { sessionOptions } from "../../lib/iron-session";

import { prisma } from "../db/client";

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
type CreateContextOptions = {
  session: IronSession;
};

/** Use this helper for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 **/
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    prisma,
    session: opts.session,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  const session = await getIronSession(req, res, sessionOptions);

  return await createContextInner({ session });
};

export type Context = inferAsyncReturnType<typeof createContext>;
```

#### Crear los endpoints de tRPC para que se pueda autentificar un usuario

Creamos en [src/server/trpc/router/auth.ts](src/server/trpc/router/auth.ts) un nuevo router para la autentificación con los siguientes endpoints

* Nonce: esto tendrá que llamarse justo antes que se quiera hacer login para obtener el nonce que se tiene que firmar
* Verify: donde se comprueba que la firma del mensaje con el nonce es correcta
* Logout: para destruir la cookie de iron-session

#### Crear el login en el front

Creamos en [src/componests/siwe/Profile.tsx](src/componests/siwe/Profile.tsx) un componente que nos gestione el login.
