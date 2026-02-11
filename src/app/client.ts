import { createThirdwebClient } from "thirdweb";

// Tu Client ID obtenido del dashboard de Agrocilities
const clientId = "0d1319582e1721e44f7a546562183d4e";

export const client = createThirdwebClient({
  clientId: clientId,
});