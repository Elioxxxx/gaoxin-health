import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type DoctorMedicalRecordView = {
  id: string
  institutionName: string
  departmentName: string
  visitDate: string
  chiefComplaint: string
  diagnosisText: string
  treatmentText: string
  sourceType: string
}

export function CrossInstitutionTimeline({
  records,
}: {
  records: DoctorMedicalRecordView[]
}) {
  return (
    <div className="space-y-4">
      <Card className="rounded-lg border-sky-100 bg-sky-50">
        <CardContent className="py-4 text-sm leading-6 text-sky-900">
          以下记录来自不同医疗机构、社区卫生服务中心、体检和随访记录，系统已整理为医生版健康档案摘要。
        </CardContent>
      </Card>

      {records.map((record) => (
        <Card key={record.id} className="rounded-lg border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
              <span>{record.institutionName}</span>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {record.sourceType}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm md:grid-cols-[120px_1fr]">
              <span className="font-medium text-slate-500">
                {new Date(record.visitDate).toLocaleDateString("zh-CN")}
              </span>
              <div className="space-y-2">
                <p className="font-medium text-slate-900">{record.departmentName}</p>
                <p className="text-slate-700">主诉：{record.chiefComplaint}</p>
                <p className="text-slate-700">诊断：{record.diagnosisText}</p>
                <p className="leading-6 text-slate-600">处理：{record.treatmentText}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
