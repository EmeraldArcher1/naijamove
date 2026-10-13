import { Button, Card } from "@/components/waka/ui";
import { COMPLAINT_LABEL, TERMS_VERSION, clock, docsReport, longDate } from "@/lib/waka/safety";
import { useWaka } from "@/lib/waka/store";
import { useState } from "react";

export function SafetyPanel() {
  const docs = useWaka((s) => s.docs);
  const suspended = useWaka((s) => s.suspended);
  const appeal = useWaka((s) => s.appeal);
  const complaints = useWaka((s) => s.complaints);
  const audit = useWaka((s) => s.audit);
  const resolveComplaint = useWaka((s) => s.resolveComplaint);
  const fileAppeal = useWaka((s) => s.fileAppeal);
  const decideAppeal = useWaka((s) => s.decideAppeal);
  const expireVehiclePapers = useWaka((s) => s.expireVehiclePapers);
  const renewVehiclePapers = useWaka((s) => s.renewVehiclePapers);
  const report = docsReport(docs);
  const [appealNote, setAppealNote] = useState("");
  const [appealError, setAppealError] = useState<string | null>(null);

  const standing = suspended ? "Suspended" : report.ok ? "Checks approved" : "Papers out of date";

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <p className="text-sm text-muted">Your standing</p>
        <h2 className="mt-1 font-display text-3xl leading-none tracking-tight">{standing}</h2>
        <p className="mt-2 text-sm text-muted">
          Terms on file are {TERMS_VERSION}. NaijaMove keeps this register on this phone in the preview. It does not call the police for you.
        </p>
      </Card>

      <Card className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Documents</h2>
        {report.rows.map((row) => (
          <p key={row.label} className="flex items-baseline justify-between gap-3 text-sm">
            <span>{row.label}</span>
            <span className={row.ok ? "text-good" : "text-bad"}>
              {row.ok ? "In date" : "Expired"} · {longDate(row.until)}
            </span>
          </p>
        ))}
        <div className="mt-2 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={expireVehiclePapers}>
            Mark papers expired
          </Button>
          <Button variant="secondary" onClick={renewVehiclePapers}>
            Renew papers
          </Button>
        </div>
      </Card>

      {suspended && (
        <Card className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Appeal</h2>
          {appeal !== "filed" ? (
            <>
              <textarea
                value={appealNote}
                onChange={(e) => setAppealNote(e.target.value)}
                rows={3}
                placeholder="Why should the suspension be lifted?"
                className="w-full rounded-md border border-line bg-bg px-3 py-2 text-base text-fg outline-none"
              />
              {appealError && <p className="text-sm text-bad">{appealError}</p>}
              <Button
                onClick={() => {
                  const message = fileAppeal(appealNote);
                  setAppealError(message);
                  if (!message) setAppealNote("");
                }}
              >
                File appeal
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">Appeal is on the record. The desk decides it here so the decision stays auditable.</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => decideAppeal(true)}>Reinstate</Button>
                <Button variant="secondary" onClick={() => decideAppeal(false)}>
                  Refuse appeal
                </Button>
              </div>
            </>
          )}
          {appeal === "refused" && <p className="text-sm text-bad">The last appeal was refused. You can file another.</p>}
        </Card>
      )}

      <Card className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Complaints</h2>
        {complaints.length === 0 && <p className="text-sm text-muted">None yet. A report from a live trip lands here.</p>}
        {complaints.map((item) => (
          <div key={item.id} className="border-t border-line pt-3 text-sm">
            <p className="font-medium">
              {COMPLAINT_LABEL[item.kind]} · trip {item.tripCode}
            </p>
            <p className="text-muted">
              {item.driverName} · {item.plate} · {item.status}
            </p>
            <p className="mt-1">{item.note}</p>
            {item.resolution && <p className="mt-1 text-muted">{item.resolution}</p>}
            {item.status === "open" && (
              <Button className="mt-2" variant="secondary" onClick={() => resolveComplaint(item.id)}>
                Mark resolved
              </Button>
            )}
          </div>
        ))}
      </Card>

      <Card className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Audit</h2>
        {audit.length === 0 && <p className="text-sm text-muted">Acceptances, suspensions, appeals, and closed complaints show here.</p>}
        {audit.slice(0, 12).map((entry) => (
          <p key={entry.id} className="text-sm">
            <span className="tabular-nums text-muted">{clock(entry.at)}</span> {entry.action}. {entry.detail}
          </p>
        ))}
      </Card>
    </div>
  );
}
