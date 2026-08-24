import {apiSuccess} from "@/lib/apiResponse";
import {validateFxModel} from "@/lib/modelValidation";
export const revalidate=21600;
export async function GET(){const fx=await validateFxModel();return apiSuccess({fx,standard:"compatibility-only",note:"Passing means the existing regime model behaves structurally on this history. It is not a claim of predictive performance."},{headers:{"Cache-Control":"public, s-maxage=21600, stale-while-revalidate=43200"}});}
