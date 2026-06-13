import {
  fail,
  getRouteParams,
  handleApiError,
  ok,
  type RouteContext,
} from "@/lib/api/response"
import { getPreConsultResult } from "@/lib/pre-consult"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import {
  toProfessionalPreConsultResult,
  toResidentPreConsultResult,
} from "@/server/dto/pre-consult-result-dto"

export async function GET(request: Request, context: RouteContext<{ id: string }>) {
  try {
    const { id } = await getRouteParams(context)
    const result = await getPreConsultResult(id)

    if (!result) {
      return fail("not_found", "预问诊会话不存在", 404)
    }

    const view = new URL(request.url).searchParams.get("view")

    if (view === "legacy") {
      const auth = getAuthContext(request)
      requirePermission(auth, "feedback:write")

      return ok(result)
    }

    if (view === "professional") {
      const auth = getAuthContext(request)
      requirePermission(auth, "feedback:write")

      return ok(toProfessionalPreConsultResult(result))
    }

    return ok(toResidentPreConsultResult(result))
  } catch (error) {
    return handleApiError(error, "pre_consult_result_failed", "预问诊结果读取失败")
  }
}
