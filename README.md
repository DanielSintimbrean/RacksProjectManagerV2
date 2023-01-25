# T3 for web3 with lerna

Una platilla monorepo donde se integra un proyecto Next.js(`T3-for-web3`) con un proyecto hardhat. Con el objetivo de conseguir un buen desempeño y una buena experiencia de desarrollo a la hora de construir aplicaciones en web3.

## Objetivos de la platilla

- Integrar herramientas utilizadas en el ecosistema web3 para crear la mejor experiencia de desarrollo
- Aplicar buenas prácticas de desarrollo para que pueda la aplicación pueda ser escalable y mantenible
- Instalar y empezar a construir, sin complicaciones
- Automatizar de tareas

## Que se ha utilizado

- Gestor de paquetes: pnpm
- Gestor de monorepo: lerna
- Git hooks: husky + lintstage
- Git commitizen
- Continuos Integration: Github Actions

### Proyecto Hardhat

- Hardhat + typescript
- Prettier + eslint
- Compilación para exportar los tipos de typechain al proyecto de next.js

### Proyecto Next.js

- Inspirado en create-t3-app, cambiando next-auth por iron-session y añadiendo librería para web3 (wagmi, siwe, ethers)
- Integrado tRPC con wagmi + siwe + ethers + rainbowkit
- Posibilidad de añadir el abi manualmente y que se generen los typos con typechain, o importar los smartcontract desde el proyecto de hardhat

## Empezar a usarlo

[Generar la plantilla](https://github.com/DanielSintimbrean/t3-for-web3-lerna/generate)

----

Clonamos el repositorio

```sh
git clone https://github.com/DanielSintimbrean/t3-for-web3-lerna
cd t3-for-web3-lerna
```

----

Instalamos dependencias

```
pnpm install
```


----
Copiamos el fichero `.env`

```
cp packages/t3-for-web3/.env.example packages/t3-for-web3/.env
```

----

Probamos la aplicación

```
pnpm dev 
```

Con esto lo que haremos es correr simultáneamente la aplicación de Next.js en `localhost:3000` y a su vez un nodo de hardhat en `localhost:8545`  con el contrato de Lock.sol recién desplegado
